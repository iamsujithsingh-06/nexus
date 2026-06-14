const MemoryStorage = require('../storage/memoryStorage');

const EXTRACTION_PATTERNS = {
  name: /my name is (\w+)/i,
  role: /i (?:am a|work as|'m a) ([^.]+?)(?:\.|,|$)/i,
  learning: /i (?:want to learn|'?m learning|am learning) ([^.]+?)(?:\.|,|$)/i,
  goal: /my goal is to ([^.]+?)(?:\.|,|$)/i,
  preference_positive: /i (?:like|love|prefer|enjoy) ([^.]+?)(?:\.|,|$)/i,
  preference_negative: /i (?:don't like|hate|dislike|avoid) ([^.]+?)(?:\.|,|$)/i,
};

class MemoryUpdater {
  async extractAndStore(userId, userMessage, assistantResponse) {
    const combined = `${userMessage} ${assistantResponse}`;
    const updates = [];

    for (const [patternName, regex] of Object.entries(EXTRACTION_PATTERNS)) {
      const match = combined.match(regex);
      if (!match) continue;

      const value = match[1].trim();
      if (!value) continue;

      switch (patternName) {
        case 'name':
          updates.push(this._updateMemory(userId, 'user_profile', 'user_name', { name: value }, 8));
          break;
        case 'role':
          updates.push(this._updateMemory(userId, 'user_profile', 'user_role', { role: value }, 6));
          break;
        case 'learning':
          updates.push(this._updateMemory(userId, 'learning_progress', `learning:${value}`, { name: value, status: 'in_progress', proficiency: 'learning' }, 5));
          break;
        case 'goal':
          updates.push(this._updateMemory(userId, 'goal', `goal:${value}`, { title: value, status: 'active' }, 7));
          break;
      }
    }

    if (updates.length) {
      await Promise.all(updates);
    }

    return updates.length;
  }

  async extractPreference(userId, message, assistantResponse) {
    const combined = `${message} ${assistantResponse}`;

    const posMatch = combined.match(EXTRACTION_PATTERNS.preference_positive);
    const negMatch = combined.match(EXTRACTION_PATTERNS.preference_negative);

    if (posMatch) {
      const pref = posMatch[1].trim();
      await this._updateMemory(userId, 'preference', `pref:like:${pref}`, { type: 'like', subject: pref }, 4);
      return true;
    }

    if (negMatch) {
      const pref = negMatch[1].trim();
      await this._updateMemory(userId, 'preference', `pref:dislike:${pref}`, { type: 'dislike', subject: pref }, 4);
      return true;
    }

    return false;
  }

  async storeInsight(userId, insight) {
    const timestamp = Date.now();
    return this._updateMemory(
      userId,
      'conversation_insight',
      `insight:${timestamp}`,
      {
        description: insight,
        timestamp: new Date(),
      },
      2
    );
  }

  async storeFact(userId, key, value) {
    return this._updateMemory(userId, 'fact', `fact:${key}`, value, 3);
  }

  async storeDecision(userId, topic, outcome) {
    return this._updateMemory(userId, 'decision', `decision:${topic}`, { topic, outcome, timestamp: new Date() }, 5);
  }

  async updateProject(userId, projectKey, updates) {
    const existing = await MemoryStorage.get(userId, `project:${projectKey}`);
    if (existing) {
      return MemoryStorage.update(userId, `project:${projectKey}`, {
        value: { ...existing.value, ...updates },
      });
    }
    return MemoryStorage.save(userId, 'project', `project:${projectKey}`, updates);
  }

  async _updateMemory(userId, type, key, value, priority = 0) {
    return MemoryStorage.save(userId, type, key, value, {
      priority,
      source: 'auto',
      tags: [type, ...Object.keys(value)],
    });
  }
}

module.exports = new MemoryUpdater();
