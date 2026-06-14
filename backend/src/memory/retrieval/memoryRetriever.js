const Memory = require('../../models/Memory');

class MemoryRetriever {
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
