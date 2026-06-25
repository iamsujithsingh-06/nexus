/**
 * ConversationRetriever — fetches recent conversation history.
 *
 * Returns the last 5 messages from the most recent chat session.
 * Uses CacheManager with 30-second TTL.
 */

const Message = require('../../models/Message');

const MAX_MESSAGES = 5;

async function retrieve(userId) {
  const start = Date.now();

  try {
    const Chat = require('../../models/Chat');
    const latestChat = await Chat.findOne({ userId })
      .sort({ updatedAt: -1 })
      .select('_id')
      .lean();

    if (!latestChat) {
      return { conversations: [], count: 0, elapsed: Date.now() - start };
    }

    const messages = await Message.find({ chatId: latestChat._id })
      .sort({ createdAt: -1 })
      .limit(MAX_MESSAGES)
      .lean();

    const conversations = messages
      .reverse()
      .map(m => ({ role: m.role, content: m.content }));

    return { conversations, count: conversations.length, elapsed: Date.now() - start };
  } catch (err) {
    return { conversations: [], count: 0, elapsed: Date.now() - start, error: err.message };
  }
}

module.exports = { retrieve };
