class ResponseFormatter {
  format(response, formatType) {
    if (!response || !response.trim()) return response;

    const cleaned = response.trim();

    if (!formatType || formatType === 'direct') return cleaned;

    switch (formatType) {
      case 'general':
        return this._ensureStructure(cleaned, ['Understanding', 'Analysis', 'Solution', 'Action Steps', 'Summary']);
      case 'coding':
        return this._ensureStructure(cleaned, ['Problem', 'Root Cause', 'Solution', 'Implementation Steps', 'Potential Issues', 'Next Steps']);
      case 'project-planning':
        return this._ensureStructure(cleaned, ['Objective', 'Requirements', 'Architecture', 'Roadmap', 'Risks', 'Next Actions']);
      case 'learning':
        return this._ensureStructure(cleaned, ['Concept', 'Explanation', 'Example', 'Common Mistakes', 'Challenge']);
      default:
        return cleaned;
    }
  }

  _ensureStructure(text, expectedSections) {
    const hasSections = expectedSections.some((s) => {
      const patterns = [
        new RegExp(`^###?\\s*\\*\\*?${s}\\*\\*?`, 'im'),
        new RegExp(`^\\*\\*${s}\\*\\*`, 'im'),
        new RegExp(`^##\\s+${s}`, 'im'),
        new RegExp(`^${s}:`, 'im'),
      ];
      return patterns.some((p) => p.test(text));
    });

    if (!hasSections) {
      const firstLine = text.split('\n')[0].trim();
      if (firstLine.length < 100 && !firstLine.startsWith('#')) {
        return `## ${expectedSections[0]}\n\n${text}`;
      }
    }

    return text;
  }

  extractCodeBlocks(text) {
    const blocks = [];
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }
    return blocks;
  }

  stripFormatting(text) {
    return text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
  }

  truncate(text, maxLength = 2000) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

module.exports = new ResponseFormatter();
