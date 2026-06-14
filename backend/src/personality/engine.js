const LanguageDetector = require('./languageDetector');
const ToneAdapter = require('./toneAdapter');
const EmojiManager = require('./emojiManager');

class PersonalityEngine {
  enhance(responseText, userMessage) {
    return this.enhanceWithMode(responseText, userMessage, null);
  }

  enhanceWithMode(responseText, userMessage, mode) {
    if (!responseText || !responseText.trim()) return responseText;
    if (this._shouldSkipPersonality(responseText)) return responseText;

    const langResult = userMessage
      ? LanguageDetector.detect(userMessage)
      : { language: 'general', confidence: 0 };

    const modeName = (mode && mode.mode) || null;

    if (langResult.language === 'tanglish') {
      return this._applyTanglishPersonality(responseText, modeName);
    }

    return this._applyEnglishPersonality(responseText, modeName);
  }

  enhanceWithLanguage(responseText, language) {
    if (!responseText || !responseText.trim()) return responseText;
    if (this._shouldSkipPersonality(responseText)) return responseText;

    if (language === 'tanglish') {
      return this._applyTanglishPersonality(responseText, null);
    }

    return this._applyEnglishPersonality(responseText, null);
  }

  _applyEnglishPersonality(text, modeName) {
    let result = text;
    result = ToneAdapter.transform(result, 'general', modeName);
    result = EmojiManager.enhance(result, modeName);
    return result;
  }

  _applyTanglishPersonality(text, modeName) {
    let result = text;
    result = ToneAdapter.transform(result, 'tanglish', modeName);
    result = EmojiManager.enhance(result, modeName);
    return result;
  }

  _shouldSkipPersonality(text) {
    if (text.trim().length < 15) return true;

    const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
    const codeLen = codeBlocks.reduce((s, b) => s + b.length, 0);
    return text.length > 50 && codeLen / text.length > 0.6;
  }

  detectLanguage(userMessage) {
    return LanguageDetector.detect(userMessage || '');
  }
}

module.exports = new PersonalityEngine();
