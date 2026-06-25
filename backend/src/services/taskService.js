const GoalTask = require('../models/GoalTask');
const taskEngine = require('./taskEngine');

// ── CRUD ──

async function create(data) {
  const maxOrder = await GoalTask.findOne({ userId: data.userId })
    .sort({ order: -1 })
    .select('order')
    .lean();
  const task = await GoalTask.create({
    ...data,
    order: (maxOrder?.order || 0) + 1,
  });
  return task;
}

async function list(userId, filters = {}) {
  const query = { userId };
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.category) query.category = filters.category;
  if (filters.goalId) query.goalId = filters.goalId;
  if (filters.learningPathId) query.learningPathId = filters.learningPathId;
  if (filters.isToday === 'true') query.isToday = true;
  if (filters.dueBefore) query.dueDate = { ...query.dueDate, $lte: new Date(filters.dueBefore) };
  if (filters.dueAfter) query.dueDate = { ...query.dueDate, $gte: new Date(filters.dueAfter) };
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const sort = {};
  if (filters.sort === 'priority') sort.priority = -1;
  else if (filters.sort === 'dueDate') sort.dueDate = 1;
  else if (filters.sort === 'estimatedTime') sort.estimatedTime = -1;
  else sort.suggestedOrder = 1;

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    GoalTask.find(query).sort(sort).skip(skip).limit(limit).lean(),
    GoalTask.countDocuments(query),
  ]);

  return { tasks, total, page, pages: Math.ceil(total / limit) };
}

async function getById(taskId, userId) {
  return GoalTask.findOne({ _id: taskId, userId }).lean();
}

async function update(taskId, userId, data) {
  const updateData = { ...data };
  if (data.status === 'completed' && !data.completedAt) {
    updateData.completedAt = new Date();
  }
  if (data.status && data.status !== 'completed') {
    updateData.completedAt = null;
  }
  const task = await GoalTask.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
  return task;
}

async function remove(taskId, userId) {
  await GoalTask.deleteOne({ _id: taskId, userId });
  return true;
}

async function toggle(taskId, userId) {
  const task = await GoalTask.findOne({ _id: taskId, userId });
  if (!task) return null;
  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  return update(taskId, userId, {
    status: newStatus,
    completedAt: newStatus === 'completed' ? new Date() : null,
  });
}

// ── Dashboard / Stats ──

async function getDashboard(userId) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  const [
    total,
    completed,
    pending,
    inProgress,
    overdue,
    todayTasks,
    completedToday,
  ] = await Promise.all([
    GoalTask.countDocuments({ userId }),
    GoalTask.countDocuments({ userId, status: 'completed' }),
    GoalTask.countDocuments({ userId, status: 'pending' }),
    GoalTask.countDocuments({ userId, status: 'in_progress' }),
    GoalTask.countDocuments({ userId, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
    GoalTask.find({ userId, dueDate: { $gte: startOfDay, $lt: endOfDay } })
      .sort({ priority: -1, suggestedOrder: 1 })
      .limit(10)
      .lean(),
    GoalTask.countDocuments({ userId, status: 'completed', completedAt: { $gte: startOfDay } }),
  ]);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const currentFocus = await GoalTask.findOne({ userId, status: 'in_progress' })
    .sort({ updatedAt: -1 })
    .select('title category priority')
    .lean();

  return {
    total, completed, pending, inProgress,
    overdue, completionRate, completedToday,
    todayTasks,
    currentFocus: currentFocus ? {
      title: currentFocus.title,
      category: currentFocus.category,
      priority: currentFocus.priority,
    } : null,
  };
}

async function getStats(userId) {
  const dashboard = await getDashboard(userId);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [weeklyCompleted, categoryBreakdown, priorityBreakdown] = await Promise.all([
    GoalTask.countDocuments({ userId, status: 'completed', completedAt: { $gte: startOfWeek } }),
    GoalTask.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) } },
      { $group: { _id: '$category', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
    ]),
    GoalTask.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    ...dashboard,
    weeklyCompleted,
    categoryBreakdown,
    priorityBreakdown,
  };
}

// ── Smart Planning ──

async function getDailyPlan(userId) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  const [pendingTasks, completedToday, goals] = await Promise.all([
    GoalTask.find({
      userId,
      status: { $ne: 'completed' },
    }).sort({ priority: -1, dueDate: 1 }).limit(20).lean(),
    GoalTask.countDocuments({ userId, status: 'completed', completedAt: { $gte: startOfDay } }),
    require('./goalService').getAllGoals?.(userId) || [],
  ]);

  const goalTitles = (goals.goals || goals || []).slice(0, 5).map(g => g.title);

  const plan = await taskEngine.generateDailyPlan(
    pendingTasks,
    completedToday,
    4,
    goalTitles,
    ''
  );

  if (plan.plan) {
    for (const item of plan.plan) {
      await GoalTask.updateOne(
        { userId, title: item.taskTitle },
        { $set: { isToday: true, suggestedOrder: item.suggestedOrder } }
      );
    }
  }

  return plan;
}

// ── AI Task Generation ──

async function generateFromGoal(goalId, userId) {
  const Goal = require('../models/Goal');
  const goal = await Goal.findOne({ _id: goalId, userId }).lean();
  if (!goal) throw new Error('Goal not found');

  const tasks = await taskEngine.generateTasksForGoal(goal.title, goal.description, goal.category);
  const created = [];
  for (const t of tasks) {
    const task = await GoalTask.create({
      userId,
      goalId: goal._id,
      title: t.title,
      description: t.description || '',
      priority: t.priority || 'medium',
      category: t.category || goal.category?.toLowerCase() || 'general',
      estimatedTime: t.estimatedTime || 30,
      suggestedOrder: t.suggestedOrder || 0,
    });
    created.push(task);
  }
  return created;
}

async function generateFromLearning(pathId, userId) {
  const LearningPath = require('../models/LearningPath');
  const path = await LearningPath.findOne({ _id: pathId, userId }).lean();
  if (!path) throw new Error('Learning path not found');

  const tasks = await taskEngine.generateTasksForLearning(path.title, path.description, path.difficulty);
  const created = [];
  for (const t of tasks) {
    const task = await GoalTask.create({
      userId,
      learningPathId: path._id,
      title: t.title,
      description: t.description || '',
      priority: t.priority || 'medium',
      category: 'learning',
      estimatedTime: t.estimatedTime || 30,
      suggestedOrder: t.suggestedOrder || 0,
    });
    created.push(task);
  }
  return created;
}

// ── Progress Integration ──

async function onTaskCompleted(task) {
  if (task.goalId) {
    try {
      const Goal = require('../models/Goal');
      const GoalService = require('./goalService');
      const goalTasks = await GoalTask.countDocuments({ goalId: task.goalId });
      const completedGoalTasks = await GoalTask.countDocuments({ goalId: task.goalId, status: 'completed' });
      const progress = goalTasks > 0 ? Math.round((completedGoalTasks / goalTasks) * 100) : 0;
      await Goal.updateOne({ _id: task.goalId }, { $set: { progress } });
    } catch { /* ignore */ }
  }

  if (task.learningPathId) {
    try {
      const LearningPath = require('../models/LearningPath');
      await LearningPath.updateOne({ _id: task.learningPathId }, { $inc: { actualHoursStudied: (task.actualTime || 0) / 60 } });
    } catch { /* ignore */ }
  }

  try {
    const Memory = require('../models/Memory');
    const existing = await Memory.findOne({ userId: task.userId, type: 'task_completed', key: `task:${task._id}` });
    if (!existing) {
      await Memory.create({
        userId: task.userId,
        type: 'task_completed',
        key: `task:${task._id}`,
        value: {
          title: task.title,
          category: task.category,
          priority: task.priority,
          completedAt: task.completedAt || new Date(),
        },
        tags: [task.category, 'completed', 'task'],
        importanceScore: task.priority === 'critical' ? 0.9 : task.priority === 'high' ? 0.7 : 0.4,
        lifecycleStatus: 'active',
      });
    }
  } catch { /* ignore */ }
}

module.exports = {
  create, list, getById, update, remove, toggle,
  getDashboard, getStats,
  getDailyPlan,
  generateFromGoal, generateFromLearning,
  onTaskCompleted,
};
