const Chat = require('../models/Chat');
const Message = require('../models/Message');
const pipeline = require('../core/pipeline');
const AppError = require('../utils/AppError');

exports.createChat = async (req, res, next) => {
  try {
    const chat = await Chat.create({
      userId: req.user._id,
      title: 'New Chat',
    });

    res.status(201).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

exports.getUserChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt');

    res.status(200).json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

exports.getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return next(new AppError('Chat not found', 404));
    }

    const messages = await Message.find({ chatId: chat._id }).sort({
      createdAt: 1,
    });

    res.status(200).json({ success: true, chat, messages });
  } catch (error) {
    next(error);
  }
};

exports.deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return next(new AppError('Chat not found', 404));
    }

    await Message.deleteMany({ chatId: chat._id });

    res.status(200).json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  const { chatId, content } = req.body;
  let userMessage;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return next(new AppError('Chat not found', 404));
    }

    userMessage = await Message.create({ chatId, role: 'user', content });

    if (chat.title === 'New Chat') {
      chat.title = content.length > 50 ? content.substring(0, 50) + '...' : content;
      await chat.save();
    }

    const history = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(20);

    console.log(`[Chat] Processing via Nexus pipeline — chat: ${chatId}, history: ${history.length} msgs, content: "${content.substring(0, 50)}..."`);

    const pipelineResult = await pipeline.processMessage(req.user._id, chat, content, history);

    const assistantMessage = await Message.create({ chatId, role: 'assistant', content: pipelineResult.content });

    chat.updatedAt = new Date();
    await chat.save();

    console.log(`[Chat] ✓ Response received — ${pipelineResult.content.length} chars (format: ${pipelineResult.formatType}, elapsed: ${pipelineResult.metadata.elapsed}ms)`);

    return res.status(200).json({
      success: true,
      userMessage,
      assistantMessage,
      pipeline: {
        formatType: pipelineResult.formatType,
        complexity: pipelineResult.metadata.complexity,
        elapsed: pipelineResult.metadata.elapsed,
        review: {
          score: pipelineResult.review.agentReview.score,
          passed: pipelineResult.review.agentReview.passed,
        },
      },
    });
  } catch (error) {
    const googleStatus = error.googleStatus || error.statusCode || null;
    const googleMessage = error.message || 'AI service is currently unavailable. Please try again later.';

    console.error(`[Chat] ✗ Gemini failed — [${googleStatus}] ${googleMessage}`);
    if (error.googleQuotaViolations) {
      console.error(`[Chat] Quota violations: ${JSON.stringify(error.googleQuotaViolations)}`);
    }

    const httpStatus = googleStatus && googleStatus >= 400 && googleStatus < 500 ? googleStatus : 200;

    const errorPayload = {
      success: false,
      userMessage,
      error: googleMessage,
      ...(googleStatus ? { googleStatus } : {}),
    };

    if (error.googleQuotaViolations) {
      errorPayload.googleQuotaViolations = error.googleQuotaViolations;
    }
    if (error.googleRetryDelay) {
      errorPayload.googleRetryDelay = error.googleRetryDelay;
    }
    if (error.googleStatusText) {
      errorPayload.googleStatusText = error.googleStatusText;
    }
    if (error.googleFullMessage) {
      errorPayload.googleFullMessage = error.googleFullMessage;
    }
    if (error.attemptedModels) {
      errorPayload.attemptedModels = error.attemptedModels;
    }

    return res.status(httpStatus).json(errorPayload);
  }
};
