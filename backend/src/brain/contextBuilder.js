/**
 * Context Builder — Constructs a structured context envelope for the AI model.
 *
 * CRITICAL RULE: User goals, projects, and personal memory are ONLY included
 * when the conversation mode requires them, OR when the user explicitly asks
 * about their stored information (e.g., "What's my name?").
 *
 * For greetings, small talk, venting, and emotional sharing, the context
 * envelope contains nothing but the message itself — no goals, no projects,
 * no profile references unless directly asked.
 *
 * When memory IS injected, usage instructions are included to tell the AI
 * to only reference the information if the conversation genuinely requires it.
 */

const { MODE } = require('./conversationClassifier');

/**
 * Build the enriched context object.
 *
 * @param {Array}  goals   - User goals (from goalManager)
 * @param {object|string|Array|null} memory - User memory context (string, object, or array of ranked memories)
 * @param {string} message - The raw user message
 * @param {string} mode    - Conversation mode (from conversationClassifier)
 * @param {boolean} isMemoryQuery - Whether the message is explicitly asking about stored info
 * @returns {{ userGoals: Array|null, userMemory: object|string|null, currentMessage: string, conversationMode: string, isMemoryQuery: boolean }}
 */
function buildContext(goals, memory, message, mode, isMemoryQuery = false) {
  const safeMode = typeof mode === 'string' ? mode : MODE.GENERAL;
  const safeMessage = typeof message === 'string' ? message : '';

  // Attach goals/memory for goal/project modes, OR when user explicitly asks about their info
  const needsMemory = mode === MODE.GOAL || mode === MODE.PROJECT || isMemoryQuery;

  return {
    userGoals: needsMemory && Array.isArray(goals) && goals.length > 0 ? goals : null,
    userMemory: needsMemory ? memory : null,
    currentMessage: safeMessage,
    conversationMode: safeMode,
    isMemoryQuery: isMemoryQuery === true,
  };
}

/**
 * Format ranked memories into a structured, readable block with usage instructions.
 */
function _formatMemoryBlock(memories) {
  if (!memories || (Array.isArray(memories) && memories.length === 0)) return null;
  if (typeof memories === 'string') return memories;

  // Handle single memory from direct key lookup
  if (!Array.isArray(memories) && memories.memory) {
    return _formatSingleMemory(memories.memory);
  }

  // Handle array of ranked memories
  if (Array.isArray(memories)) {
    if (memories.length === 1 && memories[0].memory) {
      return _formatSingleMemory(memories[0].memory);
    }

    const blocks = [];
    const grouped = {};

    for (const item of memories) {
      const mem = item.memory || item;
      const type = mem.type || 'unknown';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(mem);
    }

    for (const [type, items] of Object.entries(grouped)) {
      switch (type) {
        case 'user_profile': {
          const vals = items.map((m) => m.value || {});
          const merged = Object.assign({}, ...vals);
          const parts = [];
          if (merged.name) parts.push(`Name: ${merged.name}`);
          if (merged.role) parts.push(`Role: ${merged.role}`);
          if (merged.location) parts.push(`Location: ${merged.location}`);
          if (merged.company) parts.push(`Company: ${merged.company}`);
          if (parts.length) blocks.push(parts.join('\n'));
          break;
        }
        case 'preference': {
          const likes = items.filter((m) => m.value?.type === 'like').map((m) => m.value?.subject);
          const dislikes = items.filter((m) => m.value?.type === 'dislike').map((m) => m.value?.subject);
          if (likes.length) blocks.push(`Likes: ${likes.join(', ')}`);
          if (dislikes.length) blocks.push(`Dislikes: ${dislikes.join(', ')}`);
          break;
        }
        case 'goal': {
          const titles = items.map((m) => m.value?.title || m.value?.description || m.key).filter(Boolean);
          if (titles.length) blocks.push(`Goals: ${titles.join(', ')}`);
          break;
        }
        case 'skill': {
          const names = items.map((m) => m.value?.name || m.key).filter(Boolean);
          if (names.length) blocks.push(`Skills: ${names.join(', ')}`);
          break;
        }
        case 'learning_progress': {
          const names = items.map((m) => m.value?.name || m.key).filter(Boolean);
          if (names.length) blocks.push(`Learning: ${names.join(', ')}`);
          break;
        }
        case 'project': {
          const names = items.map((m) => m.value?.name || m.key).filter(Boolean);
          if (names.length) blocks.push(`Projects: ${names.join(', ')}`);
          break;
        }
        case 'fact': {
          const facts = items.map((m) => {
            if (typeof m.value === 'string') return m.value;
            return m.value?.description || m.key;
          }).filter(Boolean);
          if (facts.length) blocks.push(`Facts: ${facts.join(', ')}`);
          break;
        }
        case 'conversation_insight': {
          const insights = items.slice(0, 3).map((m) => {
            if (typeof m.value === 'string') return m.value;
            return m.value?.description || m.key;
          }).filter(Boolean);
          if (insights.length) blocks.push(`Insights: ${insights.join(', ')}`);
          break;
        }
        default: {
          const vals = items.map((m) => {
            if (typeof m.value === 'string') return m.value;
            return m.value?.name || m.value?.description || m.key;
          }).filter(Boolean);
          if (vals.length) blocks.push(`${type}: ${vals.join(', ')}`);
        }
      }
    }

    if (blocks.length === 0) return null;
    return blocks.join('\n');
  }

  return typeof memories === 'object' ? JSON.stringify(memories, null, 2) : String(memories);
}

function _formatSingleMemory(memory) {
  const val = memory.value || {};
  const type = memory.type || '';

  switch (type) {
    case 'user_profile': {
      const parts = [];
      if (val.name) parts.push(`Name: ${val.name}`);
      if (val.role) parts.push(`Role: ${val.role}`);
      if (val.location) parts.push(`Location: ${val.location}`);
      if (val.company) parts.push(`Company: ${val.company}`);
      return parts.length ? parts.join(', ') : null;
    }
    case 'preference':
      return val.subject ? `${val.type}: ${val.subject}` : null;
    case 'goal':
      return val.title || val.description || null;
    case 'skill':
    case 'learning_progress':
      return val.name || null;
    case 'project':
      return val.name || null;
    case 'fact':
      return typeof val === 'string' ? val : (val.description || null);
    default:
      return typeof val === 'string' ? val : (val.name || val.description || null);
  }
}

/**
 * Serialize the context object into a prompt-ready string.
 *
 * Behavior depends on the context fields:
 * - Non-memory modes (no goals, no memory, not a memory query):
 *     Returns ONLY the raw user message.
 * - Memory query mode (isMemoryQuery=true):
 *     Returns structured memory block with usage instructions.
 * - Full pipeline modes (goal/project with goals+memory):
 *     Returns structured block with mode header, goals, memory, and message.
 *
 * @param {{ userGoals: Array|null, userMemory: object|string|null, currentMessage: string, conversationMode: string, isMemoryQuery: boolean }} context
 * @returns {string}
 */
function serializeContext(context) {
  if (!context) return '';

  const mode = context.conversationMode || MODE.GENERAL;

  // ── No memory information at all: return just the message ──
  if (!context.userGoals && !context.userMemory && !context.isMemoryQuery) {
    return context.currentMessage || '';
  }

  // ── Memory query mode: memory + usage instruction + message ──
  if (context.isMemoryQuery && context.userMemory) {
    const memoryBlock = _formatMemoryBlock(context.userMemory);
    if (!memoryBlock) {
      return context.currentMessage || '';
    }

    const parts = [];
    parts.push(`## Stored User Information\n${memoryBlock}`);
    parts.push(`\n## Instruction\nOnly reference the above information if it is directly relevant to answering the user's question. Do not mention that you are "checking your records" or "looking up information" — simply answer naturally.`);
    parts.push(`\n## User Message\n${context.currentMessage || ''}`);
    return parts.join('\n');
  }

  // ── Full memory modes (goal/project): structured context block ──
  const parts = [];

  parts.push(`[Mode: ${mode.toUpperCase()}]`);

  if (context.userGoals && context.userGoals.length > 0) {
    const activeGoals = context.userGoals.filter((g) => g.status === 'active');
    if (activeGoals.length > 0) {
      const goalLines = activeGoals.map((g, i) => {
        return `  ${i + 1}. ${g.title || `Goal #${i + 1}`}`;
      });
      parts.push(`\n## Active Goals\n${goalLines.join('\n')}`);
    }
  }

  if (context.userMemory) {
    const memoryBlock = _formatMemoryBlock(context.userMemory);
    if (memoryBlock) {
      parts.push(`\n## User Context\n${memoryBlock}`);
    }
  }

  parts.push(`\n## User Message\n${context.currentMessage || ''}`);

  return parts.join('\n');
}

module.exports = {
  buildContext,
  serializeContext,
};
