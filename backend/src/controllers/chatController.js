const Chat = require('../models/Chat');
const Message = require('../models/Message');
const pipeline = require('../core/pipeline');
const AppError = require('../utils/AppError');
const { classify, isGoal } = require('../brain/conversationClassifier');
const goalManager = require('../brain/goalManager');
const contextBuilder = require('../brain/contextBuilder');
const MemoryManager = require('../memory/manager/memoryManager');
const MemoryRetriever = require('../memory/retrieval/memoryRetriever');
const { detectMemoryQuery } = require('../memory/detection/memoryQueryDetector');

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

    // ── Brain Layer: Classify mode → detect memory queries → gate memory → build context ──
    let enrichedContent = content;
    let conversationMode = 'general';
    let isMemQuery = false;
    try {
      // Step 1: Classify conversation mode (never injects goals/memory unprompted)
      const classification = classify(content);
      conversationMode = classification.mode;

      // Step 2: Detect if the message is asking about stored personal information
      // This runs regardless of mode — even "question" and "general" modes can
      // need memory if the user asks "What's my name?" or "Tell me about my goals"
      const memQuery = detectMemoryQuery(content);
      isMemQuery = memQuery.isMemoryQuery;

      // Step 3: Retrieve goals + memory when needed
      let goals = null;
      let memoryContext = null;

      if (classification.needsMemory || isMemQuery) {
        if (isMemQuery) {
          // Memory query: use relevance-ranked retrieval
          memoryContext = await MemoryRetriever.getContextForMessage(req.user._id, content);
          if (memoryContext && memoryContext.length > 0) {
            console.log(`[Brain] Memory query detected — retrieved ${memoryContext.length} relevant memories`);
          } else {
            console.log(`[Brain] Memory query detected — no matching memories found`);
          }
        } else {
          // Full pipeline modes: use legacy context retrieval
          goals = goalManager.getGoals('active');
          memoryContext = await MemoryManager.getContextForUser(req.user._id);
          console.log(`[Brain] Memory retrieved for mode: ${classification.mode}`);
        }
      } else {
        console.log(`[Brain] Mode: ${classification.mode} — no memory needed`);
      }

      // Step 4: Build and serialize context (skips goals/memory when null)
      const brainContext = contextBuilder.buildContext(goals, memoryContext, content, classification.mode, isMemQuery);
      enrichedContent = contextBuilder.serializeContext(brainContext);

      // Step 5: If the message IS a goal, save it regardless of mode
      if (classification.mode === 'goal' || isGoal(content)) {
        const title = goalManager.extractTitle(content);
        if (title) {
          const saved = goalManager.saveGoal(title, content, 'general', 'chat');
          if (saved) console.log(`[Brain] New goal saved: "${saved.title}"`);
        }
      }
    } catch (brainError) {
      // Non-fatal: brain enrichment failures fall back to the raw message
      console.error('[Brain] Enrichment failed (non-fatal):', brainError.message);
    }
    // ── End Brain Layer ──

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
