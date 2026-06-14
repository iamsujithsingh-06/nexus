const MemoryStorage = require('../storage/memoryStorage');
const MemoryRetriever = require('../retrieval/memoryRetriever');
const MemoryUpdater = require('../updater/memoryUpdater');
const MemoryExtractor = require('../extraction/memoryExtractor');
const MemoryConsolidator = require('../consolidation/memoryConsolidator');
const EmbeddingService = require('../services/embeddingService');
const ConversationSummarizer = require('../services/conversationSummarizer');
const { CATEGORY_TYPES, CATEGORY_META, createValue, validateValue } = require('../models/MemoryCategorySchemas');

class MemoryManager {
  async getContextForUser(userId) {
    return MemoryRetriever.getRelevantContext(userId);
  }

  async search(userId, query) {
    return MemoryRetriever.search(userId, query);
  }

  /**
   * Semantic search across memories.
   */
  async searchSemantic(userId, query, limit = 10) {
    return MemoryRetriever.searchSemantic(userId, query, limit);
  }

  /**
   * Get profile summary — compiled view of all user memories.
   */
  async getProfileSummary(userId) {
    return MemoryRetriever.getProfileSummary(userId);
  }

  async getActiveProjects(userId) {
    return MemoryRetriever.getActiveProjects(userId);
  }

  async getLearnedSkills(userId) {
    return MemoryRetriever.getLearnedSkills(userId);
  }

  // ── CRUD ──

  async addMemory(userId, type, key, value, options = {}) {
    if (!validateValue(type, value)) {
      throw new Error(`Invalid value for memory type: ${type}`);
    }
    return MemoryStorage.save(userId, type, key, value, options);
  }

  async getMemory(userId, key) {
    return MemoryStorage.get(userId, key);
  }

  async updateMemory(userId, key, updates) {
    return MemoryStorage.update(userId, key, updates);
  }

  async deleteMemory(userId, key) {
    return MemoryStorage.delete(userId, key);
  }

  async deleteMemoryById(userId, memoryId) {
    const Memory = require('../../models/Memory');
    return Memory.deleteOne({ _id: memoryId, userId });
  }

  async listMemories(userId, type) {
    return type
      ? MemoryStorage.listByType(userId, type)
      : MemoryStorage.list(userId);
  }

  async getMemoryById(memoryId) {
    return MemoryStorage.getById(memoryId);
  }

  async getMemoryStats(userId) {
    const Memory = require('../../models/Memory');
    const stats = { total: 0, byType: {} };

    for (const type of CATEGORY_TYPES) {
      const count = await Memory.countDocuments({ userId, type });
      stats.byType[type] = count;
      stats.total += count;
    }

    return stats;
  }

  // ── Extraction ──

  async extractFromConversation(userId, userMessage, assistantResponse) {
    return MemoryExtractor.extract(userId, userMessage, assistantResponse);
  }

  // ── Consolidation ──

  async consolidate(userId) {
    return MemoryConsolidator.consolidate(userId);
  }

  // ── Embeddings ──

  async embedUserMemories(userId) {
    return EmbeddingService.embedUserMemories(userId);
  }

  // ── Conversation Summaries ──

  async summarizeChats(userId) {
    return ConversationSummarizer.summarizeRecentChats(userId);
  }

  // ── Category Info ──

  getCategoryTypes() {
    return CATEGORY_TYPES;
  }

  getCategoryMeta(type) {
    return type ? CATEGORY_META[type] : CATEGORY_META;
  }

  createValue(type, data) {
    return createValue(type, data);
  }

  // ── Legacy support ──

  async storeInsight(userId, insight) {
    return MemoryUpdater.storeInsight(userId, insight);
  }

  async storeFact(userId, key, value) {
    return MemoryUpdater.storeFact(userId, key, value);
  }

  async storeDecision(userId, topic, outcome) {
    return MemoryUpdater.storeDecision(userId, topic, outcome);
  }

  async updateProject(userId, projectKey, updates) {
    return MemoryUpdater.updateProject(userId, projectKey, updates);
  }
}

module.exports = new MemoryManager();
