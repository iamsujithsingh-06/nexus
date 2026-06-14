const Memory = require('../../models/Memory');

/**
 * Embedding Service — Generates and stores embeddings for semantic memory search.
 *
 * Two modes:
 *   1. API-based: Uses OpenRouter's embedding models when available
 *   2. Fallback: Simple token-frequency vector for MVP
 *
 * The embedding is stored as a `number[]` on each Memory document.
 */

const EMBEDDING_DIMENSIONS = 128;

/**
 * Generate a simple deterministic embedding from text.
 * This is a bag-of-words approach for MVP — replace with a real embedding
 * API call when OpenRouter embedding models are available.
 */
function generateSimpleEmbedding(text) {
  if (!text) return new Array(EMBEDDING_DIMENSIONS).fill(0);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // Hash the word to get a position in the vector
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const pos = ((hash % EMBEDDING_DIMENSIONS) + EMBEDDING_DIMENSIONS) % EMBEDDING_DIMENSIONS;
    // Weight by TF (term frequency) approximately
    vector[pos] = (vector[pos] || 0) + 1;
  }

  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= magnitude;
    }
  }

  return vector;
}

/**
 * Generate text representation of a memory for embedding.
 */
function memoryToText(memory) {
  const parts = [memory.key || ''];

  if (memory.value) {
    if (typeof memory.value === 'string') {
      parts.push(memory.value);
    } else if (typeof memory.value === 'object') {
      for (const v of Object.values(memory.value)) {
        if (typeof v === 'string') parts.push(v);
        if (Array.isArray(v)) parts.push(v.join(' '));
      }
    }
  }

  if (memory.tags && Array.isArray(memory.tags)) {
    parts.push(...memory.tags);
  }

  return parts.filter(Boolean).join(' ').substring(0, 1000);
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

class EmbeddingService {
  /**
   * Generate embedding for a text string.
   */
  async generateEmbedding(text) {
    return generateSimpleEmbedding(text);
  }

  /**
   * Generate and store embedding on a memory document.
   */
  async embedMemory(memory) {
    const text = memoryToText(memory);
    const embedding = await this.generateEmbedding(text);

    await Memory.updateOne(
      { _id: memory._id },
      { $set: { embedding } }
    ).catch(() => {});

    return embedding;
  }

  /**
   * Embed all memories for a user that don't have embeddings yet.
   */
  async embedUserMemories(userId) {
    const unembedded = await Memory.find({
      userId,
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
      ],
    }).limit(100).lean();

    let count = 0;
    for (const mem of unembedded) {
      await this.embedMemory(mem);
      count++;
    }

    if (count > 0) {
      console.log(`[EmbeddingService] Embedded ${count} memories for user ${userId}`);
    }

    return count;
  }

  /**
   * Search memories by semantic similarity to a query text.
   *
   * @param {string} userId
   * @param {string} query - The search query
   * @param {number} limit - Max results
   * @param {number} minSimilarity - Minimum similarity threshold (0-1)
   * @returns {Promise<Array>} Memories sorted by similarity, with similarity score
   */
  async searchBySimilarity(userId, query, limit = 10, minSimilarity = 0.1) {
    const queryEmbedding = await this.generateEmbedding(query);

    const memories = await Memory.find({
      userId,
      embedding: { $exists: true, $not: { $size: 0 } },
    })
      .sort({ priority: -1, updatedAt: -1 })
      .limit(100)
      .lean();

    // Score by cosine similarity
    const scored = memories
      .map((m) => ({
        ...m,
        _similarity: cosineSimilarity(queryEmbedding, m.embedding || []),
      }))
      .filter((m) => m._similarity >= minSimilarity)
      .sort((a, b) => b._similarity - a._similarity)
      .slice(0, limit);

    // Also include memories without embeddings (by keyword match as fallback)
    const unembeddedCount = memories.filter((m) => !m.embedding || m.embedding.length === 0).length;
    if (unembeddedCount > 0 && scored.length < limit) {
      // Try to embed unembedded memories on-the-fly
      await this.embedUserMemories(userId);
    }

    return scored;
  }

  /**
   * Hybrid search: combines keyword match with semantic similarity.
   */
  async hybridSearch(userId, query, limit = 10) {
    const semanticResults = await this.searchBySimilarity(userId, query, limit);

    // If semantic results are sufficient, return them
    if (semanticResults.length >= limit) return semanticResults;

    // Fallback: add regex-based results
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const keywordResults = await Memory.find({
      userId,
      _id: { $nin: semanticResults.map((m) => m._id) },
      $or: [
        { key: regex },
        { tags: regex },
        { 'value.name': regex },
        { 'value.description': regex },
        { 'value.title': regex },
        { 'value.topic': regex },
        { 'value.subject': regex },
      ],
    })
      .sort({ priority: -1, updatedAt: -1 })
      .limit(limit - semanticResults.length)
      .lean();

    return [...semanticResults, ...keywordResults];
  }
}

module.exports = new EmbeddingService();
