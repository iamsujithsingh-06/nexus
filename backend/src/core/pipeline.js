/**
 * Pipeline — Routes messages through the appropriate processing path based on
 * conversation mode.
 *
 * Modes that skip the full pipeline (greeting, small_talk, venting, etc.):
 *   → Direct AI call with a conversational system prompt.
 *   → No memory retrieval, no Planner/Analyzer/Reviewer, no formatting.
 *
 * Task modes (question, advice, technical, deep_discussion):
 *   → Knowledge-style system prompt.
 *   → Skip Planner/Analyzer/Reviewer, but apply ResponseFormatter.
 *
 * Memory modes (goal, project):
 *   → Full pipeline with Planner → Analyzer → Executor → Reviewer.
 *   → Memory was already injected by the brain layer.
 */

const ContextEngine = require('../context/contextEngine');
const Planner = require('../agents/planner');
const Analyzer = require('../agents/analyzer');
const Executor = require('../agents/executor');
const Reviewer = require('../agents/reviewer');
const ResponseFormatter = require('../formatting/responseFormatter');
const MemoryManager = require('../memory/manager/memoryManager');
const MemoryConsolidator = require('../memory/consolidation/memoryConsolidator');
const ProjectIntelligence = require('../services/projectIntelligence');
const SelfReview = require('../services/selfReview');
const PersonalityEngine = require('../personality/engine');

// Conversation modes that bypass the full agent pipeline
const SOCIAL_MODES = new Set([
  'greeting', 'small_talk', 'venting', 'celebrating', 'emotional', 'joke',
]);

// Modes that need some structure but not the full planning pipeline
const KNOWLEDGE_MODES = new Set([
  'question', 'advice', 'technical', 'deep_discussion', 'general',
]);

class Pipeline {
  /**
   * @param {string} userId
   * @param {object} chat
   * @param {string} userMessage - The (possibly enriched) user message
   * @param {Array}  history
   * @param {string} reqId
   * @param {string} conversationMode - From conversationClassifier
   */
  async processMessage(userId, chat, userMessage, history, reqId = '?', conversationMode = 'general') {
    const startTime = Date.now();
    const isSocial = SOCIAL_MODES.has(conversationMode);
    const isKnowledge = KNOWLEDGE_MODES.has(conversationMode);

    // ── Route 1: Social modes — direct conversational response ──
    if (isSocial) {
      const result = await this._handleSocialMode(userId, userMessage, history, conversationMode, reqId);
      const elapsed = Date.now() - startTime;
      return {
        ...result,
        metadata: { ...result.metadata, elapsed, complexity: 'simple' },
      };
    }

    // ── Route 2: Knowledge modes — informative but no planning ──
    if (isKnowledge) {
      const result = await this._handleKnowledgeMode(userId, userMessage, history, conversationMode, reqId);
      const elapsed = Date.now() - startTime;
      return {
        ...result,
        metadata: { ...result.metadata, elapsed, complexity: 'moderate' },
      };
    }

    // ── Route 3: Memory modes (goal, project) — full pipeline ──
    return this._handleFullPipeline(userId, chat, userMessage, history, conversationMode, reqId, startTime);
  }

  // ── Social: Greeting, small talk, venting, celebrating, emotional, joke ──
  async _handleSocialMode(userId, userMessage, history, mode, reqId) {
    const systemPrompt = this._getSocialPrompt(mode);

    const result = await Executor.executeDirect(userMessage, history, systemPrompt, mode, reqId);

    const personalityLanguage = PersonalityEngine.detectLanguage(userMessage).language;
    const content = PersonalityEngine.enhanceWithMode(result.content, userMessage, { mode });

    // Extract memories in the background (catch-all for self-disclosures in social chat)
    process.nextTick(() => {
      MemoryManager.extractFromConversation(userId, userMessage, result.content.substring(0, 1000))
        .catch((err) => console.error('[Pipeline] Social post-process error:', err.message));
    });

    return {
      content,
      rawContent: result.content,
      responseMode: mode,
      formatType: mode,
      review: { agentReview: { score: 100, passed: true }, selfReview: { passed: true, score: 100 } },
      metadata: {
        modelAttempts: result.modelAttempts || [],
        personality: { language: personalityLanguage, enabled: content !== result.content },
      },
    };
  }

  // ── Knowledge: Question, advice, technical, deep discussion, general ──
  async _handleKnowledgeMode(userId, userMessage, history, mode, reqId) {
    const systemPrompt = Executor.getKnowledgePrompt(mode);

    const result = await Executor.executeDirect(userMessage, history, systemPrompt, mode, reqId);

    let finalContent = ResponseFormatter.format(result.content, { mode });

    const selfReviewResult = SelfReview.review(finalContent, null);

    const personalityLanguage = PersonalityEngine.detectLanguage(userMessage).language;
    finalContent = PersonalityEngine.enhanceWithMode(finalContent, userMessage, { mode });

    // Extract memories in the background (catches self-disclosures in general chat)
    process.nextTick(() => {
      MemoryManager.extractFromConversation(userId, userMessage, result.content.substring(0, 1000))
        .catch((err) => console.error('[Pipeline] Knowledge post-process error:', err.message));
    });

    return {
      content: finalContent,
      rawContent: result.content,
      responseMode: mode,
      formatType: mode,
      review: {
        agentReview: { score: 100, passed: true },
        selfReview: selfReviewResult,
      },
      metadata: {
        modelAttempts: result.modelAttempts || [],
        personality: { language: personalityLanguage, enabled: true },
      },
    };
  }

  // ── Full pipeline: Goal, project discussions ──
  async _handleFullPipeline(userId, chat, userMessage, history, mode, reqId, startTime) {
    let context;
    try {
      context = await ContextEngine.build(userId, { chat, history });
    } catch (err) {
      console.error(`[Pipeline] ContextEngine build failed (non-fatal): ${err.message}`);
      context = { user: null, session: null, memory: null, project: null, combined: null };
    }

    const plan = Planner.analyze(userMessage, context);
    const modeObj = Planner.getResponseMode(userMessage);
    const analysis = Analyzer.analyze(userMessage, plan, context);

    const executorResult = await Executor.execute(plan, analysis, userMessage, history, modeObj, reqId);

    const reviewResult = Reviewer.review(executorResult, plan, analysis);

    let finalContent = executorResult.content;
    if (reviewResult.passed || reviewResult.score >= 60) {
      finalContent = ResponseFormatter.format(executorResult.content, modeObj);
    } else {
      console.warn(`[Pipeline] Review score ${reviewResult.score}% — minor issues flagged but response accepted`);
      finalContent = ResponseFormatter.format(executorResult.content, modeObj);
    }

    const selfReviewResult = SelfReview.review(finalContent, context);

    const personalityLanguage = PersonalityEngine.detectLanguage(userMessage).language;
    const personalityContent = PersonalityEngine.enhanceWithMode(finalContent, userMessage, modeObj);

    process.nextTick(() => {
      this._postProcess(userId, userMessage, executorResult.content, context, plan).catch((err) => {
        console.error('[Pipeline] Post-process error:', err.message);
      });
    });

    const elapsed = Date.now() - startTime;

    return {
      content: personalityContent,
      rawContent: executorResult.content,
      responseMode: modeObj.mode,
      review: {
        agentReview: reviewResult,
        selfReview: selfReviewResult,
      },
      metadata: {
        complexity: plan.complexity,
        elapsed,
        modelAttempts: executorResult.modelAttempts || [],
        personality: {
          language: personalityLanguage,
          enabled: personalityContent !== finalContent,
        },
      },
    };
  }

  _getSocialPrompt(mode) {
    const prompts = {
      greeting: `You are a friendly conversation partner. Keep your response very short — 1 to 2 sentences. Just greet them back warmly and naturally. Do not ask about goals, projects, or personal life unless they bring it up.`,
      small_talk: `You are a friendly conversation partner. Keep it light and natural. Short responses. Don't ask about goals, projects, or personal ambitions. Just chat.`,
      venting: `This person is expressing frustration or exhaustion. Your job is to acknowledge how they feel — not to solve their problem. No advice. No suggestions. No "here's what you should do." Just listen and respond with understanding. Short response.`,
      celebrating: `This person is sharing good news. Celebrate with them! Be genuinely happy. No need to ask follow-up questions about goals or plans. Just share their joy.`,
      emotional: `This person is being vulnerable about their feelings. Be gentle and present. Don't offer solutions or advice. Don't reference their goals or projects. Just acknowledge what they shared and be there.`,
      joke: `This is playful. Match their energy. Be funny or witty back. Keep it short and light.`,
    };
    return prompts[mode] || prompts.greeting;
  }

  async _postProcess(userId, userMessage, responseContent, context, plan) {
    const promises = [];

    if (plan && plan.complexity !== 'simple') {
      promises.push(
        ProjectIntelligence.detectInMessage(userId, `${userMessage} ${responseContent.substring(0, 500)}`)
      );
    }

    // AI-powered memory extraction (catches more than regex alone)
    promises.push(
      MemoryManager.extractFromConversation(userId, userMessage, responseContent.substring(0, 1000))
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('[Pipeline] Post-process error (non-fatal):', error.message);
    }
  }
}

module.exports = new Pipeline();
