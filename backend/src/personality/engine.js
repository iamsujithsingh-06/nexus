const LanguageDetector = require('./languageDetector');
const ToneAdapter = require('./toneAdapter');
const EmojiManager = require('./emojiManager');

class PersonalityEngine {
  enhance(responseText, userMessage) {
    if (!responseText || !responseText.trim()) return responseText;
    if (this._shouldSkipPersonality(responseText)) return responseText;

    const langResult = userMessage
      ? LanguageDetector.detect(userMessage)
      : { language: 'general', confidence: 0 };

    if (langResult.language === 'tanglish') {
      return this._applyTanglishPersonality(responseText);
    }

    return this._applyEnglishPersonality(responseText);
  }

  enhanceWithLanguage(responseText, language) {
    if (!responseText || !responseText.trim()) return responseText;
    if (this._shouldSkipPersonality(responseText)) return responseText;

    if (language === 'tanglish') {
      return this._applyTanglishPersonality(responseText);
    }

    return this._applyEnglishPersonality(responseText);
  }

  _applyEnglishPersonality(text) {
    let result = text;
    result = ToneAdapter.transform(result, 'general');
    result = EmojiManager.enhance(result);
    return result;
  }

  _applyTanglishPersonality(text) {
    let result = text;
    result = ToneAdapter.transform(result, 'tanglish');
    result = EmojiManager.enhance(result);
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
