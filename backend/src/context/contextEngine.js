const MemoryManager = require('../memory/manager/memoryManager');
const ProjectIntelligence = require('../services/projectIntelligence');

class ContextEngine {
  async build(userId, sessionData = {}) {
    const context = {
      user: null,
      session: null,
      memory: null,
      project: null,
      combined: null,
    };

    const [memoryContext, activeProjects] = await Promise.all([
      MemoryManager.getContextForUser(userId),
      ProjectIntelligence.getActiveProjectsContext(userId),
    ]);

    context.memory = memoryContext;
    context.project = activeProjects;

    if (sessionData.chat) {
      context.session = {
        chatId: sessionData.chat._id,
        chatTitle: sessionData.chat.title,
        messageCount: sessionData.history ? sessionData.history.length : 0,
        recentMessages: sessionData.history
          ? sessionData.history.slice(-3).map((m) => ({
              role: m.role,
              content: m.content.substring(0, 200),
            }))
          : [],
      };
    }

    context.combined = this._mergeContexts(context);
    return context;
  }

  _mergeContexts(context) {
    const parts = [];

    if (context.memory) {
      parts.push(`## User Memory\n${context.memory}`);
    }

    if (context.project) {
      parts.push(`## Active Projects\n${context.project}`);
    }

    if (context.session && context.session.recentMessages?.length) {
      const recent = context.session.recentMessages
        .map((m) => `[${m.role}] ${m.content}`)
        .join('\n');
      parts.push(`## Recent Messages\n${recent}`);
    }

    return parts.length ? parts.join('\n\n') : null;
  }
}

module.exports = new ContextEngine();
