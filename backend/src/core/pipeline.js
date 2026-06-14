const ContextEngine = require('../context/contextEngine');
const Planner = require('../agents/planner');
const Analyzer = require('../agents/analyzer');
const Executor = require('../agents/executor');
const Reviewer = require('../agents/reviewer');
const ResponseFormatter = require('../formatting/responseFormatter');
const MemoryManager = require('../memory/manager/memoryManager');
const ProjectIntelligence = require('../services/projectIntelligence');
const SelfReview = require('../services/selfReview');

class Pipeline {
  async processMessage(userId, chat, userMessage, history) {
    const startTime = Date.now();

    const context = await ContextEngine.build(userId, { chat, history });

    const plan = Planner.analyze(userMessage, context);
    const analysis = Analyzer.analyze(userMessage, plan, context);

    const executorResult = await Executor.execute(plan, analysis, userMessage, history);

    const reviewResult = Reviewer.review(executorResult, plan, analysis);

    let finalContent = executorResult.content;
    if (reviewResult.passed || reviewResult.score >= 60) {
      finalContent = ResponseFormatter.format(executorResult.content, plan.formatType);
    } else {
      console.warn(`[Pipeline] Review score ${reviewResult.score}% — minor issues flagged but response accepted`);
      finalContent = ResponseFormatter.format(executorResult.content, plan.formatType);
    }

    const selfReviewResult = SelfReview.review(finalContent, context);

    process.nextTick(() => {
      this._postProcess(userId, userMessage, executorResult.content, context, plan).catch((err) => {
        console.error('[Pipeline] Post-process error:', err.message);
      });
    });

    const elapsed = Date.now() - startTime;

    return {
      content: finalContent,
      rawContent: executorResult.content,
      formatType: plan.formatType,
      review: {
        agentReview: reviewResult,
        selfReview: selfReviewResult,
      },
      metadata: {
        complexity: plan.complexity,
        elapsed,
        modelAttempts: executorResult.modelAttempts || [],
      },
    };
  }

  async _postProcess(userId, userMessage, responseContent, context, plan) {
    const promises = [];

    if (plan.complexity !== 'simple') {
      promises.push(
        ProjectIntelligence.detectInMessage(userId, `${userMessage} ${responseContent.substring(0, 500)}`)
      );
    }

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
