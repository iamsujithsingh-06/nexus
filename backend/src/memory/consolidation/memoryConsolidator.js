const Memory = require('../../models/Memory');
const MemoryStorage = require('../storage/memoryStorage');

/**
 * Memory Consolidator — Manages memory lifecycle:
 *   - Merge duplicate/related memories
 *   - Resolve contradictions (keep higher-confidence version)
 *   - Decay stale memories (reduce priority of unused memories)
 *   - Promote frequently accessed memories
 *
 * Run on a schedule (e.g., every hour) or on-demand.
 */
class MemoryConsolidator {
  /**
   * Run full consolidation for a user.
   * @param {string} userId
   * @returns {object} Summary of actions taken
   */
  async consolidate(userId) {
    const actions = {
      merged: 0,
      resolved: 0,
      decayed: 0,
      promoted: 0,
      archived: 0,
    };

    const [mergeResult, decayResult, promoteResult] = await Promise.all([
      this._mergeDuplicates(userId),
      this._decayStale(userId),
      this._promoteImportant(userId),
    ]);

    actions.merged = mergeResult;
    actions.decayed = decayResult;
    actions.promoted = promoteResult;

    if (actions.merged + actions.decayed + actions.promoted > 0) {
      console.log(`[MemoryConsolidator] User ${userId}: merged ${actions.merged}, decayed ${actions.decayed}, promoted ${actions.promoted}`);
    }

    return actions;
  }

  /**
   * Merge duplicate or closely related memories.
   * Two memories are considered duplicates if they share the same type
   * and have high text overlap in their values.
   */
  async _mergeDuplicates(userId) {
    const memories = await Memory.find({ userId })
      .sort({ confidence: -1, updatedAt: -1 })
      .lean();

    if (memories.length < 2) return 0;

    let merged = 0;
    const processed = new Set();

    for (let i = 0; i < memories.length; i++) {
      if (processed.has(memories[i]._id.toString())) continue;

      for (let j = i + 1; j < memories.length; j++) {
        if (processed.has(memories[j]._id.toString())) continue;

        if (this._areRelated(memories[i], memories[j])) {
          // Keep the one with higher confidence, merge values
          const primary = memories[i].confidence >= memories[j].confidence ? memories[i] : memories[j];
          const secondary = primary === memories[i] ? memories[j] : memories[i];

          const mergedValue = this._mergeValues(primary, secondary);
          const mergedTags = [...new Set([...(primary.tags || []), ...(secondary.tags || [])])];

          await MemoryStorage.update(primary.userId, primary.key, {
            value: mergedValue,
            tags: mergedTags,
            confidence: Math.max(primary.confidence || 0.5, secondary.confidence || 0.5),
            accessCount: (primary.accessCount || 0) + (secondary.accessCount || 0),
            importance: Math.max(primary.importance || 0, secondary.importance || 0),
          });

          // Delete the secondary
          await Memory.deleteOne({ _id: secondary._id });
          processed.add(secondary._id.toString());
          merged++;
        }
      }

      processed.add(memories[i]._id.toString());
    }

    return merged;
  }

  /**
   * Decay memories that haven't been accessed recently.
   * Reduces importance and priority for stale memories.
   */
  async _decayStale(userId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Memories not accessed in 30+ days: reduce priority
    const stale = await Memory.find({
      userId,
      $or: [
        { lastAccessedAt: { $lt: thirtyDaysAgo, $exists: true } },
        { lastAccessedAt: { $exists: false }, updatedAt: { $lt: thirtyDaysAgo } },
      ],
      importance: { $gt: -5 },
    }).limit(50);

    for (const mem of stale) {
      mem.importance = Math.max(-5, (mem.importance || 0) - 1);
      mem.priority = Math.max(-5, (mem.priority || 0) - 1);
      mem.tags = [...(mem.tags || []), 'stale'];
      await mem.save();
    }

    // Memories not accessed in 7+ days with low importance: mark as stale
    const lowImportance = await Memory.find({
      userId,
      $or: [
        { lastAccessedAt: { $lt: sevenDaysAgo, $exists: true } },
        { lastAccessedAt: { $exists: false }, updatedAt: { $lt: sevenDaysAgo } },
      ],
      importance: { $lte: 0 },
      priority: { $lte: 2 },
      tags: { $nin: ['stale'] },
    }).limit(50);

    for (const mem of lowImportance) {
      mem.tags = [...(mem.tags || []), 'stale'];
      await mem.save();
    }

    return stale.length + lowImportance.length;
  }

  /**
   * Promote frequently accessed or high-confidence memories.
   */
  async _promoteImportant(userId) {
    const frequentlyAccessed = await Memory.find({
      userId,
      accessCount: { $gte: 5 },
      tags: { $nin: ['important'] },
    }).limit(20);

    for (const mem of frequentlyAccessed) {
      mem.importance = Math.min(10, (mem.importance || 0) + 1);
      mem.priority = Math.min(10, (mem.priority || 0) + 1);
      mem.tags = [...new Set([...(mem.tags || []), 'important'])];
      await mem.save();
    }

    return frequentlyAccessed.length;
  }

  /**
   * Check if two memories are related (same type + similar text).
   */
  _areRelated(a, b) {
    if (a.type !== b.type) return false;
    if (a.type === 'conversation' || a.type === 'insight') return false;

    const textA = this._valueToString(a.value);
    const textB = this._valueToString(b.value);

    if (!textA || !textB) return false;

    // Same key prefix = likely about the same thing
    const keyA = a.key.split(':').slice(0, 2).join(':');
    const keyB = b.key.split(':').slice(0, 2).join(':');
    if (keyA === keyB && keyA !== a.key) return true;

    // High text overlap
    const wordsA = new Set(textA.toLowerCase().split(/\s+/));
    const wordsB = new Set(textB.toLowerCase().split(/\s+/));
    const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);

    const jaccard = union.size > 0 ? intersection.size / union.size : 0;
    return jaccard > 0.5;
  }

  _mergeValues(primary, secondary) {
    const merged = { ...(primary.value || {}), ...(secondary.value || {}) };

    // For preferences, collect both if they differ
    if (primary.type === 'preference') {
      const subjects = new Set();
      const values = [primary, secondary];
      for (const v of values) {
        if (v.value && v.value.subject) {
          subjects.add(v.value.subject);
        }
      }
      if (subjects.size > 1) {
        merged.subjects = [...subjects];
      }
    }

    return merged;
  }

  _valueToString(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return Object.values(value).filter((v) => typeof v === 'string').join(' ');
    }
    return String(value);
  }
}

module.exports = new MemoryConsolidator();
