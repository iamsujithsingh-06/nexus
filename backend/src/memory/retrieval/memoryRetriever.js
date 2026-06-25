const Memory = require('../../models/Memory');
const { detectMemoryQuery } = require('../detection/memoryQueryDetector');
const { rankMemories } = require('../ranking/memoryRanker');
const EmbeddingService = require('../services/embeddingService');
const QueryNormalizer = require('./queryNormalizer');

const RETRIEVAL_CONFIG = {
  minScore: 0.35,
  maxResults: 5,
  candidateLimit: 20,
  typePrefetchLimit: 10,
};

class MemoryRetriever {
  async getContextForMessage(userId, message) {
    const ret = { memories: [], log: { query: message, detector: null, candidates: 0, selected: 0, rejected: 0, scores: [], confidence: 0 } };
    try {
      const query = detectMemoryQuery(message);
      ret.log.detector = query;
      if (!query.isMemoryQuery) return ret.memories;

      let candidates;

      if (query.key) {
        const memory = await Memory.findOne({ userId, key: query.key }).lean();
        if (memory) {
          await this._trackAccess(memory._id);
          const scored = await rankMemories([memory], message, query.type, query.key, userId, { maxResults: 1 });
          ret.log.candidates = 1;
          ret.log.selected = 1;
          ret.log.scores = scored.map(m => ({ id: m._id, key: m.key, score: m._score, semantic: m._semantic, signals: m._signals }));
          ret.log.confidence = scored.length > 0 ? scored[0]._score : 0;
          if (scored.length > 0) {
            const top = scored[0];
            ret.memories = [{ memory: top, _score: top._score }];
          }
          this._logRetrieval(ret.log);
          return ret.memories;
        }
        ret.log.candidates = 0;
        ret.log.rejected = 0;
        this._logRetrieval(ret.log);
        return ret.memories;
      }

      if (query.type) {
        candidates = await Memory.find({ userId, type: query.type })
          .sort({ priority: -1, updatedAt: -1 })
          .limit(RETRIEVAL_CONFIG.typePrefetchLimit)
          .lean();
      } else {
        candidates = await Memory.find({ userId })
          .sort({ importance: -1, updatedAt: -1 })
          .limit(RETRIEVAL_CONFIG.candidateLimit)
          .lean();
      }

      ret.log.candidates = candidates.length;
      if (!candidates.length) {
        this._logRetrieval(ret.log);
        return ret.memories;
      }

      const effectiveMinScore = query.type ? RETRIEVAL_CONFIG.minScore : 0.15;
      const ranked = await rankMemories(candidates, message, query.type, null, userId, {
        minScore: effectiveMinScore,
        maxResults: RETRIEVAL_CONFIG.maxResults,
      });

      ret.log.selected = ranked.length;
      ret.log.rejected = candidates.length - ranked.length;
      ret.log.scores = ranked.map(m => ({ id: m._id, key: m.key, score: m._score, semantic: m._semantic, signals: m._signals }));
      ret.log.confidence = ranked.length > 0 ? ranked[0]._score : 0;

      if (ranked.length > 0) {
        const ids = ranked.map(m => m._id).filter(Boolean);
        if (ids.length > 0) {
          Memory.updateMany(
            { _id: { $in: ids } },
            { $inc: { accessCount: 1 }, $set: { lastAccessedAt: new Date() } }
          ).catch(() => {});
        }
        ret.memories = ranked.map(m => ({ memory: m, _score: m._score }));
      }

      this._logRetrieval(ret.log);
      return ret.memories;
    } catch (error) {
      console.error('[MemoryRetriever] getContextForMessage failed:', error.message);
      this._logRetrieval({ ...ret.log, error: error.message });
      return ret.memories;
    }
  }

  async getRelevantContext(userId, maxMemories = 15) {
    try {
      const memories = await Memory.find({ userId })
        .sort({ priority: -1, updatedAt: -1 }).limit(maxMemories).lean();
      if (!memories.length) return null;
      const categorized = { profile: [], preferences: [], goals: [], skills: [], projects: [], insights: [], facts: [], decisions: [], interests: [] };
      for (const m of memories) {
        const t = m.type;
        if (t === 'user_profile') categorized.profile.push(m);
        else if (t === 'preference') categorized.preferences.push(m);
        else if (t === 'goal') categorized.goals.push(m);
        else if (t === 'skill' || t === 'learning_progress') categorized.skills.push(m);
        else if (t === 'project') categorized.projects.push(m);
        else if (t === 'conversation_insight') categorized.insights.push(m);
        else if (t === 'fact') categorized.facts.push(m);
        else if (t === 'decision') categorized.decisions.push(m);
        else if (t === 'interest') categorized.interests.push(m);
      }
      return this._formatContext(categorized);
    } catch (error) {
      console.error('[MemoryRetriever] getRelevantContext failed:', error.message);
      return null;
    }
  }

  async getByKey(userId, key) {
    try {
      const memory = await Memory.findOne({ userId, key }).sort({ updatedAt: -1 }).lean();
      if (memory) { await this._trackAccess(memory._id); }
      return memory || null;
    } catch (error) {
      return null;
    }
  }

  async getByType(userId, type) {
    try {
      return await Memory.find({ userId, type }).sort({ importance: -1, updatedAt: -1 }).limit(10).lean();
    } catch { return []; }
  }

  async getAllUserInfo(userId) {
    try {
      return await Memory.find({ userId }).sort({ importance: -1, updatedAt: -1 }).limit(30).lean();
    } catch { return []; }
  }

  async search(userId, query, limit = 10) {
    try {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return await Memory.find({
        userId,
        $or: [
          { key: regex }, { tags: regex },
          { 'value.name': regex }, { 'value.description': regex },
          { 'value.title': regex }, { 'value.language': regex },
          { 'value.technology': regex }, { 'value.topic': regex }, { 'value.subject': regex },
        ],
      }).sort({ priority: -1, updatedAt: -1 }).limit(limit).lean();
    } catch { return []; }
  }

  async searchSemantic(userId, query, limit = 10) {
    try { return await EmbeddingService.hybridSearch(userId, query, limit); }
    catch { return []; }
  }

  async getProfileSummary(userId) {
    try {
      const memories = await Memory.find({ userId }).sort({ importance: -1, updatedAt: -1 }).limit(50).lean();
      if (!memories.length) return null;
      const summary = { profile: {}, goals: [], preferences: { likes: [], dislikes: [] }, projects: [], interests: [], skills: [], facts: [], insights: [], conversationHistory: [] };
      for (const mem of memories) {
        switch (mem.type) {
          case 'profile': Object.assign(summary.profile, mem.value); break;
          case 'goal': summary.goals.push(mem.value.title || mem.value.description || mem.key); break;
          case 'preference':
            if (mem.value.type === 'like') summary.preferences.likes.push(mem.value.subject);
            else if (mem.value.type === 'dislike') summary.preferences.dislikes.push(mem.value.subject);
            break;
          case 'project': summary.projects.push(mem.value.name || mem.key); break;
          case 'interest': summary.interests.push(mem.value.topic || mem.key); break;
          case 'skill': case 'learning_progress': summary.skills.push(mem.value.name || mem.key); break;
          case 'fact': summary.facts.push(typeof mem.value === 'string' ? mem.value : mem.value.description); break;
          case 'insight': summary.insights.push(typeof mem.value === 'string' ? mem.value : mem.value.observation); break;
          case 'conversation': summary.conversationHistory.push(mem.value.summary || mem.key); break;
        }
      }
      return summary;
    } catch { return null; }
  }

  async _trackAccess(id) {
    Memory.updateOne({ _id: id }, { $inc: { accessCount: 1 }, $set: { lastAccessedAt: new Date() } }).catch(() => {});
  }

  _logRetrieval(log) {
    console.log(`[Retrieval] query="${log.query}" detector=${JSON.stringify(log.detector)} candidates=${log.candidates} selected=${log.selected} rejected=${log.rejected} confidence=${log.confidence.toFixed(3)}`);
    if (log.scores && log.scores.length > 0) {
      for (const s of log.scores) {
        console.log(`[Retrieval]   → score=${s.score.toFixed(3)} sem=${(s.semantic||0).toFixed(3)} key="${s.key || '?'}" signals=${JSON.stringify(s.signals || {})}`);
      }
    }
    if (log.rejected > 0) {
      console.log(`[Retrieval]   ${log.rejected} memories below threshold (min=${RETRIEVAL_CONFIG.minScore})`);
    }
  }

  _formatContext(categorized) {
    const parts = [];
    if (categorized.profile.length) {
      const p = categorized.profile[0].value;
      const pp = [];
      if (p.name) pp.push(`Name: ${p.name}`);
      if (p.role) pp.push(`Role: ${p.role}`);
      if (p.location) pp.push(`Location: ${p.location}`);
      if (p.bio) pp.push(`Bio: ${p.bio}`);
      if (pp.length) parts.push(`User Profile: ${pp.join(', ')}`);
    }
    if (categorized.preferences.length) {
      const likes = categorized.preferences.filter(p => p.value?.type === 'like').map(p => p.value?.subject).filter(Boolean);
      const dislikes = categorized.preferences.filter(p => p.value?.type === 'dislike').map(p => p.value?.subject).filter(Boolean);
      if (likes.length) parts.push(`Likes: ${likes.join(', ')}`);
      if (dislikes.length) parts.push(`Dislikes: ${dislikes.join(', ')}`);
    }
    if (categorized.goals.length) {
      parts.push(`Active Goals: ${categorized.goals.map(g => g.value.title || g.value.description || g.key).join(', ')}`);
    }
    if (categorized.skills.length) {
      parts.push(`Known Skills: ${categorized.skills.map(s => s.value.name || s.key).join(', ')}`);
    }
    if (categorized.projects.length) {
      parts.push(`Active Projects: ${categorized.projects.map(p => `${p.value.name || p.key} (${p.value.stage || 'active'})`).join(', ')}`);
    }
    if (categorized.facts.length) {
      parts.push(`Known Facts: ${categorized.facts.map(f => typeof f.value === 'string' ? f.value : (f.value.description || f.key)).join(', ')}`);
    }
    return parts.length ? parts.join('\n') : null;
  }
}

module.exports = new MemoryRetriever();
