const { getPrompt } = require('../prompts');

class Planner {
  analyze(userMessage, context) {
    const msg = userMessage.toLowerCase();

    const formatHints = {
      coding: this._matchesCoding(msg),
      'project-planning': this._matchesProjectPlanning(msg),
      learning: this._matchesLearning(msg),
      general: this._matchesGeneral(msg),
    };

    const formatType = Object.entries(formatHints).find(([, v]) => v)?.[0] || 'general';
    const complexity = this._assessComplexity(msg, userMessage);

    const subtasks = this._generateSubtasks(formatType, userMessage);

    return {
      objective: this._extractObjective(userMessage),
      complexity,
      formatType,
      subtasks,
      dependencies: [],
      estimatedSteps: subtasks.length,
    };
  }

  _matchesCoding(msg) {
    const patterns = [
      /code|function|bug|debug|error|implement|refactor|api|endpoint|route/,
      /javascript|python|react|node|express|mongodb|sql|html|css/,
      /syntax|compile|runtime|exception|stack.?trace/,
      /how (do|can|to) (i|we) (write|create|build|fix|implement)/,
    ];
    return patterns.some((p) => p.test(msg));
  }

  _matchesProjectPlanning(msg) {
    const patterns = [
      /project|app|application|system|platform|startup|build/,
      /architecture|design|plan|roadmap|timeline|milestone/,
      /tech.?stack|technology|infrastructure/,
    ];
    return patterns.some((p) => p.test(msg));
  }

  _matchesLearning(msg) {
    const patterns = [
      /explain|learn|teach|tutorial|guide|beginner|understand/,
      /what is|how does|define|meaning of/,
      /concept|fundamental|basics/,
    ];
    return patterns.some((p) => p.test(msg));
  }

  _matchesGeneral(msg) {
    return msg.length < 100 && !msg.includes('\n');
  }

  _assessComplexity(msg, original) {
    const length = original.length;
    const hasCode = /`|```|function|const |let |var |import/.test(original);
    const hasMultipleQuestions = (original.match(/\?/g) || []).length > 1;

    if (length > 500 || hasCode || hasMultipleQuestions) return 'complex';
    if (length > 150 || msg.includes('how') || msg.includes('why')) return 'moderate';
    return 'simple';
  }

  _extractObjective(userMessage) {
    const cleaned = userMessage.replace(/^(hey|hi|hello|thanks),\s*/i, '');
    if (cleaned.length > 120) return cleaned.substring(0, 117) + '...';
    return cleaned;
  }

  _generateSubtasks(formatType, userMessage) {
    switch (formatType) {
      case 'coding':
        return [
          'Identify the problem or requirement',
          'Analyze root cause or design approach',
          'Implement the solution',
          'Test and validate',
          'Document edge cases',
        ];
      case 'project-planning':
        return [
          'Define project objective',
          'Gather requirements',
          'Design architecture',
          'Create development roadmap',
          'Identify risks and mitigations',
        ];
      case 'learning':
        return [
          'Define the concept',
          'Explain with examples',
          'Show common mistakes',
          'Provide practice exercise',
        ];
      default:
        return ['Understand the query', 'Formulate response'];
    }
  }
}

module.exports = new Planner();
