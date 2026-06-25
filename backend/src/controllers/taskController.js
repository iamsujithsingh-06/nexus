const taskService = require('../services/taskService');

exports.list = async (req, res, next) => {
  try {
    const result = await taskService.list(req.user._id, req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const task = await taskService.getById(req.params.taskId, req.user._id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, priority, category, dueDate, estimatedTime, goalId, learningPathId, milestoneId, projectId, tags, notes } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Title is required' });
    const task = await taskService.create({
      userId: req.user._id,
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      category: category || 'general',
      dueDate: dueDate || null,
      estimatedTime: estimatedTime || 0,
      goalId: goalId || null,
      learningPathId: learningPathId || null,
      milestoneId: milestoneId || null,
      projectId: projectId || null,
      tags: tags || [],
      notes: notes || '',
    });
    res.status(201).json({ success: true, task });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const task = await taskService.update(req.params.taskId, req.user._id, req.body);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.status === 'completed') {
      taskService.onTaskCompleted(task.toObject ? task.toObject() : task);
    }
    res.json({ success: true, task });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    await taskService.remove(req.params.taskId, req.user._id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) { next(error); }
};

exports.toggle = async (req, res, next) => {
  try {
    const task = await taskService.toggle(req.params.taskId, req.user._id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.status === 'completed') {
      const taskObj = task.toObject ? task.toObject() : task;
      taskService.onTaskCompleted(taskObj);
    }
    res.json({ success: true, task });
  } catch (error) { next(error); }
};

exports.dashboard = async (req, res, next) => {
  try {
    const data = await taskService.getDashboard(req.user._id);
    res.json({ success: true, ...data });
  } catch (error) { next(error); }
};

exports.stats = async (req, res, next) => {
  try {
    const stats = await taskService.getStats(req.user._id);
    res.json({ success: true, stats });
  } catch (error) { next(error); }
};

exports.dailyPlan = async (req, res, next) => {
  try {
    const plan = await taskService.getDailyPlan(req.user._id);
    res.json({ success: true, plan });
  } catch (error) { next(error); }
};

exports.generateFromGoal = async (req, res, next) => {
  try {
    const tasks = await taskService.generateFromGoal(req.params.goalId, req.user._id);
    res.status(201).json({ success: true, tasks, count: tasks.length });
  } catch (error) { next(error); }
};

exports.generateFromLearning = async (req, res, next) => {
  try {
    const tasks = await taskService.generateFromLearning(req.params.pathId, req.user._id);
    res.status(201).json({ success: true, tasks, count: tasks.length });
  } catch (error) { next(error); }
};
