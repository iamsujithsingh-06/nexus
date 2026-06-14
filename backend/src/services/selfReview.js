class SelfReview {
  review(response, context) {
    if (!response) {
      return { passed: false, issues: ['Empty response'], improvements: [], score: 0 };
    }

    const checks = this._runChecks(response, context);
    const failed = checks.filter((c) => !c.passed);

    return {
      passed: failed.length === 0,
      score: Math.round(((checks.length - failed.length) / checks.length) * 100),
      issues: failed.map((c) => c.reason),
      improvements: failed.map((c) => c.improvement),
      details: checks,
    };
  }

  _runChecks(response, context) {
    const checks = [];

    checks.push(this._checkCompleteness(response));
    checks.push(this._checkStructure(response));
    checks.push(this._checkLength(response, context));
    checks.push(this._checkCodeBlocks(response));
    checks.push(this._checkRelevance(response));
    checks.push(this._checkActionability(response));

    return checks;
  }

  _checkCompleteness(response) {
    const trimmed = response.trim();
    const enoughContent = trimmed.length > 30;
    const hasConclusion = /[.!?]\s*$/.test(trimmed) || trimmed.endsWith('```');

    return {
      name: 'Completeness',
      passed: enoughContent && hasConclusion,
      reason: !enoughContent ? 'Response too short' : !hasConclusion ? 'Response lacks conclusion' : null,
      improvement: !enoughContent ? 'Expand the response' : 'Add a concluding statement',
    };
  }

  _checkStructure(response) {
    const hasStructure =
      /^#{1,3}\s/m.test(response) ||
      /^[-*]\s/m.test(response) ||
      /^\d+\.\s/m.test(response) ||
      response.includes('\n\n');

    return {
      name: 'Structure',
      passed: hasStructure,
      reason: hasStructure ? null : 'No headings, lists, or paragraph breaks found',
      improvement: 'Add headings or bullet points for readability',
    };
  }

  _checkLength(response, context) {
    const lines = response.split('\n').filter((l) => l.trim()).length;
    const avgLineLength = response.length / Math.max(lines, 1);

    const reasonableLines = lines >= 2 && lines <= 100;
    const reasonableLineLength = avgLineLength <= 200;

    return {
      name: 'Readability',
      passed: reasonableLines && reasonableLineLength,
      reason: !reasonableLines ? `Unusual line count (${lines})` : !reasonableLineLength ? 'Lines too long on average' : null,
      improvement: !reasonableLines ? 'Adjust response length' : 'Break long lines into shorter ones',
    };
  }

  _checkCodeBlocks(response) {
    const openBlocks = (response.match(/```/g) || []).length;

    return {
      name: 'Code Blocks',
      passed: openBlocks % 2 === 0,
      reason: openBlocks % 2 !== 0 ? 'Unmatched code block delimiters' : null,
      improvement: 'Close all code blocks with ```',
    };
  }

  _checkRelevance(response) {
    const disclaimers = [
      /as an AI/i,
      /as a language model/i,
      /I cannot provide/i,
      /I'm not able to/i,
    ];

    const hasDisclaimers = disclaimers.some((d) => d.test(response));

    return {
      name: 'Relevance',
      passed: !hasDisclaimers,
      reason: hasDisclaimers ? 'Contains AI disclaimers' : null,
      improvement: 'Remove AI disclaimers and directly answer the question',
    };
  }

  _checkActionability(response) {
    const actionWords = [
      /steps?:/i,
      /you can/i,
      /you should/i,
      /try using/i,
      /implement/i,
      /use the following/i,
      /here['']s how/i,
      /recommend/i,
      /suggestion/i,
    ];

    const hasActions = actionWords.some((a) => a.test(response));

    return {
      name: 'Actionability',
      passed: hasActions,
      reason: hasActions ? null : 'No actionable guidance found',
      improvement: 'Add concrete steps or recommendations',
    };
  }
}

module.exports = new SelfReview();
