const MemoryEngine = require('../../memory/engine/MemoryEngine');

const MAX_MEMORIES = 5;

async function retrieve(userId, intent) {
  const start = Date.now();
  let memories = [];

  try {
    const ranked = await MemoryEngine.retrieve(userId, intent, { maxResults: MAX_MEMORIES });
    if (ranked && ranked.length > 0) {
      memories = ranked.map(r => r.memory);
    }
  } catch {
    try {
      const MemoryManager = require('../../memory/manager/memoryManager');
      const context = await MemoryManager.getContextForUser(userId);
      if (context) memories = Array.isArray(context) ? context.slice(0, MAX_MEMORIES) : [];
    } catch { /* no memories available */ }
  }

  return {
    memories,
    count: memories.length,
    elapsed: Date.now() - start,
  };
}

module.exports = { retrieve };
