/**
 * Conversation Classifier — Detects conversation mode and determines memory/pipeline needs.
 *
 * This replaces the topic-based intentDetector as the primary message classifier.
 * It answers three questions:
 *   1. What kind of conversation is this? (mode)
 *   2. Does this conversation need memory context? (needsMemory)
 *   3. Should this bypass the full agent pipeline? (skipPipeline)
 */

// ---------------------------------------------------------------------------
// Mode constants
// ---------------------------------------------------------------------------

const MODE = {
  GREETING: 'greeting',
  SMALL_TALK: 'small_talk',
  VENTING: 'venting',
  CELEBRATING: 'celebrating',
  EMOTIONAL: 'emotional',
  QUESTION: 'question',
  ADVICE: 'advice',
  TECHNICAL: 'technical',
  DEEP_DISCUSSION: 'deep_discussion',
  GOAL: 'goal',
  PROJECT: 'project',
  JOKE: 'joke',
  GENERAL: 'general',
};

// ---------------------------------------------------------------------------
// Modes that should NEVER trigger memory injection
// ---------------------------------------------------------------------------

const NO_MEMORY_MODES = new Set([
  MODE.GREETING,
  MODE.SMALL_TALK,
  MODE.VENTING,
  MODE.CELEBRATING,
  MODE.EMOTIONAL,
  MODE.JOKE,
  MODE.GENERAL,
  MODE.DEEP_DISCUSSION,
]);

// ---------------------------------------------------------------------------
// Modes that should skip the Planner / Analyzer / Reviewer pipeline entirely
// ---------------------------------------------------------------------------

const MODES_SKIP_PIPELINE = new Set([
  MODE.GREETING,
  MODE.SMALL_TALK,
  MODE.VENTING,
  MODE.CELEBRATING,
  MODE.EMOTIONAL,
  MODE.JOKE,
]);

// ---------------------------------------------------------------------------
// Detection patterns (ordered by priority)
// ---------------------------------------------------------------------------

// Greeting: short social openers
const GREETING_PATTERNS = [
  /^(hi|hey|hello|heyy?|hiya|howdy|yo|sup|hey there)\b/i,
  /^(good )?(morning|afternoon|evening)\b/i,
  /^what['']?s up\b/i,
  /^how['']?s it going\b/i,
];

// Small talk: casual chit-chat, no depth
const SMALL_TALK_PATTERNS = [
  /^how are you/i,
  /^(not | )?much\b/i,
  /^(just )?chilling?\b/i,
  /^(pretty )?good\b/i,
  /how['']?s your (day|week|morning)/i,
  /nice (weather|day|chat)/i,
  /what['']?s new/i,
  /long time no (see|talk)/i,
];

// Venting: frustration without asking for solutions
const VENTING_PATTERNS = [
  /i (?:am|'m) .{0,40}?(tired|exhausted|fed up|frustrated|annoyed|angry|sick of)/i,
  /i can['']?t (deal with|stand|take|handle)/i,
  /this is .{0,40}?(ridiculous|frustrating|annoying|absurd)/i,
  /(work|life|everything) is (exhausting|overwhelming|too much)/i,
  /why does (everything|this) (have to|always) /i,
  /i give up/i,
  /nothing (works|goes right)/i,
];

// Celebrating: sharing good news
const CELEBRATING_PATTERNS = [
  /i (got|received|finally|actually|just) (the |a |)(job|promotion|offer|acceptance|result)/i,
  /i['']?m (so |really )?(excited|happy|thrilled) (to|that|about)/i,
  /(guess what|good news|great news)/i,
  /i did it/i,
  /i (finally |actually )?(finished|completed|achieved|accomplished)/i,
  /we (did it|pulled it off|made it)/i,
];

// Emotional sharing (negative): sadness, anxiety, grief
const EMOTIONAL_PATTERNS = [
  /i (?:am|'m) .{0,40}?(down|sad|lonely|low|blue|depressed|anxious|worried|scared)/i,
  /i['']?ve been .{0,40}?(down|struggling|having a hard time|going through it)/i,
  /(i think )?something['']?s wrong with me/i,
  /i don['']?t know what to do (about|with) (myself|my life|this)/i,
  /i feel (lost|empty|hopeless|alone)/i,
];

// Joke / playful
const JOKE_PATTERNS = [
  /(tell me |got any |know any )?(a )?joke/i,
  /that['']?s (funny|hilarious)/i,
  /lol|lmao|rofl/i,
  /just kidding/i,
  /^(lol|lmao)\b/i,
];

// Technical help: coding, debugging, tech questions
const TECHNICAL_PATTERNS = [
  /(code|program|debug|function|error|bug|syntax|compile|algorithm)/i,
  /(react|vue|angular|node|python|javascript|typescript|docker|git|api)/i,
  /(how do i|how to|can you help me with) (code|write|implement|fix|debug|build)/i,
  /my (code|app|program|script) (isn['']?t|doesn['']?t|won['']?t|keeps)/i,
  /error:|exception:|traceback|failed:|uncaught/i,
];

// Goal discussion: explicitly about personal goals
const GOAL_PATTERNS = [
  /(goal|aim|objective|target|resolution|milestone)/i,
  /i (want|need|plan|hope|aim|aspire|intend) to/i,
  /my goal (is|should be) to/i,
  /i (will|shall|should|must|have to) (.+) (to |so i can|because)/i,
  /help me (achieve|reach|accomplish|complete)/i,
  /track (my|my progress on|my goal)/i,
  /how['']?s my (.+) (going|progress)/i,
];

// Project discussion: explicitly about a project
const PROJECT_PATTERNS = [
  /(project|task|feature|sprint|deadline|deliverable|roadmap|backlog)/i,
  /working on (a |the |my )?(project|app|website|feature)/i,
  /(started|building|launching|deploying) (a |the |my )?/i,
  /(architecture|design pattern|tech stack|codebase)/i,
  /(github|repo|repository|deploy|pipeline|ci\/cd)/i,
];

// Deep discussion: philosophical, reflective, open-ended
const DEEP_PATTERNS = [
  /(what do you think about|what['']?s your take on|how do you feel about)/i,
  /(why do (people|we|you) )/i,
  /(i['']?ve been thinking about|i wonder (if|why|how|what))/i,
  /(philosophical|existential|meaning of life|purpose)/i,
  /(what['']?s the point|does any of it matter)/i,
];

// Advice: asking for guidance
const ADVICE_PATTERNS = [
  /what should i (do|say|choose|pick|go with)/i,
  /should i/i,
  /i need (advice|help|guidance|your opinion)/i,
  /what would you (do|recommend|suggest)/i,
  /(how should i |what['']?s the best way to |any tips on)/i,
];

// Question: asking for information (not personal advice)
const QUESTION_PATTERNS = [
  /^(what|how|why|when|where|who|which|can|could|would|will|do|does|is|are)\s/i,
  /tell me about/i,
  /explain/i,
  /what['']?s the difference/i,
  /how does (this|that|it) work/i,
  /\?$/,
];

// ---------------------------------------------------------------------------
// Exported detection functions
// ---------------------------------------------------------------------------

function isGreeting(message) {
  return GREETING_PATTERNS.some((p) => p.test(message));
}

function isSmallTalk(message) {
  return SMALL_TALK_PATTERNS.some((p) => p.test(message));
}

function isVenting(message) {
  return VENTING_PATTERNS.some((p) => p.test(message));
}

function isCelebrating(message) {
  return CELEBRATING_PATTERNS.some((p) => p.test(message));
}

function isEmotional(message) {
  return EMOTIONAL_PATTERNS.some((p) => p.test(message));
}

function isJoke(message) {
  return JOKE_PATTERNS.some((p) => p.test(message));
}

function isTechnical(message) {
  return TECHNICAL_PATTERNS.some((p) => p.test(message));
}

function isGoal(message) {
  return GOAL_PATTERNS.some((p) => p.test(message));
}

function isProject(message) {
  return PROJECT_PATTERNS.some((p) => p.test(message));
}

function isDeepDiscussion(message) {
  return DEEP_PATTERNS.some((p) => p.test(message));
}

function isAdvice(message) {
  return ADVICE_PATTERNS.some((p) => p.test(message));
}

function isQuestion(message) {
  return QUESTION_PATTERNS.some((p) => p.test(message));
}

// ---------------------------------------------------------------------------
// Main classifier
// ---------------------------------------------------------------------------

/**
 * Classify a user message into a conversation mode.
 *
 * Detection priority (first match wins):
 *   1. Greeting
 *   2. Joke / playful
 *   3. Celebrating
 *   4. Venting
 *   5. Emotional
 *   6. Goal discussion
 *   7. Project discussion
 *   8. Technical help
 *   9. Advice request
 *  10. Deep discussion
 *  11. Question
 *  12. Small talk (only for very short messages)
 *  13. General (fallback)
 *
 * @param {string} message - The raw user message
 * @returns {{ mode: string, needsMemory: boolean, skipPipeline: boolean }}
 */
function classify(message) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { mode: MODE.GENERAL, needsMemory: false, skipPipeline: true };
  }

  const trimmed = message.trim();
  const isShort = trimmed.split(/\s+/).length <= 6;

  // Priority 1: Greeting
  if (isGreeting(trimmed)) {
    return { mode: MODE.GREETING, needsMemory: false, skipPipeline: true };
  }

  // Priority 2: Joke
  if (isJoke(trimmed)) {
    return { mode: MODE.JOKE, needsMemory: false, skipPipeline: true };
  }

  // Priority 3: Celebrating
  if (isCelebrating(trimmed)) {
    return { mode: MODE.CELEBRATING, needsMemory: false, skipPipeline: true };
  }

  // Priority 4: Venting
  if (isVenting(trimmed)) {
    return { mode: MODE.VENTING, needsMemory: false, skipPipeline: true };
  }

  // Priority 5: Emotional
  if (isEmotional(trimmed)) {
    return { mode: MODE.EMOTIONAL, needsMemory: false, skipPipeline: true };
  }

  // Priority 6: Goal discussion
  if (isGoal(trimmed)) {
    return { mode: MODE.GOAL, needsMemory: true, skipPipeline: false };
  }

  // Priority 7: Project discussion
  if (isProject(trimmed)) {
    return { mode: MODE.PROJECT, needsMemory: true, skipPipeline: false };
  }

  // Priority 8: Technical help
  if (isTechnical(trimmed)) {
    return { mode: MODE.TECHNICAL, needsMemory: false, skipPipeline: false };
  }

  // Priority 9: Advice request
  if (isAdvice(trimmed)) {
    return { mode: MODE.ADVICE, needsMemory: false, skipPipeline: false };
  }

  // Priority 10: Deep discussion
  if (isDeepDiscussion(trimmed)) {
    return { mode: MODE.DEEP_DISCUSSION, needsMemory: false, skipPipeline: false };
  }

  // Priority 11: Question
  if (isQuestion(trimmed)) {
    return { mode: MODE.QUESTION, needsMemory: false, skipPipeline: false };
  }

  // Priority 12: Short messages that didn't match anything — small talk
  if (isShort) {
    return { mode: MODE.SMALL_TALK, needsMemory: false, skipPipeline: true };
  }

  // Priority 13: Fallback
  return { mode: MODE.GENERAL, needsMemory: false, skipPipeline: true };
}

module.exports = {
  classify,
  MODE,
};
