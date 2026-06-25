const Memory = require('../../models/Memory');

const CONTRACTIONS = {
  "what's": "what is", "who's": "who is", "where's": "where is",
  "when's": "when is", "why's": "why is", "how's": "how is",
  "what're": "what are", "who're": "who are",
  "i'm": "i am", "i've": "i have", "i'll": "i will", "i'd": "i would",
  "it's": "it is", "it'll": "it will",
  "don't": "do not", "doesn't": "does not", "didn't": "did not",
  "won't": "will not", "wouldn't": "would not", "couldn't": "could not",
  "shouldn't": "should not", "can't": "cannot",
  "isn't": "is not", "aren't": "are not", "wasn't": "was not",
  "weren't": "were not", "haven't": "have not", "hasn't": "has not",
  "you're": "you are", "you've": "you have", "you'll": "you will",
  "they're": "they are", "they've": "they have", "they'll": "they will",
  "we're": "we are", "we've": "we have", "we'll": "we will",
};

const QUESTION_WORDS = new Set(['what', 'who', 'where', 'when', 'why', 'how', 'which', 'do', 'does', 'did', 'is', 'are', 'was', 'were', 'can', 'could', 'will', 'would', 'shall', 'should']);

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
  'this', 'that', 'these', 'those', 'it', 'its', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'can', 'could', 'shall', 'should', 'may',
  'might', 'must', 'not', 'no', 'nor', 'so', 'very', 'just', 'also',
  'too', 'all', 'every', 'each', 'some', 'any', 'both', 'few', 'more',
  'most', 'other', 'such', 'only', 'own', 'same', 'than', 'then',
  'now', 'here', 'there', 'well', 'even', 'still', 'yet', 'already',
]);

class QueryNormalizer {
  normalize(message) {
    if (!message || typeof message !== 'string') {
      return { normalized: '', keywords: [], isQuestion: false, hasQuestionWord: false, expanded: '' };
    }
    let text = message.trim();
    const isQuestion = /\?$/.test(text);
    text = text.replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim();
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    const expanded = words.map(w => CONTRACTIONS[w] || w).join(' ');
    const expandedWords = expanded.split(/\s+/);
    const hasQuestionWord = expandedWords.some(w => QUESTION_WORDS.has(w));
    const keywords = expandedWords.filter(w => w.length > 2 && !STOP_WORDS.has(w));
    return { normalized: expanded, keywords, isQuestion, hasQuestionWord, expanded };
  }

  extractTopic(message) {
    const { keywords } = this.normalize(message);
    const topicIndicators = ['favorite', 'current', 'main', 'primary', 'best', 'top'];
    for (const indicator of topicIndicators) {
      const idx = keywords.indexOf(indicator);
      if (idx >= 0 && idx + 1 < keywords.length) return keywords[idx + 1];
    }
    return null;
  }

  isGoalQuery(message) {
    const lower = message.toLowerCase().trim();
    if (/^(what|who|where|when|why|how|do|does|did|is|are|can|could|will|would)\b.*\b(goal|dream|ambition|aspiration)/.test(lower)) return true;
    if (/what do i (want to become|aspire to|dream of)/i.test(lower)) return true;
    return false;
  }

  isGoalDeclaration(message) {
    const lower = message.toLowerCase().trim();
    if (/^(what|who|where|when|why|how|do|does|did|is|are|can|could|will|would)\b/.test(lower)) return false;
    return /\b(goal|dream|ambition|aspiration|aim|objective|target)\b/.test(lower) && /my|i\s+(want|need|plan|hope|aim|dream)/i.test(lower);
  }
}

module.exports = new QueryNormalizer();
