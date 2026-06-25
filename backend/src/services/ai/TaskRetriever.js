const GoalTask = require('../../models/GoalTask');
const CacheManager = require('./CacheManager');

const MAX_TASKS = 5;

async function retrieve(userId) {
  const start = Date.now();

  const cached = CacheManager.get(userId, 'tasks');
  if (cached) return { ...cached, elapsed: Date.now() - start, cached: true };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const now = new Date();

    const [pendingTasks, overdueTasks, todayTasks, completedToday, dailyPlanTasks] = await Promise.all([
      GoalTask.find({ userId, status: { $ne: 'completed' } })
        .sort({ priority: -1, dueDate: 1 })
        .limit(MAX_TASKS)
        .lean(),
      GoalTask.countDocuments({ userId, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
      GoalTask.find({ userId, isToday: true, status: { $ne: 'completed' } })
        .sort({ suggestedOrder: 1 })
        .limit(MAX_TASKS)
        .lean(),
      GoalTask.countDocuments({ userId, status: 'completed', completedAt: { $gte: today } }),
      GoalTask.find({ userId, isToday: true })
        .sort({ suggestedOrder: 1 })
        .limit(MAX_TASKS)
        .lean(),
    ]);

    const enriched = pendingTasks.map(t => ({
      _id: t._id,
      title: t.title,
      priority: t.priority,
      category: t.category,
      dueDate: t.dueDate,
      isDueToday: t.dueDate ? (t.dueDate >= today && t.dueDate < tomorrow) : false,
      isOverdue: t.dueDate ? t.dueDate < now : false,
      estimatedTime: t.estimatedTime,
      goalId: t.goalId,
      learningPathId: t.learningPathId,
    }));

    const result = {
      tasks: enriched,
      count: enriched.length,
      overdueCount: overdueTasks,
      todayTasks: todayTasks.map(t => ({ title: t.title, suggestedOrder: t.suggestedOrder, priority: t.priority })),
      completedToday,
      hasDailyPlan: dailyPlanTasks.length > 0,
    };

    CacheManager.set(userId, 'tasks', result);
    return { ...result, elapsed: Date.now() - start, cached: false };
  } catch (err) {
    return { tasks: [], count: 0, elapsed: Date.now() - start, error: err.message };
  }
}

module.exports = { retrieve };
