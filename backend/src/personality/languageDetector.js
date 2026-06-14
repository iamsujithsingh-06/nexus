const TAMIL_WORDS = new Set([
  'da', 'ma', 'ya', 'machan', 'machi', 'thala', 'thalaiva',
  'enna', 'yenna', 'yen', 'yean', 'epdi', 'eppadi', 'enga', 'eenga',
  'ithu', 'ithula', 'idhu', 'athu', 'adhu', 'indha', 'andha',
  'aagum', 'aagadhu', 'aagala',
  'pannu', 'pannunga', 'pannalam', 'pannen', 'pannitu',
  'vaa', 'vaanga', 'poda', 'podunga', 'pothu', 'poyitu',
  'semma', 'mass', 'vera', 'rocking', 'thara',
  'konjam', 'romba', 'sari', 'correct', 'setha',
  'venum', 'venam', 'vendam', 'vendum',
  'illa', 'ille', 'illaya',
  'iruku', 'irukku', 'irukkingala', 'iruntha',
  'sollu', 'sollunga', 'solen', 'sollala',
  'pakka', 'pathu', 'pathalam',
  'sir', 'akka', 'anna',
  'nalla', 'nala',
  'apdi', 'apdiyae', 'ipdi', 'ipdiyae',
  'mudiyum', 'mudiyadhu', 'mudila',
  'thaan', 'dhaan', 'taan',
  'seri', 'sari',
  'yov', 'yonga',
  'thambi', 'thangachi',
  'rendu', 'moonu', 'naalu', 'anju',
  'ennoda', 'unnoda', 'avanoda',
  'ipo', 'ippo', 'appo', 'apparam',
  'vachu', 'vachuruken', 'vachiruken',
  'kudukka', 'kudutha', 'kuduthuten',
  'eduthu', 'eduthuten', 'edukalaam',
  'pochu', 'mudichu',
  'sentiment',
  'vera level', 'next level',
  'mass da', 'semma da', 'vera ma',
]);

function detect(text) {
  if (!text || typeof text !== 'string' || text.trim().length < 2) {
    return { language: 'general', confidence: 0 };
  }

  const cleaned = text.toLowerCase().replace(/[^a-z\s]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return { language: 'general', confidence: 0 };
  }

  let tamilWordCount = 0;
  let tamilCharacterCount = 0;

  for (const word of words) {
    if (TAMIL_WORDS.has(word)) {
      tamilWordCount++;
    }
  }

  const tamilUnicodePattern = /[\u0B80-\u0BFF]/g;
  const tamilUnicodeMatches = text.match(tamilUnicodePattern);
  if (tamilUnicodeMatches) {
    tamilCharacterCount = tamilUnicodeMatches.length;
  }

  const tanglishRatio = tamilWordCount / words.length;
  const hasTamilUnicode = tamilCharacterCount > 0;

  const formalityIndicators = [
    /\b(please|kindly|regards|sincerely|appreciate|formal|thereafter|hereby|herewith)\b/i,
    /\b(however|furthermore|nevertheless|consequently|accordingly)\b/i,
    /\b(I would like to|it is recommended|it is advised|please find)\b/i,
  ];

  const hasFormal = formalityIndicators.some((p) => p.test(text));

  if (hasTamilUnicode || tanglishRatio >= 0.15) {
    return { language: 'tanglish', confidence: Math.min(tanglishRatio, 1) };
  }

  if (tanglishRatio >= 0.08 || (tanglishRatio >= 0.05 && words.length <= 10)) {
    return { language: 'tanglish', confidence: tanglishRatio };
  }

  if (hasFormal && words.length > 8) {
    return { language: 'professional', confidence: 0.7 };
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const casual = [
    /\b(hey|yo|sup|awesome|cool|nice|great|love|bro|dude)\b/i,
    /\b(wow|omg|ha|haha|lol|yeah|nope|yep|nah)\b/i,
  ];

  const hasCasual = casual.some((p) => p.test(text));

  if (hasCasual || exclamationCount > 0 || words.length <= 5) {
    return { language: 'general', confidence: 0.5 };
  }

  return { language: 'general', confidence: 0.3 };
}

module.exports = { detect };
