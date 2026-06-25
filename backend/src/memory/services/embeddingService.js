const Memory = require('../../models/Memory');

const MAX_VOCAB_SIZE = 256;

class EmbeddingService {
  constructor() {
    this._vocabCache = new Map();
    this._idfCache = new Map();
  }

  _generateVocab(memories) {
    const wordSet = new Set();
    for (const mem of memories) {
      const text = this._memoryToText(mem).toLowerCase();
      const words = text.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
      for (const w of words) wordSet.add(w);
    }
    const commonWords = [
      'name', 'goal', 'like', 'dislike', 'favorite', 'color', 'project', 'skill',
      'learning', 'role', 'location', 'company', 'interest', 'fact', 'preference',
      'subject', 'status', 'active', 'title', 'description', 'user', 'profile',
      'become', 'best', 'coder', 'college', 'black',
    ];
    for (const w of commonWords) wordSet.add(w);
    const sorted = [...wordSet].sort().slice(0, MAX_VOCAB_SIZE);
    const vocab = {};
    sorted.forEach((w, i) => { vocab[w] = i; });
    return vocab;
  }

  _computeIDF(memories, vocab) {
    const docCount = memories.length || 1;
    const df = {};
    for (const w of Object.keys(vocab)) df[w] = 0;
    for (const mem of memories) {
      const text = this._memoryToText(mem).toLowerCase();
      const seen = new Set();
      const words = text.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
      for (const w of words) {
        if (vocab[w] !== undefined && !seen.has(w)) {
          df[w] = (df[w] || 0) + 1;
          seen.add(w);
        }
      }
    }
    const idf = {};
    for (const [w, freq] of Object.entries(df)) {
      idf[w] = Math.log(1 + (docCount - freq + 0.5) / (freq + 0.5));
    }
    return idf;
  }

  _vectorize(text, vocab, idf) {
    const vec = new Array(Object.keys(vocab).length).fill(0);
    const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const tf = {};
    for (const w of words) tf[w] = (tf[w] || 0) + 1;
    const wordCount = words.length || 1;
    for (const [w, count] of Object.entries(tf)) {
      const idx = vocab[w];
      if (idx !== undefined) {
        vec[idx] = (count / wordCount) * (idf[w] || 1);
      }
    }
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    if (mag > 0) for (let i = 0; i < vec.length; i++) vec[i] /= mag;
    return vec;
  }

  _memoryToText(memory) {
    const parts = [];
    if (memory.key) parts.push(memory.key.replace(/[:_]/g, ' '));
    if (memory.value) {
      if (typeof memory.value === 'string') parts.push(memory.value);
      else if (typeof memory.value === 'object') {
        for (const v of Object.values(memory.value)) {
          if (typeof v === 'string') parts.push(v);
        }
      }
    }
    if (memory.tags && Array.isArray(memory.tags)) parts.push(...memory.tags);
    if (memory.valueText) parts.push(memory.valueText);
    return parts.filter(Boolean).join(' ').substring(0, 2000);
  }

  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const mag = Math.sqrt(magA) * Math.sqrt(magB);
    return mag === 0 ? 0 : dot / mag;
  }

  async generateEmbedding(text, userId = null) {
    if (userId) {
      const memories = await Memory.find({ userId }).limit(200).lean().catch(() => []);
      const vocab = this._generateVocab(memories);
      const idf = this._computeIDF(memories, vocab);
      return this._vectorize(text, vocab, idf);
    }
    const dummyVocab = { name: 0, goal: 1, like: 2, favorite: 3, color: 4, project: 5, skill: 6, black: 7, subject: 8, status: 9, active: 10, become: 11, best: 12, coder: 13, college: 14, learning: 15 };
    const dummyIDF = {};
    for (const w of Object.keys(dummyVocab)) dummyIDF[w] = 1;
    return this._vectorize(text, dummyVocab, dummyIDF);
  }

  async embedMemory(memory) {
    const text = this._memoryToText(memory);
    const embedding = await this.generateEmbedding(text, memory.userId);
    await Memory.updateOne({ _id: memory._id }, { $set: { embedding } }).catch(() => {});
    return embedding;
  }

  async embedUserMemories(userId) {
    const unembedded = await Memory.find({
      userId,
      $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
    }).limit(100).lean();
    let count = 0;
    for (const mem of unembedded) { await this.embedMemory(mem); count++; }
    if (count > 0) console.log(`[EmbeddingService] Embedded ${count} memories`);
    return count;
  }

  async searchBySimilarity(userId, query, limit = 10, minSimilarity = 0.05) {
    const memories = await Memory.find({
      userId,
      embedding: { $exists: true, $not: { $size: 0 } },
    }).limit(200).lean();

    if (memories.length === 0) return [];

    const allMemTexts = memories.map(m => this._memoryToText(m));
    const allTexts = [query, ...allMemTexts];
    const allWords = allTexts.join(' ').toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const vocab = {};
    [...new Set(allWords)].sort().slice(0, MAX_VOCAB_SIZE).forEach((w, i) => { vocab[w] = i; });

    const docCount = memories.length || 1;
    const df = {};
    for (const w of Object.keys(vocab)) df[w] = 0;
    for (const mem of memories) {
      const text = this._memoryToText(mem).toLowerCase();
      const seen = new Set();
      const words = text.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
      for (const w of words) {
        if (vocab[w] !== undefined && !seen.has(w)) { df[w] = (df[w] || 0) + 1; seen.add(w); }
      }
    }
    const idf = {};
    for (const [w, freq] of Object.entries(df)) idf[w] = Math.log(1 + (docCount - freq + 0.5) / (freq + 0.5));

    const queryVec = this._vectorize(query, vocab, idf);

    const scored = memories
      .map(m => ({ ...m, _similarity: this.cosineSimilarity(queryVec, this._vectorize(this._memoryToText(m), vocab, idf)) }))
      .filter(m => m._similarity >= minSimilarity)
      .sort((a, b) => b._similarity - a._similarity)
      .slice(0, limit);

    return scored;
  }

  async hybridSearch(userId, query, limit = 10) {
    const semanticResults = await this.searchBySimilarity(userId, query, limit * 2);
    if (semanticResults.length >= limit) return semanticResults.slice(0, limit);

    const existingIds = new Set(semanticResults.map(m => String(m._id)));
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const keywordResults = await Memory.find({
      userId,
      _id: { $nin: [...existingIds].map(id => require('mongoose').Types.ObjectId.createFromHexString(id)) },
      $or: [
        { key: regex }, { tags: regex },
        { 'value.name': regex }, { 'value.description': regex },
        { 'value.title': regex }, { 'value.topic': regex }, { 'value.subject': regex },
      ],
    }).sort({ priority: -1, updatedAt: -1 }).limit(limit - semanticResults.length).lean();

    return [...semanticResults, ...keywordResults];
  }
}

module.exports = new EmbeddingService();
