/**
 * IntentClassifier — classifies user messages into one of 12 intents.
 *
 * Uses keyword/pattern matching with confidence scoring.
 * No AI call needed — purely rule-based for speed and reliability.
 *
 * Supported intents:
 *   greeting, goal_related, task_related, learning, project,
 *   career, personal, knowledge, analysis, planning,
 *   motivational, general
 */

const PATTERNS = {
  greeting: [
    /^\s*(hi|hello|hey|yo|sup|howdy|good\s*(morning|afternoon|evening)|what's up|hey\s+there)\b/i,
    /\b(nice\s+to\s+meet|pleased|greetings)\b/i,
  ],
  goal_related: [
    /\b(i\s+(want|need|would\s+like|hope|plan|intend|aim)\s+to)\b/i,
    /\b(my\s+goal|my\s+target|my\s+objective|i'm\s+aiming|i\s+aspire)\b/i,
    /\b(set\s+(a\s+)?goal|create\s+(a\s+)?goal|new\s+goal|add\s+goal)\b/i,
    /\b(roadmap|milestone|phase|progress\s+on|work\s+toward)\b/i,
    /\b(i\s+want\s+to\s+(become|learn|build|start|crate|make))\b/i,
  ],
  task_related: [
    /\b(todo|to-do|task|subtask|action\s+item|what\s+(do\s+)?i\s+need\s+to\s+do)\b/i,
    /\b(add\s+(a\s+)?task|create\s+(a\s+)?task|new\s+task|pending|due|deadline)\b/i,
    /\b(what's\s+(next|pending|on\s+my\s+list)|show\s+(my\s+)?tasks)\b/i,
    /\b(remind|reminder|notify|checklist)\b/i,
  ],
  learning: [
    /\b(learn|study|course|tutorial|lesson|skill|practice)\b/i,
    /\b(how\s+(do|can|should)\s+i\s+(learn|study|practice|improve))\b/i,
    /\b(recommend\s+(a\s+)?(book|course|resource|tutorial|video))\b/i,
    /\b(what\s+should\s+i\s+(learn|study|focus\s+on))\b/i,
    /\b(progress|tracking|improving|getting\s+better)\b/i,
  ],
  project: [
    /\b(project|side\s+project|portfolio|build\s+(a\s+)?(web|app|site|tool))\b/i,
    /\b(repo|repository|github|deploy|launch|release)\b/i,
    /\b(architecture|design|planning\s+(a\s+)?(project|app|system))\b/i,
  ],
  career: [
    /\b(job|interview|resume|CV|career|promotion|salary|raise|role)\b/i,
    /\b(apply|application|hiring|recruit|position|opportunity)\b/i,
    /\b(skill\s+gap|upskill|career\s+(path|growth|change|transition))\b/i,
    /\b(networking|linkedin|portfolio\s+site|personal\s+brand)\b/i,
  ],
  personal: [
    /\b(my\s+(name|age|location|hobby|interest|background|story))\b/i,
    /\b(i\s+(am|was|have\s+been|come\s+from|live\s+in))\b/i,
    /\b(feel|feeling|mood|emotion|stress|anxious|excited)\b/i,
    /\b(family|friend|hobby|weekend|routine|habit)\b/i,
  ],
  knowledge: [
    /\b(what\s+is|what\s+are|explain|define|tell\s+me\s+about|describe)\b/i,
    /\b(how\s+(does|do|can|would|is|are))\b/i,
    /\b(why\s+(does|do|is|are|would|did|can))\b/i,
    /\b(difference\s+between|compare|vs\.?|versus)\b/i,
    /\b(fact|information|knowledge|curious|wonder)\b/i,
  ],
  analysis: [
    /\b(analyze|analysis|evaluate|assess|review|critique|feedback)\b/i,
    /\b(pro(s|s\s+and\s+con(s|s)|s\s+&?\s+con(s|s)))\b/i,
    /\b(strength|weakness|opportunity|threat|swot)\b/i,
    /\b(reflect|reflection|what\s+(went|worked)|lesson\s+learned)\b/i,
  ],
  planning: [
    /\b(plan|schedule|timeline|when\s+should|next\s+step)\b/i,
    /\b(strategy|strategic|approach|methodology|framework)\b/i,
    /\b(organize|prepare|get\s+ready|before\s+i\s+(start|begin))\b/i,
    /\b(roadmap|itinerary|agenda|outline)\b/i,
  ],
  motivational: [
    /\b(encourage|motivate|inspire|keep\s+going|you\s+can)\b/i,
    /\b(stuck|struggling|lost|confused|overwhelmed|burnout)\b/i,
    /\b(need\s+(some\s+)?(advice|guidance|support|help|motivation))\b/i,
    /\b(how\s+(do|can)\s+i\s+(stay|keep|remain))\b/i,
  ],
};

const intentLabels = Object.keys(PATTERNS);

function classify(message) {
  if (!message || typeof message !== 'string') {
    return { intent: 'general', confidence: 0.5, subIntent: null };
  }

  const scores = {};
  let totalMatches = 0;

  for (const [intent, patterns] of Object.entries(PATTERNS)) {
    let matchCount = 0;
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      scores[intent] = matchCount;
      totalMatches += matchCount;
    }
  }

  if (totalMatches === 0) {
    return { intent: 'general', confidence: 0.5, subIntent: null };
  }

  // Find the intent with the most pattern matches
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topIntent = sorted[0][0];
  const topScore = sorted[0][1];
  const confidence = Math.min(0.95, 0.5 + (topScore / totalMatches) * 0.45);

  // Detect sub-intent from the second-best non-overlapping intent
  let subIntent = null;
  if (sorted.length > 1 && sorted[1][1] >= topScore * 0.7) {
    subIntent = sorted[1][0];
  }

  // Detect if it's a memory query (asking about stored info)
  const isMemoryQuery = /\b(my\s+(goal|task|project|progress|memory|info|name))\b/i.test(message) ||
    /\b(what\s+(did|have)\s+i|tell\s+me\s+about\s+my|do\s+i\s+(have|need))\b/i.test(message);

  return {
    intent: topIntent,
    confidence,
    subIntent,
    isMemoryQuery,
    scores,
  };
}

function isGoalDeclaration(message) {
  return /\b(i\s+(want|need|would\s+like|hope|plan|intend|aim)\s+to)\b/i.test(message) &&
    !/\b(what|how|why|when|where|who|tell|explain|describe|define)\b/i.test(message);
}

module.exports = { classify, isGoalDeclaration, intentLabels };
