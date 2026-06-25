const Project = require('../models/Project');
const projectService = require('../services/projectService');

exports.dashboard = async (req, res, next) => {
  try {
    const data = await projectService.getDashboard(req.user._id);
    res.json({ success: true, ...data });
  } catch (error) { next(error); }
};

exports.search = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await projectService.search(req.user._id, q);
    res.json({ success: true, ...results });
  } catch (error) { next(error); }
};

exports.list = async (req, res, next) => {
  try {
    const { status, category, priority, search, sort, page, limit } = req.query;
    const result = await projectService.list(req.user._id, { status, category, priority, search, sort, page, limit });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await projectService.getById(req.params.projectId, req.user._id);
    if (!result) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, category, priority, startDate, targetDate, techStack, tags, notes, goalRef } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Title is required' });
    const project = await projectService.create(req.user._id, { title, description, category, priority, startDate, targetDate, techStack, tags, notes, goalRef });
    res.status(201).json({ success: true, project });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const project = await projectService.update(req.params.projectId, req.user._id, req.body);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, project });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const project = await projectService.remove(req.params.projectId, req.user._id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, project });
  } catch (error) { next(error); }
};

exports.stats = async (req, res, next) => {
  try {
    const stats = await projectService.getStatistics(req.params.projectId);
    res.json({ success: true, stats });
  } catch (error) { next(error); }
};

exports.timeline = async (req, res, next) => {
  try {
    const timeline = await projectService.getTimeline(req.params.projectId);
    res.json({ success: true, timeline });
  } catch (error) { next(error); }
};

exports.versionReport = async (req, res, next) => {
  try {
    const report = await projectService.getVersionReport(req.params.projectId);
    res.json({ success: true, report });
  } catch (error) { next(error); }
};

// ── Features ──

exports.listFeatures = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const features = await projectService.listFeatures(req.params.projectId, { status, priority });
    res.json({ success: true, features });
  } catch (error) { next(error); }
};

exports.createFeature = async (req, res, next) => {
  try {
    const { title, description, priority, estimatedHours, notes } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Feature title is required' });
    const feature = await projectService.createFeature(req.params.projectId, { title, description, priority, estimatedHours, notes });
    res.status(201).json({ success: true, feature });
  } catch (error) { next(error); }
};

exports.updateFeature = async (req, res, next) => {
  try {
    const feature = await projectService.updateFeature(req.params.featureId, req.user._id, req.body);
    if (!feature) return res.status(404).json({ success: false, error: 'Feature not found' });
    res.json({ success: true, feature });
  } catch (error) { next(error); }
};

exports.deleteFeature = async (req, res, next) => {
  try {
    const feature = await projectService.deleteFeature(req.params.featureId, req.user._id);
    if (!feature) return res.status(404).json({ success: false, error: 'Feature not found' });
    res.json({ success: true, feature });
  } catch (error) { next(error); }
};

// ── Sprints ──

exports.listSprints = async (req, res, next) => {
  try {
    const sprints = await projectService.listSprints(req.params.projectId);
    res.json({ success: true, sprints });
  } catch (error) { next(error); }
};

exports.createSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate, notes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Sprint name is required' });
    const sprint = await projectService.createSprint(req.params.projectId, { name, goal, startDate, endDate, notes });
    res.status(201).json({ success: true, sprint });
  } catch (error) { next(error); }
};

exports.updateSprint = async (req, res, next) => {
  try {
    const sprint = await projectService.updateSprint(req.params.sprintId, req.user._id, req.body);
    if (!sprint) return res.status(404).json({ success: false, error: 'Sprint not found' });
    res.json({ success: true, sprint });
  } catch (error) { next(error); }
};

exports.deleteSprint = async (req, res, next) => {
  try {
    const sprint = await projectService.deleteSprint(req.params.sprintId, req.user._id);
    if (!sprint) return res.status(404).json({ success: false, error: 'Sprint not found' });
    res.json({ success: true, sprint });
  } catch (error) { next(error); }
};

// ── Bugs ──

exports.listBugs = async (req, res, next) => {
  try {
    const { status, severity, priority } = req.query;
    const bugs = await projectService.listBugs(req.params.projectId, { status, severity, priority });
    res.json({ success: true, bugs });
  } catch (error) { next(error); }
};

exports.createBug = async (req, res, next) => {
  try {
    const { title, description, severity, priority, featureRef, notes } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Bug title is required' });
    const bug = await projectService.createBug(req.params.projectId, { title, description, severity, priority, featureRef, notes });
    res.status(201).json({ success: true, bug });
  } catch (error) { next(error); }
};

exports.updateBug = async (req, res, next) => {
  try {
    const bug = await projectService.updateBug(req.params.bugId, req.user._id, req.body);
    if (!bug) return res.status(404).json({ success: false, error: 'Bug not found' });
    res.json({ success: true, bug });
  } catch (error) { next(error); }
};

exports.deleteBug = async (req, res, next) => {
  try {
    const bug = await projectService.deleteBug(req.params.bugId, req.user._id);
    if (!bug) return res.status(404).json({ success: false, error: 'Bug not found' });
    res.json({ success: true, bug });
  } catch (error) { next(error); }
};
