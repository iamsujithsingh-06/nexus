const EmbeddingService = require('../services/embeddingService');
const QueryNormalizer = require('../retrieval/queryNormalizer');

const DEFAULT_CONFIG = {
  minScore: 0.35,
  maxResults: 5,
  exactKeyWeight: 0.80,
  typeExactWeight: 0.50,
  typeAliasWeight: 0.25,
  keywordWeight: 0.40,
  confidenceWeight: 0.12,
  importanceWeight: 0.08,
  recencyWeight: 0.05,
  wrongTypePenalty: 0.30,
};

const TYPE_ALIASES = {
  'profile': ['user_profile', 'profile'],
  'goal': ['goal'],
  'project': ['project'],
  'skill': ['skill', 'learning_progress'],
  'preference': ['preference'],
  'fact': ['fact'],
  'insight': ['conversation_insight', 'insight'],
  'interest': ['interest'],
};

function scoreMemory(memory, message, normalized, targetType = null, targetKey = null, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let score = 0;
  let signals = {};

  const valueText = extractText(memory.value).toLowerCase();
  const keyText = (memory.key || '').toLowerCase();
  const tagText = (memory.tags || []).join(' ').toLowerCase();
  const valueText2 = (memory.valueText || '').toLowerCase();
  const combinedText = [valueText, keyText, tagText, valueText2].join(' ');

  if (targetKey && memory.key === targetKey) {
    score += cfg.exactKeyWeight;
    signals.exactKey = cfg.exactKeyWeight;
  }

  if (targetType) {
    const aliases = TYPE_ALIASES[targetType] || [targetType];
    if (aliases.includes(memory.type)) {
      score += cfg.typeExactWeight;
      signals.typeMatch = cfg.typeExactWeight;
      // Boost when type matches but no keyword match — common for "favorite X" queries
      // where stored value doesn't contain the query's descriptive words
      if (message && normalized && normalized.keywords.length > 0) {
        const keywords = normalized.keywords;
        const hasContentMatch = keywords.some(k =>
          combinedText.includes(k) || combinedText.includes(k.replace(/s$/, ''))
        );
        if (!hasContentMatch) {
          score += 0.25;
          signals.typeNoKeywordBoost = 0.25;
        }
      }
    } else {
      const memoAliases = TYPE_ALIASES[memory.type] || [memory.type];
      if (aliases.some(a => memoAliases.includes(a))) {
        score += cfg.typeAliasWeight;
        signals.typeAlias = cfg.typeAliasWeight;
      } else {
        score -= cfg.wrongTypePenalty;
        signals.wrongTypePenalty = -cfg.wrongTypePenalty;
      }
    }
  }

  if (message && normalized) {
    const keywords = normalized.keywords;
    if (keywords.length > 0) {
      let matchCount = 0;
      for (const kw of keywords) {
        if (combinedText.includes(kw)) matchCount++;
      }
      const kwScore = keywords.length > 0 ? matchCount / keywords.length : 0;
      score += kwScore * cfg.keywordWeight;
      signals.keyword = kwScore * cfg.keywordWeight;
    }
  }

  const importance = memory.importance ?? memory.priority ?? 0;
  const importanceScore = (importance + 10) / 20;
  score += importanceScore * cfg.importanceWeight;
  signals.importance = importanceScore * cfg.importanceWeight;

  const confidence = memory.confidence ?? 0.5;
  score += confidence * cfg.confidenceWeight;
  signals.confidence = confidence * cfg.confidenceWeight;

  const updatedAt = memory.updatedAt || memory.createdAt || new Date(0);
  const daysSinceUpdate = (Date.now() - new Date(updatedAt).getTime()) / 86400000;
  const recencyScore = Math.max(0, 1 - daysSinceUpdate / 30);
  score += recencyScore * cfg.recencyWeight;
  signals.recency = recencyScore * cfg.recencyWeight;

  return { score: Math.min(1, Math.max(-1, score)), signals };
}

async function rankMemories(memories, message, targetType = null, targetKey = null, userId = null, config = {}) {
  if (!memories || memories.length === 0) return [];
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const normalized = QueryNormalizer.normalize(message);

  let semanticMap = new Map();
  if (userId && memories.length > 0) {
    try {
      const semanticResults = await EmbeddingService.searchBySimilarity(userId, message, memories.length, 0.05);
      for (const sr of semanticResults) {
        semanticMap.set(String(sr._id), sr._similarity || 0);
      }
    } catch {}
  }

  const scored = memories.map(m => {
    const { score: baseScore, signals } = scoreMemory(m, message, normalized, targetType, targetKey, cfg);
    const semanticScore = semanticMap.get(String(m._id)) || 0;
    const blendBase = targetKey ? 0.95 : (targetType ? 0.92 : 0.80);
    const finalScore = (baseScore * blendBase) + (semanticScore * (1 - blendBase));
    return { ...m, _score: Math.min(1, Math.max(-1, finalScore)), _signals: signals, _semantic: semanticScore };
  });

  const minScore = Math.max(cfg.minScore, targetKey ? 0.5 : cfg.minScore);
  const filtered = scored.filter(m => m._score >= minScore);
  const sorted = filtered.sort((a, b) => b._score - a._score).slice(0, cfg.maxResults);

  return sorted;
}

function extractText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return Object.values(value).filter(v => typeof v === 'string').join(' ');
  }
  return String(value);
}

module.exports = { rankMemories, scoreMemory, DEFAULT_CONFIG };
