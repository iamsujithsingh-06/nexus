class Reviewer {
  review(response, plan, analysis) {
    if (!response || !response.content) {
      return {
        passed: false,
        issues: ['No response content generated'],
        score: 0,
        suggestions: ['Regenerate the response'],
      };
    }

    const content = response.content;
    const checks = this._runChecks(content, plan);
    const failedChecks = checks.filter((c) => !c.passed);
    const score = Math.round(((checks.length - failedChecks.length) / checks.length) * 100);

    return {
      passed: failedChecks.length === 0,
      score,
      issues: failedChecks.map((c) => c.reason),
      details: checks,
      suggestions: this._generateSuggestions(failedChecks),
    };
  }

  _runChecks(content, plan) {
    const checks = [];

    checks.push({
      name: 'Completeness',
      passed: content.trim().length > 20,
      reason: content.trim().length <= 20 ? 'Response is too short' : null,
    });

    checks.push({
      name: 'Structure',
      passed: /^###?\s|^[-*] |^\d+\. /.test(content) || content.includes('\n\n'),
      reason: !/^###?\s|^[-*] |^\d+\. /.test(content) && !content.includes('\n\n') ? 'Response lacks clear structure' : null,
    });

    const codeBlocks = content.match(/```/g);
    checks.push({
      name: 'Code Block Balance',
      passed: !codeBlocks || codeBlocks.length % 2 === 0,
      reason: codeBlocks && codeBlocks.length % 2 !== 0 ? 'Unmatched code block markers' : null,
    });

    if (plan?.formatType === 'coding') {
      checks.push({
        name: 'Code Included',
        passed: /```/.test(content),
        reason: 'Coding response should include code examples',
      });
    }

    if (plan?.formatType === 'learning') {
      checks.push({
        name: 'Example Included',
        passed: /example|for instance|such as|e\.g\./i.test(content),
        reason: 'Learning response should include examples',
      });
    }

    checks.push({
      name: 'Actionability',
      passed: /^(###|##|[-*]|\d+\.)/m.test(content) || /(?:steps|steps? to|how to|you can|you should|try|use|implement)/i.test(content),
      reason: !/^(###|##|[-*]|\d+\.)/m.test(content) ? 'Response could be more actionable' : null,
    });

    checks.push({
      name: 'Relevance',
      passed: !/(?:as an AI|as a language model|I cannot|I'm not able)/i.test(content),
      reason: /(?:as an AI|as a language model)/i.test(content) ? 'Contains unnecessary AI disclaimers' : null,
    });

    return checks;
  }

  _generateSuggestions(failedChecks) {
    if (!failedChecks.length) return [];

    return failedChecks.map((c) => {
      switch (c.name) {
        case 'Completeness':
          return 'Elaborate on the response with more detail';
        case 'Structure':
          return 'Use markdown headings, bullet points, or numbered lists';
        case 'Code Block Balance':
          return 'Ensure all code blocks are properly opened and closed with ```';
        case 'Code Included':
          return 'Add relevant code examples in markdown code blocks';
        case 'Example Included':
          return 'Include practical examples to illustrate the concept';
        case 'Actionability':
          return 'Add concrete steps the user can take';
        case 'Relevance':
          return 'Remove AI disclaimers and focus on the answer';
        default:
          return `Address "${c.name}" issue`;
      }
    });
  }
}

module.exports = new Reviewer();
