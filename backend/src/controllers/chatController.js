const Chat = require('../models/Chat');
const Message = require('../models/Message');
const pipeline = require('../core/pipeline');
const AppError = require('../utils/AppError');
const AIBrain = require('../services/ai/AIBrain');
const { classify, isGoal } = require('../brain/conversationClassifier');
const QueryNormalizer = require('../memory/retrieval/queryNormalizer');
const goalManager = require('../brain/goalManager');
const contextBuilder = require('../brain/contextBuilder');
const MemoryManager = require('../memory/manager/memoryManager');
const MemoryRetriever = require('../memory/retrieval/memoryRetriever');
const { detectMemoryQuery } = require('../memory/detection/memoryQueryDetector');

/**
 * Map AIBrain intents to pipeline conversation modes.
 */
const INTENT_TO_MODE = {
  greeting: 'greeting',
  goal_related: 'goal',
  task_related: 'general',
  learning: 'question',
  project: 'goal',
  career: 'question',
  personal: 'general',
  knowledge: 'question',
  analysis: 'deep_discussion',
  planning: 'question',
  motivational: 'general',
  general: 'general',
};

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
  const reqId = req._reqId || '?';
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

    const history = await Message.find({ chatId, _id: { $ne: userMessage._id } })
      .sort({ createdAt: -1 })
      .limit(19)
      .lean();
    history.reverse();

    // ── AI Brain: Classify → retrieve → build context ──
    let enrichedContent = content;
    let conversationMode = 'general';
    let isMemQuery = false;
    try {
      // Step 1: Process through AI Brain module
      const brainResult = await AIBrain.process(req.user._id, content, history);

      enrichedContent = brainResult.enrichedContent;
      conversationMode = INTENT_TO_MODE[brainResult.intent] || 'general';

      // Step 2: Detect memory query flag (for logging)
      isMemQuery = brainResult.classification.isMemoryQuery || false;

      // Step 3: If it's a goal declaration, save it
      if (brainResult.intent === 'goal_related' &&
          !QueryNormalizer.isGoalQuery(content)) {
        const title = goalManager.extractTitle(content);
        if (title) {
          const saved = goalManager.saveGoal(title, content, 'general', 'chat');
          if (saved) console.log(`[Brain] New goal saved: "${saved.title}"`);
        }
      }

      // Step 4: Log memory extraction result
      if (brainResult.memoryResult && brainResult.memoryResult.stored) {
        console.log(`[Brain] Memory stored: ${brainResult.memoryResult.type} (confidence: ${brainResult.classification.confidence.toFixed(2)})`);
      }

      console.log(`[Brain] Intent: ${brainResult.intent} → mode: ${conversationMode} | context: ${brainResult.enrichedContent.length} chars | ${brainResult.metadata.total}ms`);
    } catch (brainError) {
      // Fallback to legacy brain layer
      console.error('[Brain] AIBrain failed, falling back to legacy layer:', brainError.message);
      try {
        const classification = classify(content);
        conversationMode = classification.mode;
        const memQuery = detectMemoryQuery(content);
        isMemQuery = memQuery.isMemoryQuery;
        let goals = null;
        let memoryContext = null;
        if (classification.needsMemory || isMemQuery) {
          if (isMemQuery) {
            memoryContext = await MemoryRetriever.getContextForMessage(req.user._id, content);
          } else {
            goals = goalManager.getGoals('active');
            memoryContext = await MemoryManager.getContextForUser(req.user._id);
          }
        }
        const brainContext = contextBuilder.buildContext(goals, memoryContext, content, classification.mode, isMemQuery);
        enrichedContent = contextBuilder.serializeContext(brainContext);
        if (!QueryNormalizer.isGoalQuery(content) && (classification.mode === 'goal' || isGoal(content))) {
          const title = goalManager.extractTitle(content);
          if (title) goalManager.saveGoal(title, content, 'general', 'chat');
        }
      } catch (legacyError) {
        console.error('[Brain] Legacy brain layer also failed:', legacyError.message);
      }
    }
    // ── End AI Brain Layer ──

    const pipelineTimeout = setTimeout(() => {
      console.error(`[Chat] ⚠️ Pipeline is taking >30s for chat ${chatId}`);
    }, 30000);

    let pipelineResult;
    try {
      pipelineResult = await pipeline.processMessage(req.user._id, chat, enrichedContent, history, reqId, conversationMode);
    } finally {
      clearTimeout(pipelineTimeout);
    }

    const assistantMessage = await Message.create({ chatId, role: 'assistant', content: pipelineResult.content });

    chat.updatedAt = new Date();
    await chat.save();

    const mode = pipelineResult.responseMode || 'knowledge';

    console.log(`[Chat] ✓ Response received — ${pipelineResult.content.length} chars (mode: ${mode}, elapsed: ${pipelineResult.metadata.elapsed}ms)`);

    return res.status(200).json({
      success: true,
      userMessage,
      assistantMessage,
      pipeline: {
        formatType: pipelineResult.formatType,
        responseMode: mode,
        complexity: pipelineResult.metadata.complexity,
        elapsed: pipelineResult.metadata.elapsed,
        review: {
          score: pipelineResult.review.agentReview.score,
          passed: pipelineResult.review.agentReview.passed,
        },
      },
    });
  } catch (error) {
    const aiStatus = error.statusCode || error.aiStatus || null;
    const aiMessage = error.message || 'AI service is currently unavailable. Please try again later.';

    console.error(`[Chat] ✗ AI failed — [${aiStatus}] ${aiMessage}`);

    const httpStatus = aiStatus && aiStatus >= 400 && aiStatus < 500 ? aiStatus : 200;

    const errorPayload = {
      success: false,
      userMessage,
      error: aiMessage,
      ...(aiStatus ? { aiStatus } : {}),
    };

    if (error.attemptedModels) {
      errorPayload.attemptedModels = error.attemptedModels;
    }

    return res.status(httpStatus).json(errorPayload);
  }
};
