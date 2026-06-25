const SKIP_PATTERNS = [
  /^\s*(hi|hello|hey|yo|sup|howdy|good\s*(morning|afternoon|evening)|what'?s\s+up)\b/i,
  /^(lol|lmao|haha|nice|ok|okay|sure|great|awesome|thanks|thank\s+you|ty)\s*$/i,
  /^(how\s+(are|is|was)|what'?s\s+up|how'?s\s+(it|everything|life|going))\s*\??$/i,
  /^(bye|goodbye|see\s+you|later|cya|g2g|got[st]?\s+go)\b/i,
  /^(lol|lmao|rofl|lmfao)\s*$/i,
  /^(yes|no|yeah|nope|yep|nah|maybe|idk)\s*$/i,
];

const STORE_PATTERNS = [
  /\b(i\s+(want|need|would\s+like|plan|intend|aim|hope|wish)\s+to)\b/i,
  /\b(my\s+(name|age|location|occupation|role|company|skill|goal|target|objective|dream|ambition|project|habit|routine|idea))\b/i,
  /\b(i\s+(am|work|live|study|specialize|focus|enjoy|love|hate|prefer|completed|finished|achieved|accomplished|earned|built|created|decided))\b/i,
  /\b(i'm\s+(learning|studying|practicing|working\s+on|building|creating|planning|saving|trying))\b/i,
  /\b(i've?\s+(been|started|begun|joined|signed|applied|enrolled|committed))\b/i,
  /\b(my\s+(favorite|least\s+favorite|best|worst))\b/i,
  /\b(i\s+(like|love|enjoy|prefer|hate|dislike|can'?t\s+stand))\b/i,
];

function shouldStore(message) {
  if (!message || typeof message !== 'string') return { store: false, reason: 'Empty' };

  const trimmed = message.trim();
  if (trimmed.length < 5) return { store: false, reason: 'Too short' };

  for (const skip of SKIP_PATTERNS) {
    if (skip.test(trimmed)) return { store: false, reason: 'Greeting or filler' };
  }

  for (const store of STORE_PATTERNS) {
    if (store.test(trimmed)) return { store: true, reason: 'Storable content detected' };
  }

  if (trimmed.split(/\s+/).length >= 15) {
    return { store: true, reason: 'Long message may contain storable info' };
  }

  return { store: false, reason: 'No storable patterns matched' };
}

module.exports = { shouldStore };
