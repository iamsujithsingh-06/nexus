const SECTION_EMOJI_MAP = [
  { patterns: [/project|app|build|architecture|system|platform|startup/i], emoji: '🚀', category: 'project' },
  { patterns: [/achieve|complete|done|success|pass|finish|launch|deploy|ship/i], emoji: '🔥', category: 'achievement' },
  { patterns: [/learn|study|concept|understand|explain|tutorial|beginner|practice/i], emoji: '🧠', category: 'learning' },
  { patterns: [/quick|fast|tip|hack|shortcut|simple|easy|instant/i], emoji: '⚡', category: 'quick' },
  { patterns: [/finish|done|complete|todo|check|verify|✅|task/i], emoji: '✅', category: 'completed' },
  { patterns: [/importan|critical|key|main point|highlights|note|remember|essential/i], emoji: '📌', category: 'important' },
  { patterns: [/warn|risk|caution|careful|danger|issue|problem|pitfall|mistake/i], emoji: '⚠️', category: 'warning' },
  { patterns: [/goal|target|aim|objective|milestone|plan|roadmap|vision/i], emoji: '🎯', category: 'goal' },
  { patterns: [/idea|think|suggest|recommend|propose|creativ|innovative/i], emoji: '💡', category: 'idea' },
  { patterns: [/milestone|win|victory|best|top|award|record|breakthrough|first/i], emoji: '🏆', category: 'milestone' },
  { patterns: [/step|stage|phase|next|follow|process|method|approach|strategy/i], emoji: '📋', category: 'step' },
  { patterns: [/code|implement|function|debug|fix|refactor|test|deploy$/i], emoji: '🛠️', category: 'technical' },
  { patterns: [/error|bug|crash|fail|exception|stack.?trace|broken|wrong/i], emoji: '🐛', category: 'bug' },
  { patterns: [/data|database|analytics|insight|stat|metric|report|dashboard/i], emoji: '📊', category: 'data' },
  { patterns: [/design|ui|ux|frontend|interface|layout|style|theme|component/i], emoji: '🎨', category: 'design' },
  { patterns: [/api|endpoint|route|server|client|request|response|middleware/i], emoji: '🔌', category: 'api' },
  { patterns: [/speed|perform|optimize|fast|slow|memory|cache|lazy|load/i], emoji: '⚡', category: 'performance' },
  { patterns: [/secure|auth|login|token|password|jwt|encrypt|hash|permission/i], emoji: '🔒', category: 'security' },
  { patterns: [/money|price|cost|budget|revenue|profit|pricing|free|paid/i], emoji: '💰', category: 'business' },
  { patterns: [/team|user|customer|client|people|collaborate|together|group/i], emoji: '👥', category: 'people' },
];

const EMOJI_CATEGORY_PRIORITY = {
  achievement: 1,
  project: 2,
  goal: 3,
  idea: 4,
  milestone: 5,
  warning: 6,
  learning: 7,
  bug: 8,
  technical: 9,
  quick: 10,
  api: 11,
  security: 12,
  performance: 13,
  design: 14,
  data: 15,
  important: 16,
  step: 17,
  completed: 18,
  people: 19,
  business: 20,
};

const LINE_ENDINGS = new Set(['.', '!', '?', ':', '...']);

const LINE_BREAK_REGEX = /\n\s*\n/;
const HEADING_REGEX = /^(###?\s|##?\s|\*\*)/m;

class EmojiManager {
  addEmojis(text) {
    if (!text || text.length < 15) return text;
    if (this._isCodeOnly(text)) return text;

    const sections = this._splitSections(text);

    if (sections.length <= 1) {
      const emoji = this._pickEmojiForText(text, 'general');
      return emoji ? this._prependEmoji(text, emoji) : text;
    }

    return this._addEmojisToSections(text, sections);
  }

  _isCodeOnly(text) {
    const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
    const codeLen = codeBlocks.reduce((s, b) => s + b.length, 0);
    return text.length > 50 && codeLen / text.length > 0.6;
  }

  _splitSections(text) {
    const blocks = text.split(LINE_BREAK_REGEX).filter(Boolean);
    if (blocks.length <= 1) {
      const headings = text.match(/^#{1,3}\s.+/gm);
      if (headings && headings.length > 1) {
        return text.split(/^(?=#{1,3}\s)/m).filter(Boolean);
      }
    }
    return blocks;
  }

  _assignSections(text) {
    const blocks = text.split(LINE_BREAK_REGEX).filter(Boolean);
    const headings = text.match(/^#{1,3}\s.+/gm);
    const sections = [];

    if (headings && headings.length > 1) {
      const parts = text.split(/^(?=#{1,3}\s)/m).filter(Boolean);
      for (const part of parts) {
        sections.push({
          text: part.trim(),
          emoji: this._pickEmojiForText(part, this._detectSectionCategory(part)),
        });
      }
    } else if (blocks.length > 1) {
      for (const block of blocks) {
        sections.push({
          text: block.trim(),
          emoji: this._pickEmojiForText(block, this._detectSectionCategory(block)),
        });
      }
    } else {
      sections.push({
        text: text.trim(),
        emoji: this._pickEmojiForText(text, 'general'),
      });
    }

    return sections;
  }

  _addEmojisToSections(text, sections) {
    const assigned = this._assignSections(text);
    const emojiCount = assigned.filter((s) => s.emoji).length;

    if (emojiCount > 8) {
      const sorted = assigned
        .filter((s) => s.emoji)
        .sort((a, b) => {
          const pa = EMOJI_CATEGORY_PRIORITY[a.category || 'general'] || 50;
          const pb = EMOJI_CATEGORY_PRIORITY[b.category || 'general'] || 50;
          return pa - pb;
        });
      const keep = sorted.slice(0, 8).map((s) => s.emoji);
      for (const section of assigned) {
        if (section.emoji && !keep.includes(section.emoji)) {
          section.emoji = null;
        }
      }
    }

    return assigned
      .map((section) => {
        if (!section.emoji) return section.text;
        return this._prependEmoji(section.text, section.emoji);
      })
      .join('\n\n');
  }

  _prependEmoji(text, emoji) {
    const trimmed = text.trim();
    const firstChar = trimmed[0];

    if (firstChar === '#') {
      const match = trimmed.match(/^(#{1,3}\s)(.*)$/m);
      if (match) {
        return trimmed.replace(match[0], `${match[1]}${emoji} ${match[2].trim()}`);
      }
    }

    if (trimmed.startsWith('**')) {
      return `${emoji} ${trimmed}`;
    }

    if (!trimmed.startsWith(emoji)) {
      return `${emoji} ${trimmed}`;
    }

    return trimmed;
  }

  _detectSectionCategory(text) {
    for (const entry of SECTION_EMOJI_MAP) {
      if (entry.patterns.some((p) => p.test(text))) {
        return entry.category;
      }
    }
    return 'general';
  }

  _pickEmojiForText(text, fallbackCategory) {
    if (!text) return null;

    const categories = new Set();
    for (const entry of SECTION_EMOJI_MAP) {
      if (entry.patterns.some((p) => p.test(text))) {
        categories.add(entry.category);
      }
    }

    if (categories.size === 0) {
      if (fallbackCategory !== 'general') {
        const entry = SECTION_EMOJI_MAP.find((e) => e.category === fallbackCategory);
        return entry ? entry.emoji : null;
      }
      return null;
    }

    const sorted = [...categories].sort((a, b) => {
      const pa = EMOJI_CATEGORY_PRIORITY[a] || 50;
      const pb = EMOJI_CATEGORY_PRIORITY[b] || 50;
      return pa - pb;
    });

    const entry = SECTION_EMOJI_MAP.find((e) => e.category === sorted[0]);
    return entry ? entry.emoji : null;
  }

  enhance(text) {
    return this.addEmojis(text);
  }
}

module.exports = new EmojiManager();
