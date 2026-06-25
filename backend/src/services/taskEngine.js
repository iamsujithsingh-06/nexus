const aiService = require('./aiService');

const GENERATION_PROMPT = `You are a task planning AI. Given a goal or learning path, generate actionable tasks.

Input: { "type": "goal|learning", "title": "...", "description": "...", "category": "...", "difficulty?": "..." }

Output a JSON array (NO markdown, NO code fences, pure JSON):
[
  {
    "title": "...",
    "description": "...",
    "priority": "low|medium|high|critical",
    "category": "coding|learning|project|career|general",
    "estimatedTime": <number in minutes>,
    "suggestedOrder": <number>
  }
]

Generate 4-8 tasks that are specific, actionable, and progressively build toward the goal. First tasks should be foundational, later tasks should be advanced.`;

const DAILY_PLAN_PROMPT = `You are a daily planning AI. Given pending tasks and user context, create an optimized daily plan.

Input: {
  "pendingTasks": [{ "title": "...", "priority": "...", "estimatedTime": ..., "dueDate?": "...", "category": "...", "goalTitle?": "..." }],
  "completedToday": <number>,
  "availableHours": <number>,
  "goals": ["..."],
  "learningContext": "..."
}

Output a JSON object (NO markdown, NO code fences, pure JSON):
{
  "plan": [
    { "taskTitle": "...", "suggestedOrder": 1, "estimatedMinutes": ..., "reason": "..." }
  ],
  "totalEstimatedMinutes": <number>,
  "focusArea": "...",
  "tip": "..."
}

Pick the 3-5 most important tasks. Order by priority and deadlines. Consider the user's goals. Be realistic about time.`;

async function generateTasksForGoal(goalTitle, goalDescription, category) {
  const prompt = GENERATION_PROMPT + `\n\nInput: ${JSON.stringify({
    type: 'goal',
    title: goalTitle,
    description: goalDescription || '',
    category: category || 'general',
  })}`;
  try {
    const response = await aiService.generateAIResponse(prompt, [], null, 'task-gen');
    const tasks = JSON.parse(response.replace(/```json|```/g, '').trim());
    return Array.isArray(tasks) ? tasks : [];
  } catch (err) {
    console.error('[TaskEngine] Generation failed:', err.message);
    return generateFallbackTasks(goalTitle, category);
  }
}

async function generateTasksForLearning(pathTitle, pathDescription, difficulty) {
  const prompt = GENERATION_PROMPT + `\n\nInput: ${JSON.stringify({
    type: 'learning',
    title: pathTitle,
    description: pathDescription || '',
    category: 'learning',
    difficulty: difficulty || 'beginner',
  })}`;
  try {
    const response = await aiService.generateAIResponse(prompt, [], null, 'task-gen-learning');
    const tasks = JSON.parse(response.replace(/```json|```/g, '').trim());
    return Array.isArray(tasks) ? tasks : [];
  } catch (err) {
    console.error('[TaskEngine] Learning task generation failed:', err.message);
    return generateFallbackTasks(pathTitle, 'learning');
  }
}

async function generateDailyPlan(pendingTasks, completedToday, availableHours, goals, learningContext) {
  const prompt = DAILY_PLAN_PROMPT + `\n\nInput: ${JSON.stringify({
    pendingTasks: pendingTasks.slice(0, 15).map(t => ({
      title: t.title,
      priority: t.priority,
      estimatedTime: t.estimatedTime || 30,
      dueDate: t.dueDate,
      category: t.category,
      goalTitle: t.goalTitle || '',
    })),
    completedToday,
    availableHours: availableHours || 4,
    goals: goals || [],
    learningContext: learningContext || '',
  })}`;
  try {
    const response = await aiService.generateAIResponse(prompt, [], null, 'daily-plan');
    const plan = JSON.parse(response.replace(/```json|```/g, '').trim());
    return plan;
  } catch (err) {
    console.error('[TaskEngine] Daily plan generation failed:', err.message);
    return generateFallbackPlan(pendingTasks);
  }
}

function generateFallbackTasks(title, category) {
  const defaults = [
    { title: `Research ${title}`, description: 'Gather initial information and resources', priority: 'medium', category: category || 'general', estimatedTime: 30, suggestedOrder: 1 },
    { title: `Plan ${title} strategy`, description: 'Create a roadmap for achieving this', priority: 'high', category: category || 'general', estimatedTime: 20, suggestedOrder: 2 },
    { title: `Start ${title}`, description: 'Begin working on the first milestone', priority: 'high', category: category || 'general', estimatedTime: 60, suggestedOrder: 3 },
    { title: `Review progress on ${title}`, description: 'Check what has been accomplished', priority: 'medium', category: category || 'general', estimatedTime: 15, suggestedOrder: 4 },
  ];
  return defaults;
}

function generateFallbackPlan(pendingTasks) {
  const sorted = [...pendingTasks]
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const p = { critical: 0, high: 1, medium: 2, low: 3 };
      return (p[a.priority] || 2) - (p[b.priority] || 2);
    });

  const plan = sorted.slice(0, 5).map((t, i) => ({
    taskTitle: t.title,
    suggestedOrder: i + 1,
    estimatedMinutes: t.estimatedTime || 30,
    reason: i === 0 ? 'Highest priority task' : 'Continue progress',
  }));

  return {
    plan,
    totalEstimatedMinutes: plan.reduce((s, t) => s + t.estimatedMinutes, 0),
    focusArea: sorted[0]?.category || 'general',
    tip: 'Focus on completing one task at a time.',
  };
}

module.exports = { generateTasksForGoal, generateTasksForLearning, generateDailyPlan };
