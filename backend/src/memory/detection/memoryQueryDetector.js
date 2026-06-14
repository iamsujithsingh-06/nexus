/**
 * Memory Query Detector — Determines whether a user message is asking about
 * stored personal information, and if so, what type of memory to retrieve.
 *
 * This runs AFTER the conversation classifier to catch cases where:
 *   "What's my name?" → question mode, but needs memory lookup
 *   "What goals do I have?" → general mode, but needs memory lookup
 *   "Tell me about my projects" → general mode, but needs memory lookup
 */

// Patterns that indicate the user is asking about a specific stored fact
const FACT_QUERIES = [
  // Name queries
  { pattern: /what('s| is) my name/i, key: 'user_name', type: 'profile' },
  { pattern: /(who am i|do you know my name|remember my name)/i, key: 'user_name', type: 'profile' },

  // Age / location
  { pattern: /how old am i|what('s| is) my age/i, key: 'user_age', type: 'profile' },
  { pattern: /where (do |did | )(i live|i'?m from|i reside)/i, key: 'user_location', type: 'profile' },

  // Role / job
  { pattern: /what('s| is) my (job|role|profession|title)/i, key: 'user_role', type: 'profile' },
  { pattern: /what do i do (for work|for a living)/i, key: 'user_role', type: 'profile' },
  { pattern: /where do i work/i, key: 'user_company', type: 'profile' },
];

// Patterns that indicate the user is asking about a type of memory
const CATEGORY_QUERIES = [
  { pattern: /what('s| are) my goals/i, type: 'goal', category: 'goals' },
  { pattern: /(tell me about|what are) my (goals|objectives)/i, type: 'goal', category: 'goals' },
  { pattern: /what (am i|should i) (working toward|trying to achieve)/i, type: 'goal', category: 'goals' },

  { pattern: /what ('?ve|have) i (learned|been learning)/i, type: 'learning_progress', category: 'skills' },
  { pattern: /what skills (do i have|have i learned|am i learning)/i, type: 'skill', category: 'skills' },

  { pattern: /what ('?ve|have) i been (working on|building)/i, type: 'project', category: 'projects' },
  { pattern: /(tell me about|what are) my projects/i, type: 'project', category: 'projects' },
  { pattern: /how('s| is) my project (going|progress)/i, type: 'project', category: 'projects' },

  { pattern: /what (do|did) i (like|prefer|enjoy)/i, type: 'preference', category: 'preferences' },
  { pattern: /what are my (preferences|interests|hobbies)/i, type: 'preference', category: 'preferences' },

  { pattern: /what facts (do you know|have you learned) about me/i, type: 'fact', category: 'facts' },
  { pattern: /what (do you know|have you remembered) about me/i, type: null, category: null }, // all memories
];

// Patterns for general memory recall questions
const GENERAL_MEMORY_QUERIES = [
  /what do you (know|remember) about me/i,
  /what ('?ve|have) you (learned|remembered) about me/i,
  /(tell me|remind me) what you know about me/i,
  /do you remember (anything|something|what) (about|from) (me|our|the)/i,
];

/**
 * Check if a message is asking about a specific stored fact.
 * If yes, returns the memory key and type to look up.
 * @returns {{ isMemoryQuery: boolean, key: string|null, type: string|null, category: string|null }}
 */
function detectMemoryQuery(message) {
  if (!message || typeof message !== 'string') {
    return { isMemoryQuery: false, key: null, type: null, category: null };
  }

  const trimmed = message.trim();

  // Check specific fact queries first
  for (const q of FACT_QUERIES) {
    if (q.pattern.test(trimmed)) {
      return { isMemoryQuery: true, key: q.key, type: q.type, category: q.type };
    }
  }

  // Check category queries
  for (const q of CATEGORY_QUERIES) {
    if (q.pattern.test(trimmed)) {
      return { isMemoryQuery: true, key: null, type: q.type, category: q.category };
    }
  }

  // Check general memory queries
  const isGeneral = GENERAL_MEMORY_QUERIES.some((p) => p.test(trimmed));
  if (isGeneral) {
    return { isMemoryQuery: true, key: null, type: null, category: null };
  }

  // Check if message looks like a question that might need memory
  // e.g., "What was that thing I was working on?" — vague but memory-related
  const memoryKeywords = /\b(remember|recall|memory|previous|before|earlier|last time|i mentioned|i told you)\b/i;
  if (memoryKeywords.test(trimmed) && /\?/.test(trimmed)) {
    return { isMemoryQuery: true, key: null, type: null, category: null };
  }

  return { isMemoryQuery: false, key: null, type: null, category: null };
}

/**
 * Check if a message contains new information that should be remembered.
 * @returns {boolean}
 */
function containsRememberable(message) {
  if (!message || typeof message !== 'string') return false;

  const trimmed = message.trim();

  // Skip short or trivial messages
  const trivial = /^(hi|hey|hello|thanks|ok|okay|sure|yes|no|good|bye|lol|haha|nice|great|awesome|cool)\b/i;
  if (trivial.test(trimmed) && trimmed.split(/\s+/).length <= 3) {
    return false;
  }

  // Check for self-disclosure patterns
  const disclosurePatterns = [
    /my (name|age|job|role|title|company|location|city|hobby|interest|goal|project|skill|favorite|dream|aspiration)/i,
    /i (am|work|study|live|like|love|hate|enjoy|prefer|want|need|plan|hope|wish|believe|think|feel)/i,
    /i (have|had|got|received|started|finished|completed|learned|built|created|made|developed)/i,
    /i['']?m (working|learning|studying|building|creating|reading|writing|practicing)/i,
    /(my|our) (team|company|project|startup|business|family)/i,
  ];

  return disclosurePatterns.some((p) => p.test(trimmed));
}

module.exports = {
  detectMemoryQuery,
  containsRememberable,
};
