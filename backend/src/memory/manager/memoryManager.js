const MemoryStorage = require('../storage/memoryStorage');
const MemoryRetriever = require('../retrieval/memoryRetriever');
const MemoryUpdater = require('../updater/memoryUpdater');

class MemoryManager {
  async getContextForUser(userId) {
    return MemoryRetriever.getRelevantContext(userId);
  }

  async search(userId, query) {
    return MemoryRetriever.search(userId, query);
  }

  async getActiveProjects(userId) {
    return MemoryRetriever.getActiveProjects(userId);
  }

  async getLearnedSkills(userId) {
    return MemoryRetriever.getLearnedSkills(userId);
  }

  async addMemory(userId, type, key, value, options = {}) {
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

  async listMemories(userId, type) {
    return type
      ? MemoryStorage.listByType(userId, type)
      : MemoryStorage.list(userId);
  }

  async extractFromConversation(userId, userMessage, assistantResponse) {
    await Promise.all([
      MemoryUpdater.extractAndStore(userId, userMessage, assistantResponse),
      MemoryUpdater.extractPreference(userId, userMessage, assistantResponse),
    ]);
  }

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
