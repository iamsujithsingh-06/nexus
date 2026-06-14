const Message = require('../../models/Message');
const Chat = require('../../models/Chat');
const MemoryStorage = require('../storage/memoryStorage');

/**
 * Conversation Summarizer — Summarizes chat sessions to capture cross-session context.
 *
 * Runs periodically: collects messages from recent chats, generates summaries,
 * and stores them as `conversation` type memories so the AI can reference
 * past conversations even across different chat sessions.
 */
class ConversationSummarizer {
  /**
   * Summarize recent chats for a user.
   * Called periodically (e.g., after a chat ends or on a schedule).
   *
   * @param {string} userId
   * @param {number} maxChats - Number of recent chats to summarize
   */
  async summarizeRecentChats(userId, maxChats = 5) {
    try {
      const chats = await Chat.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(maxChats)
        .lean();

      let summarized = 0;
      for (const chat of chats) {
        const alreadySummarized = await MemoryStorage.get(userId, `conversation:${chat._id}`);
        if (alreadySummarized) continue;

        const summary = await this._summarizeChat(userId, chat);
        if (summary) {
          summarized++;
        }
      }

      if (summarized > 0) {
        console.log(`[ConversationSummarizer] Summarized ${summarized} chats for user ${userId}`);
      }

      return summarized;
    } catch (error) {
      console.error('[ConversationSummarizer] Error:', error.message);
      return 0;
    }
  }

  /**
   * Summarize a single chat session.
   */
  async _summarizeChat(userId, chat) {
    try {
      const messages = await Message.find({ chatId: chat._id })
        .sort({ createdAt: 1 })
        .lean();

      if (messages.length < 2) return false;

      // Build a compact summary from the messages
      const summary = this._buildCompactSummary(messages);
      const topics = this._extractTopics(messages);
      const sentiment = this._detectSentiment(messages);

      const keyPoints = [];
      const userMessages = messages.filter((m) => m.role === 'user');
      for (const msg of userMessages.slice(-5)) {
        if (msg.content.length > 20 && msg.content.length < 200) {
          keyPoints.push(msg.content.substring(0, 150));
        }
      }

      await MemoryStorage.save(
        userId,
        'conversation',
        `conversation:${chat._id}`,
        {
          summary,
          date: chat.createdAt || new Date(),
          topics,
          sentiment,
          keyPoints: keyPoints.slice(0, 3),
          messageCount: messages.length,
          title: chat.title,
        },
        {
          priority: 3,
          confidence: 0.9,
          source: 'system',
          tags: ['conversation', ...topics.map((t) => t.toLowerCase())],
        }
      );

      return true;
    } catch (error) {
      console.error('[ConversationSummarizer] Chat summarization error:', error.message);
      return false;
    }
  }

  /**
   * Build a compact summary by extracting key exchanges.
   */
  _buildCompactSummary(messages) {
    // Take first exchange (context) and last few exchanges (recent)
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const recentMsgs = messages.slice(-6).filter((m) => m.role === 'user');

    const parts = [];

    if (firstUserMsg) {
      parts.push(`Started with: "${firstUserMsg.content.substring(0, 100)}"`);
    }

    if (recentMsgs.length > 1) {
      const topics = recentMsgs.map((m) => m.content.substring(0, 80));
      parts.push(`Recent topics: ${topics.join(' | ')}`);
    }

    return parts.join('\n').substring(0, 500);
  }

  _extractTopics(messages) {
    const topicKeywords = [
      'coding', 'python', 'javascript', 'react', 'node', 'ai', 'machine learning',
      'project', 'bug', 'error', 'learn', 'study', 'work', 'career', 'goal',
      'game', 'music', 'book', 'movie', 'travel', 'food', 'health', 'fitness',
    ];

    const content = messages.map((m) => m.content || '').join(' ').toLowerCase();
    const found = topicKeywords.filter((kw) => content.includes(kw));

    // Also extract hashtags or quoted topics
    const hashtags = content.match(/#(\w+)/g);
    if (hashtags) {
      found.push(...hashtags.map((h) => h.replace('#', '')));
    }

    return [...new Set(found)].slice(0, 5);
  }

  _detectSentiment(messages) {
    const positiveWords = ['great', 'awesome', 'love', 'happy', 'excited', 'thanks', 'cool', 'amazing', 'wonderful'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'stuck', 'tired', 'hate', 'bad', 'terrible', 'awful', 'annoying'];

    const userText = messages.filter((m) => m.role === 'user').map((m) => m.content || '').join(' ').toLowerCase();

    const positiveCount = positiveWords.filter((w) => userText.includes(w)).length;
    const negativeCount = negativeWords.filter((w) => userText.includes(w)).length;

    if (positiveCount > negativeCount + 1) return 'positive';
    if (negativeCount > positiveCount + 1) return 'negative';
    return 'neutral';
  }
}

module.exports = new ConversationSummarizer();
