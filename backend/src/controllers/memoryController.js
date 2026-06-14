const MemoryManager = require('../memory/manager/memoryManager');
const Memory = require('../models/Memory');
const AppError = require('../utils/AppError');

/**
 * Memory Controller — REST API for the persistent memory system.
 */
class MemoryController {
  /**
   * List memories with optional filters.
   * GET /api/memory?type=goal&tags=important&search=python&limit=20
   */
  async list(req, res, next) {
    try {
      const { type, tags, search, limit } = req.query;
      const userId = req.user._id;

      if (search) {
        const results = await MemoryManager.searchSemantic(userId, search, parseInt(limit) || 10);
        return res.status(200).json({ success: true, memories: results, search, semantic: true });
      }

      if (type) {
        const memories = await MemoryManager.listMemories(userId, type);
        return res.status(200).json({ success: true, memories, count: memories.length });
      }

      const memories = await MemoryManager.listMemories(userId);
      res.status(200).json({ success: true, memories, count: memories.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single memory by ID.
   * GET /api/memory/:id
   */
  async getById(req, res, next) {
    try {
      const memory = await MemoryManager.getMemoryById(req.params.id);
      if (!memory || memory.userId.toString() !== req.user._id.toString()) {
        return next(new AppError('Memory not found', 404));
      }
      res.status(200).json({ success: true, memory });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a memory manually.
   * POST /api/memory
   */
  async create(req, res, next) {
    try {
      const { type, value, key, tags, priority, confidence, source } = req.body;
      const userId = req.user._id;

      if (!type || !value) {
        return next(new AppError('Type and value are required', 400));
      }

      const types = MemoryManager.getCategoryTypes();
      if (!types.includes(type)) {
        return next(new AppError(`Invalid type. Must be one of: ${types.join(', ')}`, 400));
      }

      const memoryKey = key || `${type}:${Date.now()}`;

      const memory = await MemoryManager.addMemory(userId, type, memoryKey, value, {
        tags: tags || [type],
        priority: priority ?? 5,
        confidence: confidence ?? 0.9,
        source: source || 'manual',
      });

      // Generate embedding asynchronously
      MemoryManager.embedUserMemories(userId).catch(() => {});

      res.status(201).json({ success: true, memory });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a memory.
   * PUT /api/memory/:id
   */
  async update(req, res, next) {
    try {
      const { value, tags, priority, confidence } = req.body;
      const userId = req.user._id;

      const existing = await MemoryManager.getMemoryById(req.params.id);
      if (!existing || existing.userId.toString() !== userId.toString()) {
        return next(new AppError('Memory not found', 404));
      }

      const updates = {};
      if (value !== undefined) updates.value = value;
      if (tags !== undefined) updates.tags = tags;
      if (priority !== undefined) updates.priority = priority;
      if (confidence !== undefined) updates.confidence = confidence;

      await MemoryManager.updateMemory(userId, existing.key, updates);

      // Re-embed after update
      MemoryManager.embedUserMemories(userId).catch(() => {});

      const updated = await MemoryManager.getMemoryById(req.params.id);
      res.status(200).json({ success: true, memory: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a memory.
   * DELETE /api/memory/:id
   */
  async delete(req, res, next) {
    try {
      const userId = req.user._id;
      const existing = await MemoryManager.getMemoryById(req.params.id);

      if (!existing || existing.userId.toString() !== userId.toString()) {
        return next(new AppError('Memory not found', 404));
      }

      await MemoryManager.deleteMemoryById(userId, req.params.id);
      res.status(200).json({ success: true, message: 'Memory deleted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Semantic search.
   * POST /api/memory/search
   */
  async search(req, res, next) {
    try {
      const { query, limit } = req.body;
      const userId = req.user._id;

      if (!query) {
        return next(new AppError('Search query is required', 400));
      }

      const results = await MemoryManager.searchSemantic(userId, query, parseInt(limit) || 10);
      res.status(200).json({ success: true, memories: results, query });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile summary.
   * GET /api/memory/summary
   */
  async summary(req, res, next) {
    try {
      const userId = req.user._id;
      const summary = await MemoryManager.getProfileSummary(userId);

      if (!summary) {
        return res.status(200).json({
          success: true,
          summary: null,
          message: 'No memories stored yet. Start a conversation to build memories.',
        });
      }

      res.status(200).json({ success: true, summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger consolidation.
   * POST /api/memory/consolidate
   */
  async consolidate(req, res, next) {
    try {
      const userId = req.user._id;
      const actions = await MemoryManager.consolidate(userId);

      res.status(200).json({
        success: true,
        message: `Consolidation complete: merged ${actions.merged}, decayed ${actions.decayed}, promoted ${actions.promoted}`,
        actions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get memory statistics.
   * GET /api/memory/stats
   */
  async stats(req, res, next) {
    try {
      const userId = req.user._id;
      const stats = await MemoryManager.getMemoryStats(userId);
      res.status(200).json({ success: true, stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available memory categories and their schemas.
   * GET /api/memory/categories
   */
  async categories(req, res, next) {
    try {
      const meta = req.query.type
        ? { [req.query.type]: MemoryManager.getCategoryMeta(req.query.type) }
        : MemoryManager.getCategoryMeta();

      res.status(200).json({ success: true, categories: meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch create memories.
   * POST /api/memory/batch
   */
  async batchCreate(req, res, next) {
    try {
      const { memories } = req.body;
      const userId = req.user._id;

      if (!Array.isArray(memories) || memories.length === 0) {
        return next(new AppError('Array of memories is required', 400));
      }

      const results = [];
      for (const mem of memories) {
        const { type, value, key, tags, priority, confidence, source } = mem;
        if (!type || !value) continue;

        const memoryKey = key || `${type}:${Date.now()}:${Math.random().toString(36).slice(2, 6)}`;
        const saved = await MemoryManager.addMemory(userId, type, memoryKey, value, {
          tags: tags || [type],
          priority: priority ?? 5,
          confidence: confidence ?? 0.7,
          source: source || 'manual',
        });
        results.push(saved);
      }

      // Embed in background
      MemoryManager.embedUserMemories(userId).catch(() => {});

      res.status(201).json({ success: true, memories: results, count: results.length });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MemoryController();
