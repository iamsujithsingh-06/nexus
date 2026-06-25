/**
 * ContextBuilder — merges all retrieved context into a single optimized string.
 *
 * Takes output from all retrievers + intent classifier and produces a
 * compact, relevant context string that gets injected before the user message.
 * Maximum output: ~1500 tokens to keep LLM costs low.
 */

function buildContext(intent, memories, goals, tasks, learning, projects, conversations, userProfile, coach) {
  const parts = [];

  // 1. Intent header (always included)
  parts.push(`[Intent: ${intent.intent}${intent.subIntent ? ` → ${intent.subIntent}` : ''} | confidence: ${(intent.confidence * 100).toFixed(0)}%]`);

  // 2. User profile (if available)
  if (userProfile) {
    const profile = [];
    if (userProfile.name) profile.push(`Name: ${userProfile.name}`);
    if (userProfile.communicationStyle) profile.push(`Style: ${userProfile.communicationStyle}`);
    if (userProfile.experienceLevel) profile.push(`Level: ${userProfile.experienceLevel}`);
    if (profile.length > 0) parts.push(`[User: ${profile.join(' | ')}]`);
  }

  // 3. Active goals (top 3)
  if (goals && goals.length > 0) {
    const goalLines = goals.map(g => {
      const ms = g.milestones && g.milestones.length > 0
        ? g.milestones.filter(m => m.status !== 'completed').slice(0, 2).map(m => `${m.title} (${m.status})`).join(', ')
        : '';
      return `• ${g.title} [${g.progress || 0}%] ${ms ? `— next: ${ms}` : ''}`;
    });
    parts.push('[Goals]\n' + goalLines.join('\n'));
  }

  // 4. Pending tasks + daily plan
  const taskParts = [];
  if (tasks && tasks.tasks && Array.isArray(tasks.tasks)) {
    if (tasks.tasks.length > 0) {
      const taskLines = tasks.tasks.slice(0, 5).map(t =>
        `• ${t.title}${t.isDueToday ? ' ⚡today' : t.isOverdue ? ' ⏰overdue' : ''}${t.dueDate ? ` (due: ${new Date(t.dueDate).toLocaleDateString()})` : ''} [${t.priority}]`
      );
      taskParts.push(taskLines.join('\n'));
    }
    if (tasks.overdueCount > 0) taskParts.push(`Overdue: ${tasks.overdueCount}`);
    if (tasks.completedToday > 0) taskParts.push(`Completed today: ${tasks.completedToday}`);
    if (tasks.hasDailyPlan && tasks.todayTasks && tasks.todayTasks.length > 0) {
      const planLines = tasks.todayTasks.map(t => `• ${t.title}`);
      taskParts.push('[Today\'s Plan]\n' + planLines.join('\n'));
    }
  } else if (Array.isArray(tasks) && tasks.length > 0) {
    const taskLines = tasks.map(t =>
      `• ${t.title}${t.dueDate ? ` (due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}${t.isDueToday ? ' ⚡today' : ''}`
    );
    taskParts.push(taskLines.join('\n'));
  }
  if (taskParts.length > 0) parts.push('[Tasks]\n' + taskParts.join('\n'));

  // 5. Learning progress
  if (learning && learning.hasLearningContext) {
    const learnParts = [];
    if (learning.currentTopic) {
      learnParts.push(`Current: ${learning.currentTopic.title}${learning.currentTopic.pathTitle ? ` (${learning.currentTopic.pathTitle})` : ''}${learning.currentTopic.confidence ? ` confidence:${learning.currentTopic.confidence}%` : ''}`);
    }
    if (learning.lastCompletedTopic) learnParts.push(`Last completed: ${learning.lastCompletedTopic}`);
    if (learning.paths && learning.paths.length > 0) {
      const pathSummary = learning.paths.map(p => `${p.title} [${p.progress || 0}%]`).join(', ');
      learnParts.push(`Active: ${pathSummary}`);
    }
    if (learning.dueRevisions > 0) learnParts.push(`${learning.dueRevisions} revision(s) due`);
    if (learning.pathTopics) {
      for (const pt of learning.pathTopics.slice(0, 2)) {
        const pending = pt.topics.filter(t => t.status === 'pending').slice(0, 3).map(t => t.title);
        if (pending.length > 0) learnParts.push(`Next in ${pt.pathTitle}: ${pending.join(', ')}`);
      }
    }
    parts.push('[Learning: ' + learnParts.join(' | ') + ']');
  }

  // 6. Active projects (with sprint/feature/bug context)
  if (projects) {
    const ProjectRetrieverV2 = require('./ProjectRetrieverV2');
    const projContext = ProjectRetrieverV2.formatProjectsContext(projects);
    if (projContext) parts.push(projContext.trimEnd());
    else if (Array.isArray(projects) && projects.length > 0) {
      const projLines = projects.map(p => `• ${p.title || p.name}${p.status ? ` [${p.status}]` : ''}${p.progress !== undefined ? ` ${p.progress}%` : ''}`);
      parts.push('[Projects]\n' + projLines.join('\n'));
    }
  }

  // 7. Relevant memories (top 5)
  if (memories && memories.length > 0) {
    const memoryLines = memories.map(m => {
      const content = m.content || m.text || m.description || '';
      const type = m.type || m.category || '';
      return `• ${type ? `[${type}] ` : ''}${content.length > 120 ? content.substring(0, 120) + '…' : content}`;
    });
    parts.push('[Relevant memories]\n' + memoryLines.join('\n'));
  }

  // 8. Coach context (daily brief, productivity, motivation)
  if (coach) {
    const CoachRetriever = require('./CoachRetriever');
    const coachCtx = CoachRetriever.formatCoachContext(coach);
    if (coachCtx) parts.push(coachCtx.trimEnd());
  }

  // 9. Recent conversation context (last 2 exchanges)
  if (conversations && conversations.length > 0) {
    const recent = conversations.slice(-2);
    const convLines = recent.map(c => `${c.role}: ${c.content.length > 100 ? c.content.substring(0, 100) + '…' : c.content}`);
    parts.push('[Recent]\n' + convLines.join('\n'));
  }

  return parts.join('\n\n');
}

function serialize(contextString, userMessage) {
  if (!contextString || contextString.trim().length === 0) return userMessage;
  return `${contextString}\n\nUser: ${userMessage}`;
}

module.exports = { buildContext, serialize };
