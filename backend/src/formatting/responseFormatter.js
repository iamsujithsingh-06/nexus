const ResponseModeDetector = require('./responseModeDetector');

class ResponseFormatter {
  format(response, mode) {
    if (!response || !response.trim()) return response;

    const modeName = (mode && mode.mode) || 'knowledge';

    switch (modeName) {
      case 'casual':
        return this._formatCasual(response);
      case 'quick':
        return this._formatQuick(response);
      case 'project':
        return this._formatProject(response);
      case 'knowledge':
      default:
        return this._formatKnowledge(response);
    }
  }

  _formatCasual(text) {
    let result = text.trim();

    result = result.replace(/^#{1,3}\s+\*\*.*?\*\*\s*\n*/gm, '');
    result = result.replace(/^\*\*.*?\*\*:?\s*/gm, '');

    result = result.replace(/\n{3,}/g, '\n\n');

    const lines = result.split('\n').filter((l) => l.trim());
    if (lines.length <= 4) return result;

    return lines.slice(0, 4).join('\n');
  }

  _formatQuick(text) {
    let result = text.trim();

    const hasStructuredSections = /^#{1,3}\s+\*\*.*?\*\*/m.test(result);
    if (!hasStructuredSections) return result;

    const lines = result.split('\n').filter((l) => l.trim());

    const introLines = [];
    let sectionStarted = false;

    for (const line of lines) {
      if (/^#{1,3}\s+\*\*.*?\*\*/.test(line.trim())) {
        sectionStarted = true;
        if (introLines.length === 0) continue;
        break;
      }
      introLines.push(line);
    }

    if (introLines.length > 0) {
      return introLines.join('\n');
    }

    const nonHeadingLines = lines.filter((l) => !/^#{1,3}\s/.test(l.trim()));
    if (nonHeadingLines.length > 0) {
      return nonHeadingLines.slice(0, 3).join('\n');
    }

    return result;
  }

  _formatProject(text) {
    return text.trim();
  }

  _formatKnowledge(text) {
    return text.trim();
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
