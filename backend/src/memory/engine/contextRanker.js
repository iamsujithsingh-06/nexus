const MAX_RESULTS = 5;

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

function keywordRelevance(memory, query) {
  if (!query) return 0;
  const qWords = normalize(query).split(/\s+/).filter(w => w.length > 2);
  if (qWords.length === 0) return 0;

  const memTexts = [];
  const val = memory.value || {};
  if (typeof val === 'string') memTexts.push(val);
  else if (typeof val === 'object') {
    for (const v of Object.values(val)) {
      if (typeof v === 'string') memTexts.push(v);
    }
  }
  if (memory.key) memTexts.push(memory.key);
  if (memory.tags) memTexts.push(...memory.tags);

  const combined = normalize(memTexts.join(' '));
  let matches = 0;
  for (const word of qWords) {
    if (combined.includes(word)) matches++;
  }
  return matches / qWords.length;
}

function recencyScore(memory) {
  const lastAccess = memory.lastAccessedAt || memory.updatedAt || memory.createdAt;
  if (!lastAccess) return 0.3;

  const daysSinceAccess = (Date.now() - new Date(lastAccess).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - daysSinceAccess / 30);
}

function frequencyScore(memory) {
  const count = memory.accessCount || memory.timesUsed || 0;
  return Math.min(1, count / 20);
}

function rank(memories, query, options = {}) {
  const weights = {
    importance: options.importanceWeight ?? 0.35,
    recency: options.recencyWeight ?? 0.20,
    relevance: options.relevanceWeight ?? 0.30,
    frequency: options.frequencyWeight ?? 0.15,
  };

  const scored = memories.map(mem => {
    const importanceScore = mem.importanceScore || 0;
    const relevance = keywordRelevance(mem, query);
    const recency = recencyScore(mem);
    const frequency = frequencyScore(mem);

    const total =
      importanceScore * weights.importance +
      recency * weights.recency +
      relevance * weights.relevance +
      frequency * weights.frequency;

    return { memory: mem, score: Number(total.toFixed(3)), signals: { importanceScore, relevance, recency, frequency } };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, options.maxResults || MAX_RESULTS);
}

module.exports = { rank, keywordRelevance, recencyScore, frequencyScore };
