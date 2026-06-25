const Memory = require('../../models/Memory');

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function wordOverlap(a, b) {
  const wordsA = new Set(normalize(a).split(/\s+/));
  const wordsB = new Set(normalize(b).split(/\s+/));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w) && w.length > 2));
  const union = new Set([...wordsA, ...wordsB].filter(w => w.length > 2));
  return union.size > 0 ? intersection.size / union.size : 0;
}

function isSimilarContent(existing, newText) {
  const existingTexts = [];
  const val = existing.value || {};
  if (typeof val === 'string') existingTexts.push(val);
  else if (typeof val === 'object') {
    for (const v of Object.values(val)) {
      if (typeof v === 'string') existingTexts.push(v);
    }
  }
  const joined = existingTexts.join(' ');
  return wordOverlap(joined, newText) > 0.55;
}

async function findBySimilarity(userId, type, message) {
  const candidates = await Memory.find({
    userId,
    type,
    lifecycleStatus: { $ne: 'expired' },
  })
    .sort({ importanceScore: -1, updatedAt: -1 })
    .limit(20)
    .lean();

  for (const mem of candidates) {
    if (isSimilarContent(mem, message)) {
      return mem;
    }
  }
  return null;
}

async function findByKey(userId, key) {
  return Memory.findOne({ userId, key }).lean();
}

module.exports = { findBySimilarity, findByKey, isSimilarContent, wordOverlap };
