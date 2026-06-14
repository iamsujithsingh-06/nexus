class ResponseModeDetector {
  detect(userMessage) {
    const msg = (userMessage || '').trim();
    if (!msg) return { mode: 'quick', confidence: 0, triggers: [] };

    const langResult = this._detectLanguage(msg);
    const triggers = [];

    if (this._isCasual(msg, langResult)) {
      triggers.push('casual');
      return { mode: 'casual', confidence: 0.92, triggers, language: langResult.language };
    }

    if (this._isProject(msg)) {
      triggers.push('project');
      return { mode: 'project', confidence: 0.88, triggers, language: langResult.language };
    }

    if (this._isKnowledge(msg)) {
      triggers.push('knowledge');
      return { mode: 'knowledge', confidence: 0.8, triggers, language: langResult.language };
    }

    if (this._isQuickAnswer(msg)) {
      triggers.push('quick');
      return { mode: 'quick', confidence: 0.82, triggers, language: langResult.language };
    }

    if (msg.length < 50) {
      triggers.push('very-short');
      return { mode: 'quick', confidence: 0.6, triggers, language: langResult.language };
    }

    triggers.push('default');
    return { mode: 'knowledge', confidence: 0.55, triggers, language: langResult.language };
  }

  _isCasual(msg, langResult) {
    const casualGreetings = [
      /\b(hey|hi|hello|yo|sup|howdy)\b/i,
      /\b(hola|namaste|vanakkam|bonjour|ciao)\b/i,
      /\b(good\s+morning|good\s+afternoon|good\s+evening|good\s+night)\b/i,
      /\b(what'?s\s+up|how'?s\s+it\s+going|how\s+are\s+you|how\s+are\s+things)\b/i,
      /\b(long\s+time|nice\s+to\s+(meet|see)|pleased?\s+to\s+meet)\b/i,
      /\b(bro|broo|machan|machi|thala|thalaiva)\b/i,
      /\b(thanks|thank\s+you|thx|ty|appreciate\s+it|good\s+one)\s*[.!]?\s*$/i,
      /\b(bye|goodbye|see\s+you|talk\s+later|catch\s+you|later)\s*[.!]?\s*$/i,
      /\b(ok|okay|alright|sure|got\s+it|understood)\s*[.!]?\s*$/i,
      /\b(awesome|cool|great|nice|perfect|wow)\s*[.!]?\s*$/i,
    ];

    const isGreetingOnly = casualGreetings.some((p) => p.test(msg));

    if (isGreetingOnly && msg.length < 60) return true;

    if (langResult && langResult.language === 'tanglish') {
      const tanglishGreeting = /\b(epdi|eppadi|enna\s+da|semma\s+da|machan|thala|ya\s+bro)\b/i.test(msg);
      if (tanglishGreeting && msg.length < 80) return true;
    }

    return false;
  }

  _isQuickAnswer(msg) {
    const howToBuild = /\b(how\s+(do|can|to)\s+(i|we)\s+(build|create|make|implement|architect|design|set\s+up|fix|solve|debug))\s+/i;
    if (howToBuild.test(msg)) return false;

    if (this._isKnowledge(msg)) return false;

    const howExplain = /\bhow\s+(does|do|can|would|should)\s+\w+\s+(work|function|operate|happen)\b/i;
    if (howExplain.test(msg)) return false;

    const helpDebug = /\b(help|debug|fix|solve|resolve)\s+(me|this|my|the|a)\b/i;
    if (helpDebug.test(msg)) return false;

    const simpleFactual = [
      /^(what|who|when|where)\s+(is|was|are|were|created|invented|discovered|called)\s/i,
      /^(what|who)\s+(is|was|are)\s+/i,
      /^(how\s+(many|much|tall|long|big|far|fast|old))\s+/i,
      /^(when\s+(was|were|did|is))\s+/i,
      /^(define|what\s+is\s+the\s+definition|meaning\s+of)\s+/i,
      /^(\w+\s+meaning|\w+\s+definition|what\s+does\s+\w+\s+mean)\s*/i,
      /^(is\s+\w+\s+(a|an|the))\s+/i,
      /^(\w+\s+vs\s+\w+|difference\s+between)\s*/i,
    ];

    const anyMatch = simpleFactual.some((p) => p.test(msg));
    if (anyMatch && msg.length < 100) return true;

    const shortWithQuestion = msg.length < 30 && msg.includes('?');
    if (shortWithQuestion && msg.length < 30) return true;

    return false;
  }

  _isKnowledge(msg) {
    const learningPatterns = [
      /\b(explain|learn|teach|tutorial|guide|understand|concept|fundamentals?|basics?)\b/i,
      /\b(how\s+(does|do|can|to|would|should))\s+/i,
      /\b(why\s+(does|do|is|are|can|would|should))\s+/i,
      /\b(what\s+is\s+(the\s+)?(difference|purpose|benefit|advantage|disadvantage))\b/i,
      /\b(tell\s+me\s+(about|more|everything))\b/i,
      /\b(deep\s+dive|walk\s+me\s+through|break\s+down|elaborate)\b/i,
      /\b(help|debug|fix|solve|resolve)\s+(me\s+)?(understand|with|this|my|a|an|the)\b/i,
    ];

    const hasLearning = learningPatterns.some((p) => p.test(msg));
    if (!hasLearning) return false;

    const casualOnly = this._isCasual(msg, { language: 'general' });
    if (casualOnly) return false;

    const projectHowTo = /\b(how\s+(do|can|to)\s+(i|we)\s+(build|create|make|implement|architect|design|set\s+up))\s+/i;
    if (projectHowTo.test(msg)) return false;

    return true;
  }

  _isProject(msg) {
    if (this._isQuickAnswer(msg) || this._isKnowledge(msg)) return false;

    const projectPatterns = [
      /\b(project|platform|startup)\b/i,
      /\b(architecture|design\s+pattern|system\s+design|tech\s+stack|microservices)\b/i,
      /\b(roadmap|timeline|milestone|sprint|release\s+plan)\b/i,
      /\b(build|create|develop|implement)\s+(a|an|the)\s+[\w-]+\s*(app|api|platform|service|system)\b/i,
      /\b(architect|design)\s+(a|an|the)\s+(entire|full|complete|whole|scalable|distributed)\s*/i,
      /\b(how\s+(do|can|to)\s+(i|we)\s+(build|create|make|implement|architect|design|set\s+up))\s+/i,
    ];

    const systemPattern = /\b(system)\b/i;
    const systemExclusions = [
      /\b(solar\s+system|nervous\s+system|immune\s+system|operating\s+system|file\s+system|ecosystem)\b/i,
    ];

    const hasSystem = systemPattern.test(msg) && !systemExclusions.some((p) => p.test(msg));
    const hasOtherProject = projectPatterns.some((p) => p.test(msg));

    if (!hasSystem && !hasOtherProject) return false;

    const casualOnly = this._isCasual(msg, { language: 'general' });
    if (casualOnly) return false;

    if (hasSystem && !hasOtherProject && msg.length < 60) return false;

    return true;
  }

  _detectLanguage(msg) {
    try {
      const ld = require('../personality/languageDetector');
      return ld.detect(msg);
    } catch {
      return { language: 'general', confidence: 0 };
    }
  }
}

module.exports = new ResponseModeDetector();
