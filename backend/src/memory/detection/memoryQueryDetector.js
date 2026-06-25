const QueryNormalizer = require('../retrieval/queryNormalizer');

const FACT_QUERIES = [
  { pattern: /what('s| is) my name/i, key: 'user_name', type: 'profile' },
  { pattern: /(who am i|do you know my name|remember my name)/i, key: 'user_name', type: 'profile' },
  { pattern: /how old am i|what('s| is) my age/i, key: 'user_age', type: 'profile' },
  { pattern: /where (do |did | )(i live|i'?m from|i reside)/i, key: 'user_location', type: 'profile' },
  { pattern: /what('s| is) my (job|role|profession|title)/i, key: 'user_role', type: 'profile' },
  { pattern: /what do i do (for work|for a living)/i, key: 'user_role', type: 'profile' },
  { pattern: /where do i work/i, key: 'user_company', type: 'profile' },
];

const CATEGORY_QUERIES = [
  { pattern: /what('s| are| is) my (goals?|dreams?|ambitions?|aspirations?)/i, type: 'goal', category: 'goals' },
  { pattern: /(tell me about|what are) my (goals|objectives|dreams|ambitions|aspirations)/i, type: 'goal', category: 'goals' },
  { pattern: /what (am i|should i) (working toward|trying to achieve)/i, type: 'goal', category: 'goals' },
  { pattern: /what do i (want to become|aspire to|dream of)/i, type: 'goal', category: 'goals' },
  { pattern: /do you know my (goal|dream|ambition)/i, type: 'goal', category: 'goals' },
  { pattern: /what ('?ve|have) i (learned|been learning)/i, type: 'learning_progress', category: 'skills' },
  { pattern: /what skills (do i have|have i learned|am i learning)/i, type: 'skill', category: 'skills' },
  { pattern: /what('s| is) my (main )?skill/i, type: 'skill', category: 'skills' },
  { pattern: /what ('?ve|have) i been (working on|building)/i, type: 'project', category: 'projects' },
  { pattern: /(tell me about|what are|what is) my projects?/i, type: 'project', category: 'projects' },
  { pattern: /how('s| is) my project (going|progress)/i, type: 'project', category: 'projects' },
  { pattern: /do you know my project/i, type: 'project', category: 'projects' },
  { pattern: /what (do|did) i (like|prefer|enjoy)/i, type: 'preference', category: 'preferences' },
  { pattern: /what are my (preferences|interests|hobbies)/i, type: 'preference', category: 'preferences' },
  { pattern: /what('s| is) my (interest|hobby)/i, type: 'preference', category: 'preferences' },
  { pattern: /what('s| is) my favorite (\w+)/i, type: 'preference', category: 'preferences' },
  { pattern: /(tell me|remind me|do you know) my favorite (\w+)/i, type: 'preference', category: 'preferences' },
  { pattern: /what facts (do you know|have you learned) about me/i, type: 'fact', category: 'facts' },
  { pattern: /what (do you know|have you remembered) about me/i, type: null, category: null },
];

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
  const normalized = QueryNormalizer.normalize(trimmed);

  for (const q of FACT_QUERIES) {
    if (q.pattern.test(normalized.normalized)) {
      return { isMemoryQuery: true, key: q.key, type: q.type, category: q.type };
    }
  }

  for (const q of CATEGORY_QUERIES) {
    if (q.pattern.test(trimmed) || q.pattern.test(normalized.normalized)) {
      return { isMemoryQuery: true, key: null, type: q.type, category: q.category };
    }
  }

  const isGeneral = GENERAL_MEMORY_QUERIES.some((p) => p.test(trimmed));
  if (isGeneral) {
    return { isMemoryQuery: true, key: null, type: null, category: null };
  }

  if (normalized.isQuestion && normalized.keywords.length > 0) {
    const memoryKeywords = /\b(remember|recall|memory|previous|before|earlier|last time|i mentioned|i told you)\b/i;
    if (memoryKeywords.test(trimmed)) {
      return { isMemoryQuery: true, key: null, type: null, category: null };
    }
    const topic = QueryNormalizer.extractTopic(trimmed);
    if (topic) {
      return { isMemoryQuery: true, key: null, type: 'preference', category: 'preferences' };
    }
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
  const normalized = QueryNormalizer.normalize(trimmed);

  const trivial = /^(hi|hey|hello|thanks|ok|okay|sure|yes|no|good|bye|lol|haha|nice|great|awesome|cool)\b/i;
  if (trivial.test(trimmed) && trimmed.split(/\s+/).length <= 3) {
    return false;
  }

  if (normalized.isQuestion) return false;

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
