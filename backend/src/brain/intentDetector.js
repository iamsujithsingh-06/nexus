/**
 * Intent Detector — Analyzes user messages and classifies them into intent categories.
 *
 * Supported intents:
 *   goal     – Setting, updating, or tracking personal goals
 *   learning – Learning new skills, studying, education
 *   project  – Managing projects, tasks, features, deliverables
 *   coding   – Programming, debugging, technical questions
 *   fitness  – Exercise, health, workout routines
 *   general  – Default fallback for ambiguous or uncategorized messages
 */

// Keyword maps for each intent category (matched case-insensitively)
const INTENT_KEYWORDS = {
  goal: [
    'goal', 'aim', 'objective', 'target', 'want to achieve', 'plan to',
    'aspire', 'ambition', 'milestone', 'resolution', 'purpose',
    'i will', 'i shall', 'my mission', 'strive', 'intend to',
    'long-term', 'short-term', 'accomplish', 'commit to',
  ],
  learning: [
    'learn', 'study', 'course', 'tutorial', 'practice', 'understand',
    'read', 'book', 'lecture', 'train', 'skill', 'knowledge',
    'educational', 'master', 'comprehend', 'lesson', 'curriculum',
    'certification', 'diploma', 'degree', 'workshop', 'seminar',
    'studying', 'learning',
  ],
  project: [
    'project', 'task', 'feature', 'sprint', 'deadline', 'deliverable',
    'ticket', 'backlog', 'roadmap', 'release', 'deploy', 'pipeline',
    'staging', 'production', 'milestone', 'epic', 'story point',
    'board', 'kanban', 'scrum', 'agile',
  ],
  coding: [
    'code', 'program', 'debug', 'function', 'bug', 'error', 'compile',
    'syntax', 'algorithm', 'api', 'endpoint', 'database', 'server',
    'frontend', 'backend', 'framework', 'library', 'dependency',
    'config', 'deploy', 'docker', 'git', 'commit', 'branch', 'pr',
    'merge', 'typescript', 'javascript', 'python', 'react', 'node',
    'terminal', 'command line', 'variable', 'class', 'interface',
  ],
  fitness: [
    'exercise', 'workout', 'gym', 'run', 'jog', 'walk', 'yoga',
    'diet', 'nutrition', 'calories', 'protein', 'weight', 'muscle',
    'cardio', 'strength', 'flexibility', 'meditation', 'sleep',
    'health', 'fitness', 'train', 'rep', 'set', 'squat', 'pushup',
    'pullup', 'bench press', 'deadlift', 'routine', 'stretch',
    'swim', 'bike', 'cycling',
  ],
};

// Regex patterns that indicate goal-setting language
const GOAL_PATTERNS = [
  /i (?:want|need|plan|hope|aim|aspire|intend|would like) to (.+)/i,
  /my goal (?:is|should be) to (.+)/i,
  /i (?:will|shall|should|must|have to) (.+)/i,
  /(?:let's |i want to )set (?:a |an |)(?:goal|target|objective) (?:to |for |of )(.+)/i,
  /i[''](?:m|am) going to (.+)/i,
  /i[''](?:d|would) like to (?:start|begin|commence|undertake) (.+)/i,
  /(?:track|monitor|measure) my (.+)/i,
  /help me (?:achieve|reach|accomplish|complete) (.+)/i,
];

/**
 * Detects whether a message contains goal-setting language.
 * @param {string} message - The user message
 * @returns {boolean}
 */
function containsGoal(message) {
  if (!message || typeof message !== 'string') return false;
  return GOAL_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Analyzes a user message and returns the detected intent category.
 *
 * Detection strategy:
 *   1. First checks for explicit goal-setting patterns (verb-based).
 *   2. If no goal pattern matches, scores each category by keyword density.
 *   3. The category with the highest keyword match count wins.
 *   4. If no keywords match at all, defaults to 'general'.
 *
 * @param {string} message - The raw user message
 * @returns {string} - One of: 'goal' | 'learning' | 'project' | 'coding' | 'fitness' | 'general'
 */
function detectIntent(message) {
  if (!message || typeof message !== 'string') {
    return 'general';
  }

  const trimmed = message.trim();
  if (!trimmed) return 'general';

  // Priority 1: Explicit goal-setting patterns take precedence
  if (containsGoal(trimmed)) {
    return 'goal';
  }

  const lower = trimmed.toLowerCase();

  // Priority 2: Score each category by keyword match count
  const scores = {};

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    scores[intent] = keywords.reduce((count, kw) => {
      return count + (lower.includes(kw) ? 1 : 0);
    }, 0);
  }

  // Priority 3: Pick the category with the strongest signal
  let bestIntent = 'general';
  let bestScore = 0;

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

module.exports = {
  detectIntent,
  containsGoal,
};
