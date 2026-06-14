/**
 * Executor — Generates AI responses.
 *
 * Has two modes:
 *   execute()        — Full pipeline mode (with plan/analysis, for goal/project)
 *   executeDirect()  — Direct mode (no plan/analysis, for social/knowledge)
 */

const aiService = require('../services/aiService');
const { getSystemPromptWithContext } = require('../prompts');

class Executor {
  /**
   * Full pipeline execute — used by goal and project conversations.
   * Includes plan, analysis, and mode-specific formatting.
   */
  async execute(plan, analysis, userMessage, history, mode, reqId = '?') {
    const formatType = (mode && mode.mode) || plan.formatType || 'knowledge';
    const combinedContext = this._buildCombinedContext(plan, analysis);

    const systemPrompt = getSystemPromptWithContext(combinedContext, formatType);

    const enhancedHistory = this._buildEnhancedHistory(history, plan, analysis, mode);

    const response = await aiService.generateAIResponse(userMessage, enhancedHistory, systemPrompt, reqId);

    return {
      content: response,
      formatType,
      plan,
      analysis,
      responseMode: mode,
    };
  }

  /**
   * Direct execute — used by social and knowledge modes.
   * No plan, no analysis, no enhanced history. Just a system prompt + message.
   */
  async executeDirect(userMessage, history, systemPrompt, mode, reqId = '?') {
    const response = await aiService.generateAIResponse(userMessage, history, systemPrompt, reqId);

    return {
      content: response,
      formatType: mode,
      plan: null,
      analysis: null,
      responseMode: mode,
    };
  }

  /**
   * Returns a knowledge-mode system prompt for question/advice/technical/deep modes.
   */
  getKnowledgePrompt(mode) {
    const prompts = {
      question: `You are a knowledgeable conversation partner. Answer the question directly and conversationally. No bullet points unless the answer genuinely needs them. Don't reference user goals, projects, or personal information unless the question is specifically about them.`,
      advice: `Someone is asking for advice. Be thoughtful and practical. Speak like a friend giving honest counsel — not like a consultant delivering a plan. Short paragraphs. No section headings. Don't reference their stored goals or projects unless they ask about them.`,
      technical: `Answer the technical question directly. Be accurate but conversational. Code snippets are fine when needed. Don't reference user goals, projects, or personal ambitions.`,
      deep_discussion: `This is a thoughtful conversation. Engage with the idea. Be curious and reflective. No structure, no bullet points. Just think out loud with them. Don't reference their personal goals or projects.`,
      general: `Respond naturally. Be helpful and conversational. Don't reference the user's stored goals, projects, or personal profile unless the conversation is specifically about them.`,
    };
    return prompts[mode] || prompts.general;
  }

  _buildCombinedContext(plan, analysis) {
    const parts = [];

    if (analysis.requirements.length) {
      parts.push(`Requirements: ${analysis.requirements.join(', ')}`);
    }

    if (analysis.risks.length) {
      parts.push(`Risks: ${analysis.risks.join(', ')}`);
    }

    if (plan.complexity) {
      parts.push(`Complexity: ${plan.complexity}`);
    }

    return parts.length ? parts.join('\n') : null;
  }

  _buildEnhancedHistory(history, plan, analysis, mode) {
    const modeInfo = mode ? `ResponseMode: ${mode.mode}` : `FormatType: ${plan.formatType}`;
    return [
      ...(history || []),
      {
        role: 'system',
        content: `Plan: ${JSON.stringify(plan)}\nAnalysis: ${JSON.stringify(analysis)}\n${modeInfo}`,
      },
    ];
  }
}

module.exports = new Executor();
