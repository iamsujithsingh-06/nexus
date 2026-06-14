/**
 * Memory Ranker — Scores and ranks memories by relevance to the current message.
 *
 * Scoring formula:
 *   score = (keywordMatch × 0.35) + (typeMatch × 0.25) + (importance × 0.20) + (recency × 0.20)
 *
 * Only memories with score ≥ 0.3 are returned. Max 5 items.
 */

/**
 * Score a memory against a user message and optional target type.
 *
 * @param {object} memory - Memory document from MongoDB
 * @param {string} message - The current user message
 * @param {string|null} targetType - Specific memory type to prioritize (optional)
 * @param {string|null} targetKey - Specific memory key (optional, highest priority)
 * @returns {number} Score from 0 to 1
 */
function scoreMemory(memory, message, targetType = null, targetKey = null) {
  let score = 0;

  // ── Exact key match (highest priority) ──
  if (targetKey && memory.key === targetKey) {
    score += 0.6;
  }

  // ── Type match ──
  if (targetType) {
    if (memory.type === targetType) {
      score += 0.25;
    }
    // Broader type match (e.g., goal matches goal_discussion)
    const typeAliases = {
      'profile': ['user_profile'],
      'goal': ['goal'],
      'project': ['project'],
      'skill': ['skill', 'learning_progress'],
      'preference': ['preference'],
      'fact': ['fact'],
    };
    const aliases = typeAliases[targetType] || [targetType];
    if (aliases.includes(memory.type)) {
      score += 0.15;
    }
  }

  // ── Keyword match between message and memory value/text ──
  if (message) {
    const lowerMsg = message.toLowerCase();
    const valueText = extractText(memory.value).toLowerCase();
    const keyText = memory.key.toLowerCase();

    // Check if message keywords appear in memory value
    const msgWords = lowerMsg
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !isStopWord(w));

    const matchCount = msgWords.filter((w) => valueText.includes(w) || keyText.includes(w)).length;
    const keywordScore = msgWords.length > 0 ? matchCount / msgWords.length : 0;
    score += keywordScore * 0.35;
  }

  // ── Importance (normalize from -10..10 to 0..1) ──
  const importance = memory.importance ?? memory.priority ?? 0;
  const importanceScore = (importance + 10) / 20;
  score += importanceScore * 0.20;

  // ── Recency (days since updated, capped at 30) ──
  const updatedAt = memory.updatedAt || memory.createdAt || new Date(0);
  const daysSinceUpdate = (Date.now() - new Date(updatedAt).getTime()) / 86400000;
  const recencyScore = Math.max(0, 1 - daysSinceUpdate / 30);
  score += recencyScore * 0.20;

  return Math.min(1, Math.max(0, score));
}

/**
 * Rank an array of memories by relevance to the current message.
 *
 * @param {Array} memories - Raw memory documents from MongoDB
 * @param {string} message - Current user message
 * @param {string|null} targetType - Optional type to prioritize
 * @param {string|null} targetKey - Optional exact key to prioritize
 * @param {number} minScore - Minimum score threshold (default 0.3)
 * @param {number} maxResults - Max items to return (default 5)
 * @returns {Array} Sorted, filtered memories with scores attached
 */
function rankMemories(memories, message, targetType = null, targetKey = null, minScore = 0.3, maxResults = 5) {
  if (!memories || memories.length === 0) return [];

  const scored = memories
    .map((m) => ({
      ...m,
      _score: scoreMemory(m, message, targetType, targetKey),
    }))
    .filter((m) => m._score >= minScore)
    .sort((a, b) => b._score - a._score)
    .slice(0, maxResults);

  return scored;
}

/**
 * Extract readable text from a memory value object.
 */
function extractText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return Object.values(value)
      .filter((v) => typeof v === 'string')
      .join(' ');
  }
  return String(value);
}

const STOP_WORDS = new Set([
  'the', 'this', 'that', 'and', 'for', 'are', 'but', 'not', 'you',
  'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'has',
  'have', 'been', 'some', 'them', 'than', 'what', 'when', 'your',
  'about', 'into', 'over', 'just', 'also', 'like', 'more',
]);

function isStopWord(word) {
  return STOP_WORDS.has(word);
}

module.exports = {
  rankMemories,
  scoreMemory,
};
