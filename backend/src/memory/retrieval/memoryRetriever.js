const Memory = require('../../models/Memory');
const { detectMemoryQuery } = require('../detection/memoryQueryDetector');
const { rankMemories } = require('../ranking/memoryRanker');
const EmbeddingService = require('../services/embeddingService');

class MemoryRetriever {
  /**
   * Get context for a specific message — uses query detection + relevance ranking.
   * This is the NEW primary entry point for memory retrieval.
   *
   * @param {string} userId
   * @param {string} message - The current user message
   * @returns {Promise<Array<{memory: object, _score: number}>>} Ranked memories (max 5)
   */
  async getContextForMessage(userId, message) {
    try {
      // Step 1: Detect if message is asking about stored memories
      const query = detectMemoryQuery(message);

      if (!query.isMemoryQuery) return [];

      // Step 2: Direct key lookup (fastest path)
      if (query.key) {
        const memory = await Memory.findOne({ userId, key: query.key }).lean();
        if (memory) {
          await Memory.updateOne(
            { _id: memory._id },
            { $inc: { accessCount: 1 }, $set: { lastAccessedAt: new Date() } }
          ).catch(() => {});
          return [{ memory, _score: 1.0 }];
        }
      }

      // Step 3: Fetch all memories for scoring
      const allMemories = await Memory.find({ userId })
        .sort({ importance: -1, updatedAt: -1 })
        .limit(50)
        .lean();

      if (!allMemories.length) return [];

      // Step 4: Rank by relevance to the message
      let targetType = query.type;
      let targetKey = query.key;

      const ranked = rankMemories(allMemories, message, targetType, targetKey);

      // Step 5: Track access
      const ids = ranked.map((m) => m._id).filter(Boolean);
      if (ids.length > 0) {
        Memory.updateMany(
          { _id: { $in: ids } },
          { $inc: { accessCount: 1 }, $set: { lastAccessedAt: new Date() } }
        ).catch(() => {});
      }

      return ranked;
    } catch (error) {
      console.error('[MemoryRetriever] getContextForMessage failed:', error.message);
      return [];
    }
  }

  /**
   * Legacy: get all relevant context, formatted as text.
   * Kept for backward compatibility with contextEngine / full pipeline.
   *
   * @param {string} userId
   * @param {number} maxMemories
   * @returns {Promise<string|null>} Formatted context string
   */
  async getRelevantContext(userId, maxMemories = 15) {
    try {
      const memories = await Memory.find({ userId })
        .sort({ priority: -1, updatedAt: -1 })
        .limit(maxMemories)
        .lean();

      if (!memories.length) return null;

      const categorized = {
        profile: [],
        preferences: [],
        goals: [],
        skills: [],
        projects: [],
        insights: [],
        facts: [],
        decisions: [],
      };

      for (const m of memories) {
        switch (m.type) {
          case 'user_profile':
            categorized.profile.push(m);
            break;
          case 'preference':
            categorized.preferences.push(m);
            break;
          case 'goal':
            categorized.goals.push(m);
            break;
          case 'skill':
            categorized.skills.push(m);
            break;
          case 'project':
            categorized.projects.push(m);
            break;
          case 'conversation_insight':
            categorized.insights.push(m);
            break;
          case 'fact':
            categorized.facts.push(m);
            break;
          case 'decision':
            categorized.decisions.push(m);
            break;
        }
      }

      return this._formatContext(categorized);
    } catch (error) {
      console.error('[MemoryRetriever] getRelevantContext failed:', error.message);
      return null;
    }
  }

  /**
   * Get a single memory by key.
   */
  async getByKey(userId, key) {
    try {
      const memory = await Memory.findOne({ userId, key })
        .sort({ updatedAt: -1 })
        .lean();
      if (memory) {
        Memory.updateOne(
          { _id: memory._id },
          { $inc: { accessCount: 1 }, $set: { lastAccessedAt: new Date() } }
        ).catch(() => {});
      }
      return memory || null;
    } catch (error) {
      console.error('[MemoryRetriever] getByKey failed:', error.message);
      return null;
    }
  }

  /**
   * Get all memories of a specific type.
   */
  async getByType(userId, type) {
    try {
      return await Memory.find({ userId, type })
        .sort({ importance: -1, updatedAt: -1 })
        .limit(10)
        .lean();
    } catch (error) {
      console.error('[MemoryRetriever] getByType failed:', error.message);
      return [];
    }
  }

  /**
   * Get all stored information about a user in one call.
   * Used by "what do you know about me" queries.
   */
  async getAllUserInfo(userId) {
    try {
      const memories = await Memory.find({ userId })
        .sort({ importance: -1, updatedAt: -1 })
        .limit(30)
        .lean();

      if (!memories.length) return [];

      return memories;
    } catch (error) {
      console.error('[MemoryRetriever] getAllUserInfo failed:', error.message);
      return [];
    }
  }

  async search(userId, query, limit = 10) {
    try {
      const regex = new RegExp(
        query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
      return await Memory.find({
        userId,
        $or: [
          { key: regex },
          { tags: regex },
          { 'value.name': regex },
          { 'value.description': regex },
          { 'value.title': regex },
          { 'value.language': regex },
          { 'value.technology': regex },
          { 'value.topic': regex },
          { 'value.subject': regex },
        ],
      })
        .sort({ priority: -1, updatedAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('[MemoryRetriever] search failed:', error.message);
      return [];
    }
  }

  /**
   * Semantic search using embeddings.
   */
  async searchSemantic(userId, query, limit = 10) {
    try {
      return await EmbeddingService.hybridSearch(userId, query, limit);
    } catch (error) {
      console.error('[MemoryRetriever] searchSemantic failed:', error.message);
      return [];
    }
  }

  /**
   * Get a comprehensive profile summary compiled from all memories.
   * Used for "what do you know about me?" queries and AI context building.
   */
  async getProfileSummary(userId) {
    try {
      const memories = await Memory.find({ userId })
        .sort({ importance: -1, updatedAt: -1 })
        .limit(50)
        .lean();

      if (!memories.length) return null;

      const summary = {
        profile: {},
        goals: [],
        preferences: { likes: [], dislikes: [] },
        projects: [],
        interests: [],
        skills: [],
        facts: [],
        insights: [],
        conversationHistory: [],
      };

      for (const mem of memories) {
        switch (mem.type) {
          case 'profile':
            Object.assign(summary.profile, mem.value);
            break;
          case 'goal':
            summary.goals.push(mem.value.title || mem.value.description || mem.key);
            break;
          case 'preference':
            if (mem.value.type === 'like') summary.preferences.likes.push(mem.value.subject);
            else if (mem.value.type === 'dislike') summary.preferences.dislikes.push(mem.value.subject);
            break;
          case 'project':
            summary.projects.push(mem.value.name || mem.key);
            break;
          case 'interest':
            summary.interests.push(mem.value.topic || mem.key);
            break;
          case 'skill':
          case 'learning_progress':
            summary.skills.push(mem.value.name || mem.key);
            break;
          case 'fact':
            summary.facts.push(typeof mem.value === 'string' ? mem.value : mem.value.description);
            break;
          case 'insight':
            summary.insights.push(typeof mem.value === 'string' ? mem.value : mem.value.observation);
            break;
          case 'conversation':
            summary.conversationHistory.push(mem.value.summary || mem.key);
            break;
        }
      }

      return summary;
    } catch (error) {
      console.error('[MemoryRetriever] getProfileSummary failed:', error.message);
      return null;
    }
  }

  async getActiveProjects(userId) {
    try {
      return await Memory.find({
        userId,
        type: 'project',
        'value.status': { $ne: 'completed' },
      })
        .sort({ priority: -1, updatedAt: -1 })
        .limit(5)
        .lean();
    } catch (error) {
      console.error('[MemoryRetriever] getActiveProjects failed:', error.message);
      return [];
    }
  }

  async getLearnedSkills(userId) {
    try {
      const skills = await Memory.find({
        userId,
        type: { $in: ['skill', 'learning_progress'] },
      })
        .sort({ priority: -1, updatedAt: -1 })
        .lean();

      const learned = skills.filter(
        (s) => s.value.proficiency === 'learned' || s.value.status === 'completed'
      );
      const learning = skills.filter(
        (s) => s.value.proficiency === 'learning' || s.value.status === 'in_progress'
      );

      return { learned, learning };
    } catch (error) {
      console.error('[MemoryRetriever] getLearnedSkills failed:', error.message);
      return { learned: [], learning: [] };
    }
  }

  _formatContext(categorized) {
    const parts = [];

    if (categorized.profile.length) {
      const p = categorized.profile[0].value;
      const profileParts = [];
      if (p.name) profileParts.push(`Name: ${p.name}`);
      if (p.role) profileParts.push(`Role: ${p.role}`);
      if (p.location) profileParts.push(`Location: ${p.location}`);
      if (p.bio) profileParts.push(`Bio: ${p.bio}`);
      if (profileParts.length) parts.push(`User Profile: ${profileParts.join(', ')}`);
    }

    if (categorized.preferences.length) {
      const prefs = categorized.preferences.map((p) => `${p.key}=${JSON.stringify(p.value)}`).join(', ');
      parts.push(`Preferences: ${prefs}`);
    }

    if (categorized.goals.length) {
      const goals = categorized.goals.map((g) => g.value.title || g.value.description || g.key).join(', ');
      parts.push(`Active Goals: ${goals}`);
    }

    if (categorized.skills.length) {
      const skillNames = categorized.skills.map((s) => s.value.name || s.key).join(', ');
      parts.push(`Known Skills: ${skillNames}`);
    }

    if (categorized.projects.length) {
      const projs = categorized.projects.map((p) => {
        const name = p.value.name || p.key;
        const stage = p.value.stage || 'active';
        return `${name} (${stage})`;
      }).join(', ');
      parts.push(`Active Projects: ${projs}`);
    }

    if (categorized.facts.length) {
      const facts = categorized.facts.map((f) => {
        if (typeof f.value === 'string') return f.value;
        return f.value.description || f.key;
      }).join(', ');
      parts.push(`Known Facts: ${facts}`);
    }

    if (categorized.insights.length) {
      const recent = categorized.insights.slice(0, 3);
      const insights = recent.map((i) => {
        if (typeof i.value === 'string') return i.value;
        return i.value.description || i.key;
      }).join(', ');
      parts.push(`Recent Insights: ${insights}`);
    }

    if (categorized.decisions.length) {
      const decisions = categorized.decisions.slice(0, 3).map((d) => {
        const topic = d.value.topic || d.key;
        const outcome = d.value.outcome || d.value.description || '';
        return `${topic}: ${outcome}`;
      }).join(', ');
      parts.push(`Recent Decisions: ${decisions}`);
    }

    return parts.length ? parts.join('\n') : null;
  }
}

module.exports = new MemoryRetriever();
