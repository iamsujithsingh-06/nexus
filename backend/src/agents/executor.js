const geminiService = require('../services/geminiService');
const { getSystemPromptWithContext } = require('../prompts');

class Executor {
  async execute(plan, analysis, userMessage, history) {
    const formatType = plan.formatType;
    const combinedContext = this._buildCombinedContext(plan, analysis);

    const systemPrompt = getSystemPromptWithContext(combinedContext, formatType);

    const enhancedHistory = this._buildEnhancedHistory(history, plan, analysis);

    const response = await geminiService.generateAIResponse(userMessage, enhancedHistory, systemPrompt);

    return {
      content: response,
      formatType,
      plan,
      analysis,
    };
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

  _buildEnhancedHistory(history, plan, analysis) {
    return [
      ...(history || []),
      {
        role: 'system',
        content: `Plan: ${JSON.stringify(plan)}\nAnalysis: ${JSON.stringify(analysis)}`,
      },
    ];
  }
}

module.exports = new Executor();
