const MemoryManager = require('../manager/memoryManager');
const MemoryCategorySchemas = require('../models/MemoryCategorySchemas');
const importanceScorer = require('./importanceScorer');
const duplicateDetector = require('./duplicateDetector');
const smartForgetting = require('./smartForgetting');
const memoryLifecycle = require('./memoryLifecycle');
const memoryUpdateEngine = require('./memoryUpdateEngine');
const contextRanker = require('./contextRanker');
const memorySearch = require('./memorySearch');
const logger = require('./memoryLogger');
const cache = require('./memoryCache');

class MemoryEngine {
  /**
   * Save a memory with v2 intelligence pipeline:
   *   smartForgetting → duplicate detection → importance scoring → persist
   */
  async save(userId, type, key, value, options = {}) {
    const start = logger.timeStart();
    const message = options.message || '';

    // Step 1: Smart forgetting — skip greetings/jokes/temp
    const forgetCheck = smartForgetting.shouldStore(message || (typeof value === 'string' ? value : JSON.stringify(value)));
    if (!forgetCheck.store) {
      logger.log('IGNORED', { userId, type, key, reason: forgetCheck.reason });
      return { saved: false, reason: forgetCheck.reason };
    }

    // Step 2: Duplicate detection — find similar existing memory
    const existing = await duplicateDetector.findBySimilarity(userId, type, message || '');
    if (existing) {
      const mergedValue = existing.value;
      if (typeof mergedValue === 'object' && typeof value === 'object') {
        Object.assign(mergedValue, value);
      }

      const updated = await MemoryManager.updateMemory(userId, existing.key, {
        value: mergedValue,
        lastAccessedAt: new Date(),
        $inc: { accessCount: 1, timesUsed: 1 },
      });

      logger.log('MERGED', { userId, type, key: existing.key, reason: 'Duplicate — updated existing' });
      return { saved: true, memory: updated, merged: true };
    }

    // Step 3: Calculate importance score
    const importanceScore = options.importanceScore ?? importanceScorer.score(type, message, value);
    const lifecycleStatus = options.lifecycleStatus ?? importanceScorer.determineLifecycle(importanceScore);

    // Step 4: Save via v1 MemoryManager
    const memory = await MemoryManager.addMemory(userId, type, key, value, {
      ...options,
      importance: Math.round(importanceScore * 10) - 5,
      importanceScore,
      lifecycleStatus,
    });

    // Step 5: Update importanceScore and lifecycleStatus on the saved doc
    if (memory && memory._id) {
      const Memory = require('../../models/Memory');
      await Memory.updateOne(
        { _id: memory._id },
        { $set: { importanceScore, lifecycleStatus } }
      );
    }

    // Step 6: Invalidate cache
    cache.invalidate(userId, type);

    logger.timeEnd('SAVED', { userId, type, key, importanceScore, lifecycleStatus });
    return { saved: true, memory, merged: false };
  }

  /**
   * Retrieve top N relevant memories for a given user + query.
   * Uses contextRanker for multi-signal scoring.
   */
  async retrieve(userId, query, options = {}) {
    const start = logger.timeStart();
    const maxResults = options.maxResults ?? 5;

    const cached = cache.get(userId, 'retrieve');
    if (cached) {
      const ranked = contextRanker.rank(cached, query, { ...options, maxResults });
      logger.log('RETRIEVED', { userId, count: ranked.length, cached: true });
      return ranked;
    }

    const memories = await MemoryManager.listMemories(userId);
    cache.set(userId, 'retrieve', memories);

    const ranked = contextRanker.rank(memories, query, { ...options, maxResults });

    logger.log('RETRIEVED', { userId, count: ranked.length, elapsed: Date.now() - start });
    return ranked;
  }

  /**
   * Unified search — category, keyword, semantic, date, importance.
   */
  async search(userId, options = {}) {
    return memorySearch.search(userId, options);
  }

  /**
   * Run lifecycle maintenance: archive old, expire temporary, promote important.
   */
  async maintain(userId) {
    return memoryLifecycle.runMaintenance(userId);
  }

  /**
   * Detect and update existing memory when user changes something.
   */
  async updateOnChange(userId, message, intent) {
    return memoryUpdateEngine.detectAndUpdate(userId, message, intent);
  }

  /**
   * Get memory intelligence stats.
   */
  async getStats(userId) {
    const [counts, lifecycleStats] = await Promise.all([
      MemoryManager.getMemoryStats(userId),
      memoryLifecycle.getLifecycleStats(userId),
    ]);
    return { ...counts, lifecycle: lifecycleStats };
  }

  /**
   * Get user profile summary using v2 ranking.
   */
  async getProfileSummary(userId) {
    const ranked = await this.retrieve(userId, 'profile', { maxResults: 10 });
    const profile = { name: null, role: null, company: null, location: null, skills: [], goals: [], preferences: [] };

    for (const { memory } of ranked) {
      const val = memory.value || {};
      if (memory.type === 'profile' || memory.type === 'user_profile') {
        if (val.name) profile.name = val.name;
        if (val.role) profile.role = val.role;
        if (val.company) profile.company = val.company;
        if (val.location) profile.location = val.location;
        if (val.skills) profile.skills = Array.isArray(val.skills) ? val.skills : [val.skills];
      }
      if (memory.type === 'goal') {
        profile.goals.push(val.title || val.description || '');
      }
      if (memory.type === 'preference') {
        profile.preferences.push(`${val.type || ''}: ${val.subject || ''}`);
      }
    }

    return profile;
  }
}

module.exports = new MemoryEngine();
