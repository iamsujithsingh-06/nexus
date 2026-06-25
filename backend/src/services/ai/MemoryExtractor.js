const MemoryEngine = require('../../memory/engine/MemoryEngine');

function _inferType(message, intent) {
  if (intent === 'goal_related' || /\b(goal|target|objective|aim|aspire|dream|ambition)\b/i.test(message)) return 'goal';
  if (/\b(completed|finished|achieved|accomplished|earned|built|created|launched)\b/i.test(message)) return 'achievement';
  if (/\b(my\s+(name|age|location|occupation|role|company|skill))\b/i.test(message)) return 'user_profile';
  if (/\b(i\s+decided|i've\s+decided|my\s+plan\s+is)\b/i.test(message)) return 'decision';
  if (/\b(i'm\s+(learning|studying|practicing|working\s+on|building))\b/i.test(message)) return 'learning_progress';
  if (/\b(i\s+(work|am|been)\s+(at|for|with))\b/i.test(message)) return 'career';
  if (/\b(my\s+(project|side project))\b/i.test(message)) return 'project';
  if (/\b(prefer|like|love|enjoy|hate|dislike|favorite)\b/i.test(message)) return 'preference';
  if (/\b(idea|thought|concept|what if|imagine)\b/i.test(message)) return 'ideas';
  return 'preference';
}

async function extract(userId, message, intent) {
  const memoryType = _inferType(message, intent);
  const key = `ai_brain_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const result = await MemoryEngine.save(userId, memoryType, key, {
      text: message,
      intent,
      source: 'ai_brain',
      extractedAt: new Date().toISOString(),
    }, {
      message,
      source: 'ai_extracted',
      confidence: 0.85,
      priority: intent === 'goal_related' ? 8 : 5,
    });

    if (result.saved) {
      return { stored: true, reason: result.merged ? 'Merged with existing' : 'Stored', memory: result.memory, type: memoryType };
    }
    return { stored: false, reason: result.reason || 'Not storable', memory: null, type: memoryType };
  } catch (err) {
    return { stored: false, reason: err.message, memory: null, type: memoryType };
  }
}

module.exports = { extract };
