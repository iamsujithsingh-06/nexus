const Memory = require('../../models/Memory');
const logger = require('./memoryLogger');

async function updateOnChange(userId, type, key, newValue, options = {}) {
  const existing = await Memory.findOne({ userId, key }).lean();
  if (!existing) return null;

  const oldStr = JSON.stringify(existing.value);
  const newStr = JSON.stringify(newValue);

  if (oldStr === newStr) {
    return { updated: false, memory: existing, reason: 'No change detected' };
  }

  const updated = await Memory.findOneAndUpdate(
    { userId, key },
    {
      $set: {
        value: newValue,
        ...(options.importanceScore !== undefined ? { importanceScore: options.importanceScore } : {}),
        ...(options.confidence !== undefined ? { confidence: options.confidence } : {}),
      },
      $inc: { timesUsed: 1, accessCount: 1 },
    },
    { new: true }
  );

  logger.log('UPDATED', { userId, type, key, reason: 'Content changed' });
  return { updated: true, memory: updated, reason: 'Content changed' };
}

async function detectAndUpdate(userId, message, intent) {
  if (!message || typeof message !== 'string') return null;

  const changePatterns = [
    { regex: /(?:i(?:'ve)?\s+)?changed?\s+my\s+(\w+)\s+to\s+(.+)/i, extract: (m) => ({ field: m[1], newValue: m[2] }) },
    { regex: /(?:i(?:'m|'ve)?\s+)?(?:now|currently)\s+(.+?ing)\s+(.+)/i, extract: (m) => ({ field: 'activity', newValue: `${m[1]} ${m[2]}` }) },
    { regex: /my\s+(?:new|current|updated)\s+(\w+)\s+(?:is|are)\s+(.+)/i, extract: (m) => ({ field: m[1], newValue: m[2] }) },
  ];

  for (const pattern of changePatterns) {
    const match = message.match(pattern.regex);
    if (match) {
      const { field, newValue } = pattern.extract(match);

      const existing = await Memory.find({
        userId,
        type: intent === 'goal_related' ? 'goal' : 'preference',
        lifecycleStatus: { $ne: 'expired' },
      })
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean();

      const targetField = field.toLowerCase();
      for (const mem of existing) {
        const val = mem.value || {};
        const matchFound = Object.values(val).some(v =>
          typeof v === 'string' && v.toLowerCase().includes(targetField)
        );
        if (matchFound) {
          const updated = await Memory.findOneAndUpdate(
            { _id: mem._id },
            { $set: { 'value.description': newValue, updatedAt: new Date() } },
            { new: true }
          );
          logger.log('UPDATED', { userId, key: mem.key, reason: `Detected change in ${field}` });
          return { updated: true, memory: updated, field };
        }
      }
    }
  }

  return null;
}

module.exports = { updateOnChange, detectAndUpdate };
