const learningService = require('../services/learningService');

exports.list = async (req, res, next) => {
  try {
    const result = await learningService.list(req.user._id, req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const path = await learningService.getById(req.params.id, req.user._id);
    if (!path) return res.status(404).json({ success: false, error: 'Learning path not found' });
    res.json({ success: true, path });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, generatePlan, learningGoal, relatedGoalId } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Title is required' });
    const path = await learningService.create({
      userId: req.user._id,
      title: title.trim(),
      description: description || '',
      category: category || 'Custom',
      difficulty: difficulty || 'beginner',
      status: 'active',
      learningGoal: learningGoal || '',
      relatedGoalId: relatedGoalId || null,
      generatePlan: generatePlan !== false,
    });
    res.status(201).json({ success: true, path });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const path = await learningService.update(req.params.id, req.user._id, req.body);
    if (!path) return res.status(404).json({ success: false, error: 'Learning path not found' });
    res.json({ success: true, path });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    await learningService.remove(req.params.id, req.user._id);
    res.json({ success: true, message: 'Learning path deleted' });
  } catch (error) { next(error); }
};

exports.dashboard = async (req, res, next) => {
  try {
    const data = await learningService.getDashboardData(req.user._id);
    res.json({ success: true, ...data });
  } catch (error) { next(error); }
};

exports.stats = async (req, res, next) => {
  try {
    const stats = await learningService.getStats(req.user._id);
    res.json({ success: true, stats });
  } catch (error) { next(error); }
};

exports.search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ success: true, paths: [], topics: [] });
    const results = await learningService.search(req.user._id, q);
    res.json({ success: true, ...results });
  } catch (error) { next(error); }
};

// ── Topics ──

exports.listTopics = async (req, res, next) => {
  try {
    const path = await learningService.getById(req.params.id, req.user._id);
    if (!path) return res.status(404).json({ success: false, error: 'Learning path not found' });
    res.json({ success: true, topics: path.topics || [] });
  } catch (error) { next(error); }
};

exports.createTopic = async (req, res, next) => {
  try {
    const { title, description, difficulty } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Title is required' });
    const topic = await learningService.addTopic(req.params.id, req.user._id, {
      title: title.trim(),
      description: description || '',
      difficulty: difficulty || 'beginner',
    });
    res.status(201).json({ success: true, topic });
  } catch (error) { next(error); }
};

exports.updateTopic = async (req, res, next) => {
  try {
    const topic = await learningService.updateTopic(req.params.topicId, req.user._id, req.body);
    if (!topic) return res.status(404).json({ success: false, error: 'Topic not found' });
    res.json({ success: true, topic });
  } catch (error) { next(error); }
};

exports.removeTopic = async (req, res, next) => {
  try {
    const deleted = await learningService.removeTopic(req.params.topicId, req.user._id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Topic not found' });
    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) { next(error); }
};

// ── Practice Problems ──

exports.createProblem = async (req, res, next) => {
  try {
    const Problem = require('../models/PracticeProblem');
    const problem = await Problem.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, problem });
  } catch (error) { next(error); }
};

exports.listProblems = async (req, res, next) => {
  try {
    const Problem = require('../models/PracticeProblem');
    const filter = { userId: req.user._id };
    if (req.query.topicId) filter.topicId = req.query.topicId;
    if (req.query.pathId) filter.pathId = req.query.pathId;
    if (req.query.platform) filter.platform = req.query.platform;
    if (req.query.status) filter.status = req.query.status;
    const problems = await Problem.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, problems });
  } catch (error) { next(error); }
};

exports.updateProblem = async (req, res, next) => {
  try {
    const Problem = require('../models/PracticeProblem');
    const problem = await Problem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!problem) return res.status(404).json({ success: false, error: 'Problem not found' });
    res.json({ success: true, problem });
  } catch (error) { next(error); }
};

exports.removeProblem = async (req, res, next) => {
  try {
    const Problem = require('../models/PracticeProblem');
    const deleted = await Problem.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (!deleted.deletedCount) return res.status(404).json({ success: false, error: 'Problem not found' });
    res.json({ success: true, message: 'Problem deleted' });
  } catch (error) { next(error); }
};

// ── Revisions ──

exports.getDueRevisions = async (req, res, next) => {
  try {
    const revisions = await learningService.getDueRevisions(req.user._id);
    res.json({ success: true, revisions });
  } catch (error) { next(error); }
};

exports.completeRevision = async (req, res, next) => {
  try {
    const revision = await learningService.completeRevision(req.params.id, req.user._id);
    if (!revision) return res.status(404).json({ success: false, error: 'Revision not found' });
    res.json({ success: true, revision });
  } catch (error) { next(error); }
};

// ── Study Time ──

exports.recordStudyTime = async (req, res, next) => {
  try {
    const { hours } = req.body;
    if (!hours || hours <= 0) return res.status(400).json({ success: false, error: 'Valid hours required' });
    const path = await learningService.recordStudyTime(req.params.id, req.user._id, hours);
    if (!path) return res.status(404).json({ success: false, error: 'Learning path not found' });
    res.json({ success: true, path });
  } catch (error) { next(error); }
};

// ── Topics notes ──

exports.getTopicNotes = async (req, res, next) => {
  try {
    const LearningNote = require('../models/LearningNote');
    const notes = await LearningNote.find({ topicId: req.params.topicId, userId: req.user._id })
      .sort({ version: -1 }).lean();
    res.json({ success: true, notes });
  } catch (error) { next(error); }
};

exports.saveTopicNote = async (req, res, next) => {
  try {
    const LearningNote = require('../models/LearningNote');
    const { title, content, snippets, links, tags } = req.body;
    const note = await LearningNote.create({
      userId: req.user._id,
      topicId: req.params.topicId,
      pathId: req.query.pathId || null,
      title: title || 'Untitled Note',
      content: content || '',
      snippets: snippets || [],
      links: links || [],
      tags: tags || [],
    });
    res.status(201).json({ success: true, note });
  } catch (error) { next(error); }
};
