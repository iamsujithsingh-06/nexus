const Goal = require('../models/Goal');
const Milestone = require('../models/Milestone');
const GoalTask = require('../models/GoalTask');
const Achievement = require('../models/Achievement');
const Activity = require('../models/Activity');
const WeeklyReport = require('../models/WeeklyReport');
const Streak = require('../models/Streak');
const goalService = require('../services/goalService');

// ── Goals ──

exports.list = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    const milestones = await Milestone.find({ goalId: goal._id }).sort({ order: 1 });
    const tasks = await GoalTask.find({ goalId: goal._id }).sort({ order: 1 });
    res.json({ success: true, goal, milestones, tasks });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, category, priority, generatePlan } = req.body;
    const reqId = req._reqId || 'no-id';
    console.log(`[GOAL_CREATE:${reqId}] Request body:`, JSON.stringify({ title, description, category, priority, generatePlan }));
    console.log(`[GOAL_CREATE:${reqId}] User ID:`, req.user?._id);

    if (!title || !title.trim()) {
      console.warn(`[GOAL_CREATE:${reqId}] Validation failed: title is empty`);
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    // Normalize category: accept capitalized or lowercase
    const normalizedCategory = category
      ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
      : 'General';
    // Map frontend category names to backend enum values
    const categoryMap = {
      'Career': 'career', 'Health': 'fitness', 'Learning': 'learning',
      'Personal': 'general', 'General': 'general',
      'Coding': 'coding', 'Business': 'business', 'Creative': 'creative',
    };
    const mappedCategory = categoryMap[normalizedCategory] || normalizedCategory.toLowerCase();

    // Normalize priority: string → number
    const priorityMap = { 'highest': 5, 'high': 4, 'medium': 3, 'low': 2, 'lowest': 1 };
    let normalizedPriority = priority;
    if (typeof priority === 'string') {
      normalizedPriority = priorityMap[priority.toLowerCase()] || 3;
    } else if (typeof priority !== 'number' || priority < 1 || priority > 5) {
      normalizedPriority = 3;
    }

    console.log(`[GOAL_CREATE:${reqId}] Normalized: title="${title.trim()}" category="${mappedCategory}" priority=${normalizedPriority} generatePlan=${generatePlan}`);

    if (generatePlan) {
      const result = await goalService.generateFullPlan(req.user._id, title.trim(), mappedCategory);
      await goalService.trackActivity(req.user._id, { goalsUpdated: 1 });
      await goalService._checkAchievements(req.user._id);
      console.log(`[GOAL_CREATE:${reqId}] AI plan created: goal=${result.goal?._id} milestones=${result.milestones?.length} tasks=${result.tasks?.length}`);
      return res.status(201).json({ success: true, ...result });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title: title.trim(),
      description: description || '',
      category: mappedCategory,
      priority: normalizedPriority,
    });
    console.log(`[GOAL_CREATE:${reqId}] Goal created: _id=${goal._id} title="${goal.title}" category=${goal.category} priority=${goal.priority}`);
    await goalService.trackActivity(req.user._id, { goalsUpdated: 1 });
    await goalService._checkAchievements(req.user._id);
    res.status(201).json({ success: true, goal });
  } catch (error) {
    console.error(`[GOAL_CREATE_ERROR] ${error.message}`, error.stack);
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, description, category, priority, status } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category) goal.category = category;
    if (priority) goal.priority = priority;
    if (status) {
      if (status === 'paused' && goal.status === 'active') goal.pausedAt = new Date();
      if (status === 'active' && goal.status === 'paused') goal.pausedAt = null;
      if (status === 'completed' && goal.status !== 'completed') {
        goal.completedAt = new Date();
        goal.progress = 100;
      }
      goal.status = status;
    }
    await goal.save();
    await goalService.trackActivity(req.user._id, { goalsUpdated: 1 });
    res.json({ success: true, goal });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    await Milestone.deleteMany({ goalId: goal._id });
    await GoalTask.deleteMany({ goalId: goal._id });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) { next(error); }
};

// ── Roadmap ──

exports.addPhase = async (req, res, next) => {
  try {
    const { phase } = req.body;
    if (!phase || !phase.trim()) return res.status(400).json({ success: false, error: 'Phase name required' });
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    const maxOrder = goal.roadmap.length ? Math.max(...goal.roadmap.map(r => r.order)) : 0;
    goal.roadmap.push({ phase: phase.trim(), order: maxOrder + 1 });
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) { next(error); }
};

exports.removePhase = async (req, res, next) => {
  try {
    const { phaseId } = req.params;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    goal.roadmap.pull({ _id: phaseId });
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) { next(error); }
};

exports.renamePhase = async (req, res, next) => {
  try {
    const { phaseId, phase } = req.body;
    if (!phase || !phase.trim()) return res.status(400).json({ success: false, error: 'Phase name required' });
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    const rd = goal.roadmap.id(phaseId);
    if (!rd) return res.status(404).json({ success: false, error: 'Phase not found' });
    rd.phase = phase.trim();
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) { next(error); }
};

// ── Milestones ──

exports.listMilestones = async (req, res, next) => {
  try {
    const milestones = await Milestone.find({ goalId: req.params.id, userId: req.user._id }).sort({ order: 1 });
    res.json({ success: true, milestones });
  } catch (error) { next(error); }
};

exports.createMilestone = async (req, res, next) => {
  try {
    const { title, phase } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Title required' });
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    const existing = await Milestone.find({ goalId: goal._id });
    const milestone = await Milestone.create({
      userId: req.user._id,
      goalId: goal._id,
      title: title.trim(),
      phase: phase || '',
      order: existing.length,
    });
    res.status(201).json({ success: true, milestone });
  } catch (error) { next(error); }
};

exports.toggleMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findOne({ _id: req.params.milestoneId, userId: req.user._id });
    if (!milestone) return res.status(404).json({ success: false, error: 'Milestone not found' });

    milestone.status = milestone.status === 'completed' ? 'pending' : 'completed';
    milestone.completedAt = milestone.status === 'completed' ? new Date() : null;
    milestone.progress = milestone.status === 'completed' ? 100 : 0;
    await milestone.save();

    await goalService.recalculateProgress(milestone.goalId);
    if (milestone.status === 'completed') {
      await goalService.trackActivity(req.user._id, { milestonesReached: 1 });
    }

    res.json({ success: true, milestone });
  } catch (error) { next(error); }
};

exports.editMilestone = async (req, res, next) => {
  try {
    const { title, phase } = req.body;
    const milestone = await Milestone.findOne({ _id: req.params.milestoneId, userId: req.user._id });
    if (!milestone) return res.status(404).json({ success: false, error: 'Milestone not found' });
    if (title) milestone.title = title;
    if (phase !== undefined) milestone.phase = phase;
    await milestone.save();
    res.json({ success: true, milestone });
  } catch (error) { next(error); }
};

exports.deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findOneAndDelete({ _id: req.params.milestoneId, userId: req.user._id });
    if (!milestone) return res.status(404).json({ success: false, error: 'Milestone not found' });
    await GoalTask.deleteMany({ milestoneId: milestone._id });
    await goalService.recalculateProgress(milestone.goalId);
    res.json({ success: true, message: 'Milestone deleted' });
  } catch (error) { next(error); }
};

// ── Tasks ──

exports.listTasks = async (req, res, next) => {
  try {
    const { status, category, priority, goalId, milestoneId, today, week } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (goalId) filter.goalId = goalId;
    if (milestoneId) filter.milestoneId = milestoneId;

    const now = new Date();
    if (today === 'true') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start.getTime() + 86400000);
      filter.dueDate = { $gte: start, $lt: end };
    }
    if (week === 'true') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start.getTime() + 7 * 86400000);
      filter.dueDate = { $gte: start, $lt: end };
    }

    const tasks = await GoalTask.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) { next(error); }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, category, dueDate, goalId, milestoneId } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Title required' });

    const task = await GoalTask.create({
      userId: req.user._id,
      goalId: goalId || null,
      milestoneId: milestoneId || null,
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      category: category || 'general',
      dueDate: dueDate ? new Date(dueDate) : null,
    });
    await goalService.trackActivity(req.user._id, { tasksCreated: 1 });
    res.status(201).json({ success: true, task });
  } catch (error) { next(error); }
};

exports.toggleTask = async (req, res, next) => {
  try {
    const task = await GoalTask.findOne({ _id: req.params.taskId, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    task.completedAt = task.status === 'completed' ? new Date() : null;
    await task.save();

    if (task.status === 'completed') {
      await goalService.trackActivity(req.user._id, { tasksCompleted: 1 });
      await goalService.updateStreak(req.user._id, task.category);
    }
    if (task.goalId) await goalService.recalculateProgress(task.goalId);
    await goalService._checkAchievements(req.user._id);

    res.json({ success: true, task });
  } catch (error) { next(error); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, category, dueDate, status, goalId, milestoneId } = req.body;
    const task = await GoalTask.findOne({ _id: req.params.taskId, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (category) task.category = category;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (status) task.status = status;
    if (goalId !== undefined) task.goalId = goalId;
    if (milestoneId !== undefined) task.milestoneId = milestoneId;
    await task.save();
    res.json({ success: true, task });
  } catch (error) { next(error); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await GoalTask.findOneAndDelete({ _id: req.params.taskId, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.goalId) goalService.recalculateProgress(task.goalId);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) { next(error); }
};

// ── Dashboard ──

exports.dashboard = async (req, res, next) => {
  try {
    const data = await goalService.getDashboard(req.user._id);
    res.json({ success: true, ...data });
  } catch (error) { next(error); }
};

// ── AI Coach ──

exports.coachInsights = async (req, res, next) => {
  try {
    const insights = await goalService.generateCoachInsights(req.user._id);
    res.json({ success: true, insights });
  } catch (error) { next(error); }
};

// ── Achievements ──

exports.listAchievements = async (req, res, next) => {
  try {
    const achievements = await goalService.getUserAchievements(req.user._id);
    res.json({ success: true, achievements });
  } catch (error) { next(error); }
};

// ── Activity ──

exports.listActivity = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(parseInt(limit) || 30);
    res.json({ success: true, activities });
  } catch (error) { next(error); }
};

// ── Weekly Report ──

exports.getWeeklyReport = async (req, res, next) => {
  try {
    const report = await goalService.generateWeeklyReport(req.user._id);
    res.json({ success: true, report });
  } catch (error) { next(error); }
};

exports.listWeeklyReports = async (req, res, next) => {
  try {
    const reports = await WeeklyReport.find({ userId: req.user._id }).sort({ weekStart: -1 }).limit(12);
    res.json({ success: true, reports });
  } catch (error) { next(error); }
};

// ── Streaks ──

exports.listStreaks = async (req, res, next) => {
  try {
    const streaks = await Streak.find({ userId: req.user._id });
    res.json({ success: true, streaks });
  } catch (error) { next(error); }
};
