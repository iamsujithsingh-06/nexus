const TRANSFORM_RULES = [
  {
    name: 'it-is-recommended',
    test: /\bit\s+(?:is\s+)?recommended\b/i,
    transform: (m) => m.replace(/\b(it\s+(?:is\s+)?recommended)\b/i, "I'd suggest"),
  },
  {
    name: 'it-is-advised',
    test: /\bit\s+(?:is\s+)?advised\b/i,
    transform: (m) => m.replace(/\b(it\s+(?:is\s+)?advised)\b/i, "I'd recommend"),
  },
  {
    name: 'please-find',
    test: /\bplease\s+find\b/i,
    transform: (m) => m.replace(/\bplease\s+find\b/i, 'Here is'),
  },
  {
    name: 'following-risks',
    test: /\bfollowing\s+risks?\s+(?:identified|found|detected|observed)\b/i,
    transform: (m) => m.replace(
      /\bfollowing\s+risks?\s+(?:identified|found|detected|observed)\b/i,
      "Here's what we need to watch out for"
    ),
  },
  {
    name: 'please-note',
    test: /\bplease\s+note\b/i,
    transform: (m) => m.replace(/\bplease\s+note\b/i, 'Quick heads up'),
  },
  {
    name: 'it-is-important',
    test: /\bit\s+is\s+important\s+(?:to|that)\b/i,
    transform: (m) => m.replace(/\b(it\s+is\s+important\s+(?:to|that))\b/i, "Here's the key thing"),
  },
  {
    name: 'in-order-to',
    test: /\bin\s+order\s+to\b/i,
    transform: (m) => m.replace(/\bin\s+order\s+to\b/i, 'To'),
  },
  {
    name: 'as-per',
    test: /\bas\s+per\b/i,
    transform: (m) => m.replace(/\bas\s+per\b/i, 'Based on'),
  },
  {
    name: 'with-regard',
    test: /\b(with\s+regard\s+to|in\s+regards?\s+to|regarding)\b/i,
    transform: (m) => m.replace(
      /\b(with\s+regard\s+to|in\s+regards?\s+to|regarding)\b/i,
      'About'
    ),
  },
  {
    name: 'utilize',
    test: /\butilize\b/i,
    transform: (m) => m.replace(/\butilize\b/i, 'use'),
  },
  {
    name: 'demonstrate',
    test: /\bdemonstrate\b/i,
    transform: (m) => m.replace(/\bdemonstrate\b/i, 'show'),
  },
  {
    name: 'facilitate',
    test: /\bfacilitate\b/i,
    transform: (m) => m.replace(/\bfacilitate\b/i, 'help'),
  },
  {
    name: 'implement',
    test: /\bimplementation\b/i,
    transform: (m) => m.replace(/\bimplementation\b/i, 'setup'),
  },
  {
    name: 'additional',
    test: /\badditional\b/i,
    transform: (m) => m.replace(/\badditional\b/i, 'more'),
  },
  {
    name: 'multiple',
    test: /\bmultiple\b/i,
    transform: (m) => m.replace(/\bmultiple\b/i, 'several'),
  },
  {
    name: 'approximately',
    test: /\bapproximately\b/i,
    transform: (m) => m.replace(/\bapproximately\b/i, 'around'),
  },
  {
    name: 'sufficient',
    test: /\bsufficient\b/i,
    transform: (m) => m.replace(/\bsufficient\b/i, 'enough'),
  },
  {
    name: 'assist',
    test: /\bassist\b/i,
    transform: (m) => m.replace(/\bassist\b/i, 'help'),
  },
  {
    name: 'pursuant',
    test: /\bpursuant\s+to\b/i,
    transform: (m) => m.replace(/\bpursuant\s+to\b/i, 'Following'),
  },
  {
    name: 'endeavor',
    test: /\bendeavor\b/i,
    transform: (m) => m.replace(/\bendeavor\b/i, 'try'),
  },
  {
    name: 'commence',
    test: /\bcommence\b/i,
    transform: (m) => m.replace(/\bcommence\b/i, 'start'),
  },
  {
    name: 'terminate',
    test: /\bterminate\b/i,
    transform: (m) => m.replace(/\bterminate\b/i, 'end'),
  },
  {
    name: 'prior-to',
    test: /\bprior\s+to\b/i,
    transform: (m) => m.replace(/\bprior\s+to\b/i, 'before'),
  },
  {
    name: 'subsequent',
    test: /\bsubsequent\b/i,
    transform: (m) => m.replace(/\bsubsequent\b/i, 'later'),
  },
];

const ENERGY_ADDERS = [
  {
    name: 'section-start',
    test: /^(#{1,3}\s)\*\*(.*?)\*\*/m,
    transform: (m) => m.replace(/^(#{1,3}\s)\*\*(.*?)\*\*/m, (_, h, t) => `${h}${t}`),
  },
];

const TANGLISH_PATTERNS = [
  { test: /\b(shall\s+we|should\s+we)\s+/i, replacement: 'shall we ' },
  { test: /\blet\s+us\s+/i, replacement: "let's " },
  { test: /\bdo\s+not\s+/i, replacement: "don't " },
  { test: /\bcannot\b/i, replacement: "can't" },
  { test: /\bwill\s+not\b/i, replacement: "won't" },
  { test: /\bit\s+is\b/i, replacement: "it's" },
  { test: /\bi\s+am\b/i, replacement: "I'm" },
  { test: /\byou\s+are\b/i, replacement: "you're" },
  { test: /\bthat\s+is\b/i, replacement: "that's" },
  { test: /\bthere\s+is\b/i, replacement: "there's" },
  { test: /\bhere\s+is\b/i, replacement: "here's" },
];

const TANGLISH_OPENERS = [
  "Broo",
  "Bro",
  "Hey bro",
  "Ya bro",
  "Machan",
  "Semma",
];

const TANGLISH_CONNECTORS = [
  'da',
  'bro',
  'ma',
  'ya',
];

class ToneAdapter {
  transform(text, language, modeName) {
    if (!text || text.length < 10) return text;

    let result = this._applyCorporateTransforms(text, language);

    if (language === 'tanglish') {
      result = this._applyTanglishStyle(result);
      result = this._addTanglishEnergy(result);
    } else if (modeName === 'casual') {
      result = this._addCasualEnergy(result);
    } else if (modeName === 'quick') {
      result = this._addQuickEnergy(result);
    } else {
      result = this._addGeneralEnergy(result);
    }

    return result;
  }

  _applyCorporateTransforms(text, language) {
    let result = text;

    for (const rule of TRANSFORM_RULES) {
      if (rule.test.test(result)) {
        result = rule.transform(result);
      }
    }

    if (language !== 'tanglish') {
      for (const rule of TANGLISH_PATTERNS) {
        result = result.replace(rule.test, rule.replacement);
      }
    }

    return result;
  }

  _applyTanglishStyle(text) {
    let result = text;

    result = result.replace(/\bi\b(?=\s+(?:think|feel|believe|would|will|can|have|am|was|want|need|like|love|hope|know|suggest|recommend))/gi, 'Naan');

    result = result.replace(/\byou\b/gi, 'Nee');

    result = result.replace(/\byour\b/gi, 'Un');

    result = result.replace(/\bwe\b/gi, 'Namma');

    result = result.replace(/\bis\b(?=\s+(?:there|here|this|that|it|the|a|not|also|really|very|quite|too))/gi, 'iruku');

    result = result.replace(/\bare\b(?=\s+(?:you|they|we|there|the|not|also))/gi, 'irukkinga');

    result = result.replace(/\bhave\b(?=\s+(?:to|been|you|they|we))/gi, 'iruku');

    result = result.replace(/\bwill\b(?!\s+not)/gi, 'pannuven');

    result = result.replace(/\bplease\b/gi, 'dayavu seithu');

    return result;
  }

  _addTanglishEnergy(text) {
    const lines = text.split('\n').filter(Boolean);
    if (lines.length === 0) return text;

    const firstLine = lines[0].trim();
    const hasGreeting = /\b(hey|hi|hello|bro|machan|semma)\b/i.test(firstLine);

    if (!hasGreeting && lines.length > 1) {
      const opener = TANGLISH_OPENERS[Math.floor(Math.random() * TANGLISH_OPENERS.length)];
      lines[0] = `${opener}! ${firstLine}`;
    }

    const connectors = TANGLISH_CONNECTORS;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;
      if (line.endsWith('?') && !line.endsWith('da?') && !line.endsWith('bro?')) {
        lines[i] = line.replace(/\?$/, ' da?');
      }
    }

    return lines.join('\n');
  }

  _addCasualEnergy(text) {
    const lines = text.split('\n').filter(Boolean);
    if (lines.length === 0 || lines.length > 5) return text;

    let lastLine = lines[lines.length - 1].trim();
    const hasEnding = /\b(bye|later|let me know|cheers|take care)\b/i.test(lastLine);
    if (!hasEnding && lines.length <= 3) {
      const endings = ['😊', '👍', '✨', '🙌'];
      if (!/[😊👍✨🙌🎉🚀]/.test(lastLine)) {
        lastLine = lastLine.replace(/[.!]*\s*$/, '') + ' ' + endings[Math.floor(Math.random() * endings.length)];
        lines[lines.length - 1] = lastLine;
      }
    }

    return lines.join('\n');
  }

  _addQuickEnergy(text) {
    const lines = text.split('\n').filter(Boolean);
    if (lines.length === 0) return text;

    const ctaIndex = lines.findIndex((l) =>
      /\b(let me know|what do you think|hope that helps|give it a try)\b/i.test(l.trim())
    );
    if (ctaIndex >= 0 && ctaIndex > lines.length - 3) {
      lines.splice(ctaIndex);
    }

    return lines.join('\n');
  }

  _addGeneralEnergy(text) {
    const lines = text.split('\n').filter(Boolean);
    if (lines.length === 0) return text;

    const result = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```')) {
        result.push(line);
        continue;
      }

      if (trimmed.endsWith('.') && !trimmed.endsWith('...') && !trimmed.endsWith('!')) {
        const shouldAddExclamation = /^(yes|no|great|awesome|cool|nice|perfect|excellent|wow|done|ready|lets)/i.test(trimmed);
        if (shouldAddExclamation) {
          line = trimmed.slice(0, -1) + '!';
        }
      }

      result.push(line);
    }

    const lastLine = result[result.length - 1].trim();
    const hasCta = /\b(?:try|let me know|ask|tell me|what do you think|shall we)\b/i.test(lastLine);
    if (!hasCta && result.length > 2) {
      const ctas = [
        'Let me know what you think!',
        'What do you think?',
        'Give it a try and let me know!',
        'Hope that helps! 🚀',
        'Let me know if you need anything else!',
        'Thoughts? 😊',
      ];
      result.push('');
      result.push(ctas[Math.floor(Math.random() * ctas.length)]);
    }

    return result.join('\n');
  }
}

module.exports = new ToneAdapter();
