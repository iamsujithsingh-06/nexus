const Memory = require('../../models/Memory');

class MemoryStorage {
  async save(userId, type, key, value, options = {}) {
    try {
      const newConfidence = options.confidence ?? 0.5;

      // Check existing — don't overwrite higher-confidence memories
      const existing = await Memory.findOne({ userId, key }).lean();
      if (existing && (existing.confidence || 0) > newConfidence) {
        // Keep the higher-confidence value, but update access metadata
        await Memory.updateOne(
          { _id: existing._id },
          { $set: { lastAccessedAt: new Date() }, $inc: { accessCount: 1 } }
        );
        return await Memory.findById(existing._id);
      }

      const doc = {
        userId,
        type,
        key,
        value,
        tags: options.tags || [],
        priority: options.priority ?? 0,
        importance: options.importance ?? (options.priority ?? 0),
        confidence: newConfidence,
        source: options.source || 'inference',
        context: options.context || '',
        conversationId: options.conversationId || null,
        expiresAt: options.expiresAt || null,
      };

      const memory = await Memory.findOneAndUpdate(
        { userId, key },
        { $set: doc },
        { upsert: true, new: true, runValidators: true }
      );

      return memory;
    } catch (error) {
      console.error(`[MemoryStorage] Save failed for key "${key}":`, error.message);
      throw error;
    }
  }

  async get(userId, key) {
    try {
      return await Memory.findOne({ userId, key });
    } catch (error) {
      console.error(`[MemoryStorage] Get failed for key "${key}":`, error.message);
      return null;
    }
  }

  async getById(memoryId) {
    try {
      return await Memory.findById(memoryId);
    } catch (error) {
      console.error(`[MemoryStorage] GetById failed:`, error.message);
      return null;
    }
  }

  async update(userId, key, updates) {
    try {
      const memory = await Memory.findOneAndUpdate(
        { userId, key },
        { $set: updates },
        { new: true, runValidators: true }
      );
      return memory;
    } catch (error) {
      console.error(`[MemoryStorage] Update failed for key "${key}":`, error.message);
      throw error;
    }
  }

  async delete(userId, key) {
    try {
      const result = await Memory.deleteOne({ userId, key });
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`[MemoryStorage] Delete failed for key "${key}":`, error.message);
      return false;
    }
  }

  async list(userId, filter = {}) {
    try {
      const query = { userId, ...filter };
      return await Memory.find(query)
        .sort({ priority: -1, updatedAt: -1 })
        .limit(100)
        .lean();
    } catch (error) {
      console.error(`[MemoryStorage] List failed:`, error.message);
      return [];
    }
  }

  async listByType(userId, type) {
    return this.list(userId, { type });
  }

  async search(userId, query, limit = 20) {
    try {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return await Memory.find({
        userId,
        $or: [
          { key: regex },
          { 'value.name': regex },
          { 'value.description': regex },
          { 'value.title': regex },
          { tags: regex },
        ],
      })
        .sort({ priority: -1, updatedAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error(`[MemoryStorage] Search failed:`, error.message);
      return [];
    }
  }

  async getHighPriority(userId, minPriority = 3, limit = 10) {
    try {
      return await Memory.find({ userId, priority: { $gte: minPriority } })
        .sort({ priority: -1, updatedAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error(`[MemoryStorage] GetHighPriority failed:`, error.message);
      return [];
    }
  }

  async count(userId, type) {
    try {
      const filter = { userId };
      if (type) filter.type = type;
      return await Memory.countDocuments(filter);
    } catch (error) {
      return 0;
    }
  }
}

module.exports = new MemoryStorage();
