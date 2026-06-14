const aiService = require('../../services/aiService');
const MemoryStorage = require('../storage/memoryStorage');
const MemoryUpdater = require('../updater/memoryUpdater');
const { buildExtractionPrompt } = require('./extractionPrompt');
const { containsRememberable } = require('../detection/memoryQueryDetector');

/**
 * Memory Extractor — Extracts memories from conversations using both
 * regex-based extraction (fast, reliable for simple patterns) and
 * AI-powered extraction (deep, catches complex statements).
 *
 * Two-pass approach:
 *   Pass 1 (regex): Quick pattern matching for common statements
 *   Pass 2 (AI):    LLM-based extraction for everything the regex missed
 */
class MemoryExtractor {
  /**
   * Extract memories from a conversation turn.
   *
   * @param {string} userId
   * @param {string} userMessage
   * @param {string} assistantResponse
   * @param {object} options
   * @param {boolean} options.useAI - Whether to run AI extraction (default: true for non-trivial messages)
   * @param {Array} options.existingMemories - Recent memories for dedup context
   * @returns {number} Number of memories extracted
   */
  async extract(userId, userMessage, assistantResponse, options = {}) {
    const { useAI = this._shouldUseAI(userMessage) } = options;

    // Pass 1: Regex extraction (fast, synchronous patterns)
    const regexCount = await this._regexExtract(userId, userMessage, assistantResponse);

    // Pass 2: AI extraction (deep understanding)
    let aiCount = 0;
    if (useAI) {
      aiCount = await this._aiExtract(userId, userMessage, assistantResponse);
    }

    const total = regexCount + aiCount;
    if (total > 0) {
      console.log(`[MemoryExtractor] Extracted ${total} memories (regex: ${regexCount}, ai: ${aiCount})`);
    }

    return total;
  }

  /**
   * Run regex-based extraction (delegates to existing MemoryUpdater).
   */
  async _regexExtract(userId, userMessage, assistantResponse) {
    try {
      const count1 = await MemoryUpdater.extractAndStore(userId, userMessage, assistantResponse);
      const count2 = await MemoryUpdater.extractPreference(userId, userMessage, assistantResponse);
      return count1 + count2;
    } catch (error) {
      console.error('[MemoryExtractor] Regex extraction error:', error.message);
      return 0;
    }
  }

  /**
   * Run AI-powered extraction using the LLM.
   */
  async _aiExtract(userId, userMessage, assistantResponse) {
    try {
      // Get recent memories for context (helps AI avoid duplicates)
      const recentMemories = await MemoryStorage.list(userId, {})
        .catch(() => []);

      const messages = buildExtractionPrompt(userMessage, assistantResponse, recentMemories);

      const response = await aiService.generateAIResponse(
        messages[messages.length - 1].content,
        messages.slice(0, -1),
        null,
        'mem-extract'
      );

      return this._processAIResponse(userId, response, userMessage);
    } catch (error) {
      console.error('[MemoryExtractor] AI extraction error:', error.message);
      return 0;
    }
  }

  /**
   * Parse and store AI extraction results.
   */
  async _processAIResponse(userId, response, originalMessage) {
    try {
      let data;
      try {
        data = JSON.parse(response);
      } catch {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[1]);
        } else {
          return 0;
        }
      }

      if (!data || !Array.isArray(data.memories)) return 0;

      let stored = 0;
      for (const mem of data.memories) {
        if (!mem.type || !mem.value) continue;
        if (!mem.confidence || mem.confidence < 0.4) continue;

        const key = this._generateKey(mem.type, mem.value);
        const priority = Math.round((mem.confidence || 0.5) * 10);

        // Check if this memory already exists before storing
        const existing = await MemoryStorage.get(userId, key).catch(() => null);
        if (existing && existing.confidence >= (mem.confidence || 0.5)) continue;

        const contextSnippet = originalMessage.length > 200
          ? originalMessage.substring(0, 200) + '...'
          : originalMessage;

        await MemoryStorage.save(userId, mem.type, key, mem.value, {
          priority,
          confidence: mem.confidence || 0.5,
          source: mem.source === 'explicit' ? 'explicit' : 'ai_extracted',
          context: contextSnippet,
          tags: [mem.type, ...this._extractTags(mem.type, mem.value)],
        });

        stored++;
      }

      return stored;
    } catch (error) {
      console.error('[MemoryExtractor] Process AI response error:', error.message);
      return 0;
    }
  }

  _generateKey(type, value) {
    switch (type) {
      case 'profile':
        if (value.name) return 'user_name';
        if (value.role) return 'user_role';
        if (value.company) return 'user_company';
        if (value.location) return 'user_location';
        return `profile:${Date.now()}`;
      case 'goal':
        return `goal:${(value.title || value.description || '').substring(0, 60)}`;
      case 'preference':
        return `pref:${value.type || 'like'}:${(value.subject || '').substring(0, 40)}`;
      case 'project':
        return `project:${(value.name || '').substring(0, 60)}`;
      case 'interest':
        return `interest:${(value.topic || '').substring(0, 60)}`;
      case 'insight':
        return `insight:${Date.now()}`;
      case 'fact':
        return `fact:${(value.description || '').substring(0, 60)}`;
      default:
        return `${type}:${Date.now()}`;
    }
  }

  _extractTags(type, value) {
    const tags = [type];
    if (value && typeof value === 'object') {
      for (const v of Object.values(value)) {
        if (typeof v === 'string' && v.length > 2 && v.length < 30) {
          tags.push(v.toLowerCase());
        }
      }
    }
    return tags;
  }

  _shouldUseAI(message) {
    if (!message || message.length < 5) return false;
    if (containsRememberable(message)) return true;
    // AI extraction is expensive; only use when message has substance
    const wordCount = message.split(/\s+/).length;
    return wordCount >= 8;
  }
}

module.exports = new MemoryExtractor();
