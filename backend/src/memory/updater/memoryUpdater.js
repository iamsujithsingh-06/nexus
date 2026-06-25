const MemoryStorage = require('../storage/memoryStorage');

/**
 * Multi-pattern extraction with confidence scoring.
 * Each pattern type has multiple regex variants to catch natural language variations.
 * Higher confidence = more explicitly stated (e.g., "my name is X" = explicit 0.9,
 * "I'm X" = inference 0.6).
 */

const EXTRACTION_PATTERNS = {
  name: [
    // Explicit: "my name is Sujith" / "my name's Sujith"
    { pattern: /my name is (\w+(?:\s+\w+)?)/i, confidence: 0.9, source: 'explicit' },
    // Explicit: "call me Sujith"
    { pattern: /call me (\w+)/i, confidence: 0.85, source: 'explicit' },
    // Moderate: "I'm Sujith" / "I am Sujith"
    // Negative lookahead avoids matching verbs after "I'm" (building, working, etc.)
    { pattern: /i'?m (?!\w+ing\b)(\w+)(?:\s|$|\.|,)/i, confidence: 0.6, source: 'inference' },
    // Moderate: "Sujith here" / "Sujith"
    { pattern: /^(\w+)\s+here$/i, confidence: 0.5, source: 'inference' },
  ],

  role: [
    { pattern: /i (?:am a|'?m a|work as a) ([a-zA-Z\s]+?)(?:\.|,|$|at|for|in)/i, confidence: 0.8, source: 'explicit' },
    { pattern: /i (?:work as|am) (?:an? )?([a-zA-Z\s]+?)(?:\.|,|$)/i, confidence: 0.7, source: 'explicit' },
    { pattern: /my (?:job|role|title|profession) is ([a-zA-Z\s]+?)(?:\.|,|$)/i, confidence: 0.9, source: 'explicit' },
  ],

  location: [
    { pattern: /i (?:live|reside|stay) (?:in|at) ([a-zA-Z\s]+?)(?:\.|,|$)/i, confidence: 0.8, source: 'explicit' },
    { pattern: /i'?m (?:from|based in) ([a-zA-Z\s]+?)(?:\.|,|$)/i, confidence: 0.7, source: 'explicit' },
    { pattern: /my (?:city|location|hometown) is ([a-zA-Z\s]+?)(?:\.|,|$)/i, confidence: 0.9, source: 'explicit' },
  ],

  learning: [
    { pattern: /i (?:want to learn|'?m learning|am learning|'?ve been learning|am currently learning) ([^.]+?)(?:\.|,|$)/i, confidence: 0.8, source: 'explicit' },
    { pattern: /i (?:started|began) (?:learning|studying|practicing) ([^.]+?)(?:\.|,|$)/i, confidence: 0.7, source: 'explicit' },
    { pattern: /i'?m (?:taking|doing|working on) (?:a )?([^.]+?)\s*(?:course|class|tutorial|lesson)/i, confidence: 0.75, source: 'explicit' },
    { pattern: /i (?:just )?started ([^.]+?)(?:\.|,|$)/i, confidence: 0.4, source: 'inference' },
  ],

  skill: [
    { pattern: /i know ([^.]+?)(?:\.|,|$)/i, confidence: 0.7, source: 'explicit' },
    { pattern: /i'?m (?:good at|proficient in|experienced in|skilled at) ([^.]+?)(?:\.|,|$)/i, confidence: 0.8, source: 'explicit' },
    { pattern: /i (?:have|'?ve got) (?:experience with|knowledge of|a background in) ([^.]+?)(?:\.|,|$)/i, confidence: 0.7, source: 'explicit' },
  ],

  goal: [
    { pattern: /my goal is to ([^.]+?)(?:\.|,|$)/i, confidence: 0.9, source: 'explicit' },
    { pattern: /my dream is to ([^.]+?)(?:\.|,|$)/i, confidence: 0.85, source: 'explicit' },
    { pattern: /my ambition is to ([^.]+?)(?:\.|,|$)/i, confidence: 0.85, source: 'explicit' },
    { pattern: /my aspiration is to ([^.]+?)(?:\.|,|$)/i, confidence: 0.85, source: 'explicit' },
    { pattern: /i (?:want to|'?d like to|hope to|aim to|plan to|dream to) ([^.]+?)(?:\.|,|$)/i, confidence: 0.6, source: 'explicit' },
    { pattern: /my (?:main )?(?:goal|objective|aim|target|dream|ambition|aspiration) is ([^.]+?)(?:\.|,|$)/i, confidence: 0.85, source: 'explicit' },
  ],

  company: [
    { pattern: /i work (?:for|at) ([a-zA-Z\s]+?)(?:\.|,|$)/i, confidence: 0.8, source: 'explicit' },
    { pattern: /my (?:company|employer|workplace) is ([a-zA-Z\s]+?)(?:\.|,|$)/i, confidence: 0.9, source: 'explicit' },
  ],

  project: [
    { pattern: /i'?m (?:working on|building|creating|developing|making) ([^.]+?)(?:\.|,|$)/i, confidence: 0.7, source: 'explicit' },
    { pattern: /my (?:current )?project is ([^.]+?)(?:\.|,|$)/i, confidence: 0.85, source: 'explicit' },
  ],

  preference_positive: [
    { pattern: /i (?:like|love|prefer|enjoy|adore) ([^.]+?)(?:\.|,|$)/i, confidence: 0.6, source: 'inference' },
    { pattern: /my (?:favorite|favourite) ([^.]+?) is ([^.]+?)(?:\.|,|$)/i, confidence: 0.7, source: 'explicit' },
    { pattern: /i'?m (?:really|very) (?:into|fond of) ([^.]+?)(?:\.|,|$)/i, confidence: 0.6, source: 'inference' },
  ],

  preference_negative: [
    { pattern: /i (?:don't like|hate|dislike|avoid|can't stand) ([^.]+?)(?:\.|,|$)/i, confidence: 0.7, source: 'explicit' },
    { pattern: /i'?m not (?:a fan of|into|fond of) ([^.]+?)(?:\.|,|$)/i, confidence: 0.6, source: 'inference' },
  ],
};

class MemoryUpdater {
  /**
   * Extract facts from a user message + assistant response pair.
   * Uses only the user message for extraction (more accurate),
   * and the assistant response as supporting context.
   *
   * @param {string} userId
   * @param {string} userMessage - The user's message
   * @param {string} assistantResponse - The AI's response (used for context only)
   * @returns {number} Number of memories updated
   */
  async extractAndStore(userId, userMessage, assistantResponse) {
    const updates = [];

    // Extract from user message only (assistant response may hallucinate facts)
    const extractSource = userMessage || '';

    for (const [patternName, patterns] of Object.entries(EXTRACTION_PATTERNS)) {
      const patternsArray = Array.isArray(patterns) ? patterns : [patterns];

      for (const { pattern: regex, confidence, source } of patternsArray) {
        const match = extractSource.match(regex);
        if (!match) continue;

        // For preference_positive with two capture groups (e.g., "my favorite X is Y")
        let value;
        if (patternName === 'preference_positive' && match[2]) {
          // "my favorite language is Python" → value = "Python"
          value = match[2].trim();
        } else {
          value = match[1].trim();
        }

        if (!value || value.length > 100) continue;

        // Avoid: common filler words, too-short values
        if (this._isFiller(value)) continue;

        const contextSnippet = extractSource.length > 200
          ? extractSource.substring(0, 200) + '...'
          : extractSource;

        const update = this._createMemoryUpdate(patternName, userId, value, {
          confidence,
          source,
          context: contextSnippet,
          priority: Math.round(confidence * 10),
        });

        if (update) updates.push(update);

        // Only use the FIRST matching pattern per category (avoid duplicates)
        break;
      }
    }

    if (updates.length) {
      await Promise.all(updates);
    }

    return updates.length;
  }

  async extractPreference(userId, message, assistantResponse) {
    const extractSource = message || '';

    for (const [patternName, patterns] of Object.entries(EXTRACTION_PATTERNS)) {
      if (!patternName.startsWith('preference')) continue;
      const patternsArray = Array.isArray(patterns) ? patterns : [patterns];

      for (const { pattern: regex, confidence, source } of patternsArray) {
        const match = extractSource.match(regex);
        if (!match) continue;

        const value = match[2] ? match[2].trim() : match[1].trim();
        if (!value || this._isFiller(value)) continue;

        const isPositive = patternName === 'preference_positive';
        const prefType = isPositive ? 'like' : 'dislike';
        const contextSnippet = extractSource.length > 200
          ? extractSource.substring(0, 200) + '...'
          : extractSource;

        await this._updateMemory(
          userId,
          'preference',
          `pref:${prefType}:${value}`,
          { type: prefType, subject: value },
          {
            priority: Math.round(confidence * 10),
            confidence,
            source,
            context: contextSnippet,
            tags: ['preference', prefType, value.toLowerCase()],
          }
        );
        return true;
      }
    }

    return false;
  }

  async storeInsight(userId, insight, confidence = 0.5) {
    const timestamp = Date.now();
    return this._updateMemory(
      userId,
      'conversation_insight',
      `insight:${timestamp}`,
      { description: insight, timestamp: new Date() },
      { priority: 2, confidence, source: 'inference', tags: ['insight'] }
    );
  }

  async storeFact(userId, key, value, confidence = 0.8) {
    return this._updateMemory(
      userId,
      'fact',
      `fact:${key}`,
      typeof value === 'string' ? { description: value } : value,
      { priority: 3, confidence, source: 'explicit', tags: ['fact', key] }
    );
  }

  async storeDecision(userId, topic, outcome, confidence = 0.7) {
    return this._updateMemory(
      userId,
      'decision',
      `decision:${topic}`,
      { topic, outcome, timestamp: new Date() },
      { priority: 5, confidence, source: 'inference', tags: ['decision', topic] }
    );
  }

  async updateProject(userId, projectKey, updates) {
    const existing = await MemoryStorage.get(userId, `project:${projectKey}`);
    if (existing) {
      return MemoryStorage.update(userId, `project:${projectKey}`, {
        value: { ...existing.value, ...updates },
        confidence: Math.max(existing.confidence || 0.5, 0.7),
      });
    }
    return MemoryStorage.save(userId, 'project', `project:${projectKey}`, updates, {
      priority: 6,
      confidence: 0.7,
      source: 'inference',
      tags: ['project', projectKey],
    });
  }

  _createMemoryUpdate(patternName, userId, value, opts) {
    const { confidence, source, context: contextStr, priority } = opts;

    switch (patternName) {
      case 'name':
        if (this._isNotName(value)) return null;
        return this._updateMemory(
          userId, 'user_profile', 'user_name',
          { name: value },
          { priority, confidence, source, context: contextStr, tags: ['user_profile', 'name'] }
        );
      case 'role':
        return this._updateMemory(
          userId, 'user_profile', 'user_role',
          { role: value },
          { priority, confidence, source, context: contextStr, tags: ['user_profile', 'role'] }
        );
      case 'location':
        return this._updateMemory(
          userId, 'user_profile', 'user_location',
          { location: value },
          { priority, confidence, source, context: contextStr, tags: ['user_profile', 'location'] }
        );
      case 'company':
        return this._updateMemory(
          userId, 'user_profile', 'user_company',
          { company: value },
          { priority, confidence, source, context: contextStr, tags: ['user_profile', 'company'] }
        );
      case 'learning':
        return this._updateMemory(
          userId, 'learning_progress', `learning:${value}`,
          { name: value, status: 'in_progress', proficiency: 'learning' },
          { priority, confidence, source, context: contextStr, tags: ['learning_progress', value.toLowerCase()] }
        );
      case 'skill':
        return this._updateMemory(
          userId, 'skill', `skill:${value}`,
          { name: value, proficiency: 'known' },
          { priority, confidence, source, context: contextStr, tags: ['skill', value.toLowerCase()] }
        );
      case 'goal':
        return this._updateMemory(
          userId, 'goal', `goal:${value}`,
          { title: value, status: 'active', source: 'chat' },
          { priority, confidence, source, context: contextStr, tags: ['goal', value.toLowerCase()] }
        );
      case 'project':
        return this._updateMemory(
          userId, 'project', `project:${value}`,
          { name: value, status: 'active' },
          { priority, confidence, source, context: contextStr, tags: ['project', value.toLowerCase()] }
        );
      case 'preference_positive':
        return this._updateMemory(
          userId, 'preference', `pref:like:${value}`,
          { type: 'like', subject: value },
          { priority, confidence, source, context: contextStr, tags: ['preference', 'like', value.toLowerCase()] }
        );
      case 'preference_negative':
        return this._updateMemory(
          userId, 'preference', `pref:dislike:${value}`,
          { type: 'dislike', subject: value },
          { priority, confidence, source, context: contextStr, tags: ['preference', 'dislike', value.toLowerCase()] }
        );
      default:
        return null;
    }
  }

  async _updateMemory(userId, type, key, value, options = {}) {
    const { priority = 0, confidence = 0.5, source = 'inference', context: contextStr = '', tags = [] } = options;
    return MemoryStorage.save(userId, type, key, value, {
      priority,
      confidence,
      source,
      context: contextStr,
      tags,
    });
  }

  _isFiller(value) {
    const fillers = new Set([
      'it', 'that', 'this', 'things', 'stuff', 'something', 'everything',
      'nothing', 'anything', 'more', 'less', 'a lot', 'some', 'many',
      'them', 'those', 'these', 'here', 'there', 'now', 'then',
    ]);
    const lower = value.toLowerCase().trim();
    return fillers.has(lower) || lower.length < 2;
  }

  _isNotName(value) {
    const nonNames = new Set([
      'a', 'an', 'the', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'us', 'them',
      'new', 'old', 'big', 'small', 'good', 'bad', 'great', 'awesome',
      'just', 'also', 'very', 'really', 'quite', 'too', 'so',
      'not', 'no', 'yes', 'ok', 'okay', 'sure', 'fine',
      'here', 'there', 'now', 'then', 'always', 'never', 'sometimes',
      'back', 'off', 'over', 'out', 'up', 'down', 'in', 'on', 'at',
      'sorry', 'thanks', 'thank', 'please', 'hello', 'hi', 'hey',
      'having', 'getting', 'making', 'doing', 'going', 'coming',
      'working', 'building', 'trying', 'looking', 'playing', 'running',
      'learning', 'teaching', 'reading', 'writing', 'thinking', 'feeling',
    ]);
    const lower = value.toLowerCase().trim();
    return nonNames.has(lower) || this._isFiller(value);
  }
}

module.exports = new MemoryUpdater();
