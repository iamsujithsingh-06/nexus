class Analyzer {
  analyze(userMessage, plan, context) {
    const requirements = this._extractRequirements(userMessage);
    const risks = this._identifyRisks(userMessage, plan);
    const missingInfo = this._identifyMissingInfo(userMessage, plan);

    return {
      requirements,
      risks,
      missingInfo,
      constraints: this._identifyConstraints(userMessage),
      suggestedApproach: this._suggestApproach(plan.complexity),
    };
  }

  _extractRequirements(msg) {
    const requirements = [];

    if (/\b(code|function|implement|write|create|build)\b/i.test(msg)) {
      requirements.push('Working code implementation');
    }

    if (/\b(explain|define|what is|how does)\b/i.test(msg)) {
      requirements.push('Clear conceptual explanation');
    }

    if (/\b(debug|fix|error|bug|issue|problem)\b/i.test(msg)) {
      requirements.push('Root cause identification');
      requirements.push('Step-by-step debugging guidance');
    }

    if (/\b(architect|design|plan|structure)\b/i.test(msg)) {
      requirements.push('Architecture overview');
      requirements.push('Component breakdown');
    }

    if (!requirements.length) {
      requirements.push('Direct answer to the query');
    }

    return requirements;
  }

  _identifyRisks(msg, plan) {
    const risks = [];

    if (plan.complexity === 'complex') {
      risks.push('Response may exceed length limits');
      risks.push('Multiple sub-questions may need prioritization');
    }

    if (/\b(best|optimal|fastest|most efficient)\b/i.test(msg)) {
      risks.push('Multiple valid approaches exist — recommendation may vary by context');
    }

    if (msg.includes('?')) {
      const qCount = (msg.match(/\?/g) || []).length;
      if (qCount > 2) {
        risks.push(`Contains ${qCount} questions — may need to address each separately`);
      }
    }

    return risks;
  }

  _identifyMissingInfo(msg, plan) {
    const missing = [];

    if (/\b(code|script|app)\b/i.test(msg) && !/using|with|in/i.test(msg)) {
      missing.push('Programming language or technology stack');
    }

    if (/\b(debug|fix|issue)\b/i.test(msg) && !/error|message|log/i.test(msg)) {
      missing.push('Error message or stack trace');
    }

    if (/\b(compare|difference|vs|versus)\b/i.test(msg)) {
      missing.push('Specific criteria for comparison');
    }

    return missing;
  }

  _identifyConstraints(msg) {
    const constraints = [];

    if (/\b(simple|basic|beginner|easy)\b/i.test(msg)) {
      constraints.push('Prefer simple solutions');
    }

    if (/\b(quick|fast|short|brief)\b/i.test(msg)) {
      constraints.push('Prefer concise response');
    }

    if (/\b(production|deploy|scale|performance)\b/i.test(msg)) {
      constraints.push('Production-grade quality expected');
    }

    return constraints;
  }

  _suggestApproach(complexity) {
    switch (complexity) {
      case 'simple':
        return 'Direct answer with minimal context';
      case 'moderate':
        return 'Structured response with explanation';
      case 'complex':
        return 'Step-by-step breakdown with code and examples';
      default:
        return 'Direct answer';
    }
  }
}

module.exports = new Analyzer();
