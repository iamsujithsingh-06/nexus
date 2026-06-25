const BASE_IMPORTANCE = {
  goal: 0.85,
  career: 0.85,
  achievement: 0.9,
  important_event: 0.85,
  user_profile: 0.8,
  profile: 0.8,
  project: 0.75,
  decision: 0.7,
  relationship: 0.7,
  skill: 0.7,
  learning_progress: 0.6,
  idea: 0.6,
  task: 0.5,
  habit: 0.5,
  custom: 0.5,
  preference: 0.4,
  interest: 0.4,
  insight: 0.5,
  fact: 0.3,
  conversation: 0.2,
  conversation_insight: 0.3,
};

function score(type, message, value) {
  let score = BASE_IMPORTANCE[type] || 0.3;
  const text = message || '';

  if (/\b(my|i'm|i am|i work|i live|i study|i specialize)\b/i.test(text)) score += 0.1;
  if (/\b(i want|i plan|i will|i aim|my goal|i intend|going to|i aspire)\b/i.test(text)) score += 0.1;
  if (/\b(i completed|i finished|i achieved|i earned|i built|i created|i launched)\b/i.test(text)) score += 0.15;
  if (/\b(i decided|i've decided|my plan is|my next step)\b/i.test(text)) score += 0.1;
  if (/\b(today|tonight|this weekend|maybe|perhaps|i might|i guess)\b/i.test(text)) score -= 0.1;

  const wordCount = text.split(/\s+/).length;
  if (wordCount > 20) score += 0.05;

  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

function determineLifecycle(score) {
  if (score >= 0.8) return 'permanent';
  if (score >= 0.5) return 'active';
  return 'active';
}

module.exports = { score, determineLifecycle };
