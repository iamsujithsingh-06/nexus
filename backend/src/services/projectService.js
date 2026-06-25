const Project = require('../models/Project');
const ProjectFeature = require('../models/ProjectFeature');
const Sprint = require('../models/Sprint');
const ProjectBug = require('../models/ProjectBug');
const GoalTask = require('../models/GoalTask');
const Goal = require('../models/Goal');
const projectEngine = require('./projectEngine');
const MemoryEngine = require('../memory/engine/MemoryEngine');

class ProjectService {
  async getDashboard(userId) {
    return projectEngine.getDashboardStats(userId);
  }

  async getStatistics(projectId) {
    return projectEngine.getStatistics(projectId);
  }

  async getTimeline(projectId) {
    return projectEngine.getTimeline(projectId);
  }

  async getVersionReport(projectId) {
    return projectEngine.generateVersionReport(projectId);
  }

  async list(userId, filters = {}) {
    const { status, category, priority, search, sort, page = 1, limit = 20 } = filters;
    const query = { userId };
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, progress: { progress: -1 }, deadline: { targetDate: 1 } };
    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit).limit(limit).lean();
    return { projects, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
  }

  async getById(projectId, userId) {
    const project = await Project.findOne({ _id: projectId, userId }).lean();
    if (!project) return null;
    const [features, sprints, bugs, tasks, stats] = await Promise.all([
      ProjectFeature.find({ projectId }).sort({ order: 1 }).lean(),
      Sprint.find({ projectId }).sort({ startDate: -1 }).lean(),
      ProjectBug.find({ projectId }).sort({ createdAt: -1 }).lean(),
      GoalTask.find({ projectId }).sort({ createdAt: -1 }).limit(20).lean(),
      projectEngine.getStatistics(projectId),
    ]);
    return { project, features, sprints, bugs, tasks, stats };
  }

  async create(userId, data) {
    const project = await Project.create({ userId, ...data });
    const key = `project:${project._id}`;
    await MemoryEngine.save(userId, 'project', key, {
      name: project.title,
      category: project.category,
      status: project.status,
      createdAt: project.createdAt,
    }, { source: 'system', tags: ['project', 'created'] }).catch(() => {});
    return project;
  }

  async update(projectId, userId, data) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { $set: { ...data } },
      { new: true, runValidators: true }
    );
    if (!project) return null;
    if (data.status === 'completed') {
      project.completionDate = new Date();
      await project.save();
      await MemoryEngine.save(userId, 'project_update', `project:${projectId}:completed`, {
        name: project.title, status: 'completed', completedAt: project.completionDate,
      }, { source: 'system', tags: ['project', 'completed'] }).catch(() => {});
    } else {
      await MemoryEngine.save(userId, 'project_update', `project:${projectId}:updated`, {
        name: project.title, status: project.status, progress: project.progress,
      }, { source: 'system', tags: ['project', 'updated'] }).catch(() => {});
    }
    if (data.progress !== undefined && project.goalRef) {
      await Goal.findByIdAndUpdate(project.goalRef, { progress: data.progress }).catch(() => {});
    }
    return project;
  }

  async remove(projectId, userId) {
    const project = await Project.findOneAndDelete({ _id: projectId, userId });
    if (!project) return null;
    await Promise.all([
      ProjectFeature.deleteMany({ projectId }),
      Sprint.deleteMany({ projectId }),
      ProjectBug.deleteMany({ projectId }),
    ]);
    return project;
  }

  async recalculateProgress(projectId) {
    const progress = await projectEngine.computeProjectProgress(projectId);
    await Project.findByIdAndUpdate(projectId, { progress });
    return progress;
  }

  // ── Features ──

  async listFeatures(projectId, filters = {}) {
    const { status, priority } = filters;
    const query = { projectId };
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    return ProjectFeature.find(query).sort({ order: 1 }).lean();
  }

  async createFeature(projectId, data) {
    const max = await ProjectFeature.findOne({ projectId }).sort({ order: -1 }).select('order').lean();
    const feature = await ProjectFeature.create({ projectId, ...data, order: (max?.order || 0) + 1 });
    await this.recalculateProgress(projectId);
    return feature;
  }

  async updateFeature(featureId, userId, data) {
    const feature = await ProjectFeature.findById(featureId);
    if (!feature) return null;
    const project = await Project.findOne({ _id: feature.projectId, userId });
    if (!project) return null;
    const wasCompleted = data.status === 'completed' && feature.status !== 'completed';
    Object.assign(feature, data);
    if (wasCompleted) feature.completedAt = new Date();
    await feature.save();
    await this.recalculateProgress(feature.projectId);
    if (wasCompleted) {
      await MemoryEngine.save(userId, 'feature_completed', `feature:${featureId}:completed`, {
        projectName: project.title, featureName: feature.title,
      }, { source: 'system', tags: ['project', 'feature', 'completed'] }).catch(() => {});
    }
    return feature;
  }

  async deleteFeature(featureId, userId) {
    const feature = await ProjectFeature.findById(featureId);
    if (!feature) return null;
    const project = await Project.findOne({ _id: feature.projectId, userId });
    if (!project) return null;
    await ProjectFeature.findByIdAndDelete(featureId);
    await this.recalculateProgress(feature.projectId);
    return feature;
  }

  // ── Sprints ──

  async listSprints(projectId) {
    return Sprint.find({ projectId }).sort({ startDate: -1 }).lean();
  }

  async createSprint(projectId, data) {
    const sprint = await Sprint.create({ projectId, ...data });
    await Project.findByIdAndUpdate(projectId, { currentSprint: sprint.name });
    return sprint;
  }

  async updateSprint(sprintId, userId, data) {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return null;
    const project = await Project.findOne({ _id: sprint.projectId, userId });
    if (!project) return null;
    Object.assign(sprint, data);
    if (data.status === 'completed') {
      sprint.completedAt = new Date();
      sprint.progress = 100;
    }
    await sprint.save();
    if (data.status === 'active') {
      await Project.findByIdAndUpdate(sprint.projectId, { currentSprint: sprint.name });
    }
    if (sprint.status === 'completed') {
      await MemoryEngine.save(userId, 'sprint_completed', `sprint:${sprintId}:completed`, {
        projectName: project.title, sprintName: sprint.name,
      }, { source: 'system', tags: ['project', 'sprint', 'completed'] }).catch(() => {});
    }
    return sprint;
  }

  async deleteSprint(sprintId, userId) {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return null;
    const project = await Project.findOne({ _id: sprint.projectId, userId });
    if (!project) return null;
    await Sprint.findByIdAndDelete(sprintId);
    return sprint;
  }

  // ── Bugs ──

  async listBugs(projectId, filters = {}) {
    const { status, severity, priority } = filters;
    const query = { projectId };
    if (status && status !== 'all') query.status = status;
    if (severity && severity !== 'all') query.severity = severity;
    if (priority && priority !== 'all') query.priority = priority;
    return ProjectBug.find(query).sort({ createdAt: -1 }).lean();
  }

  async createBug(projectId, data) {
    const bug = await ProjectBug.create({ projectId, ...data });
    return bug;
  }

  async updateBug(bugId, userId, data) {
    const bug = await ProjectBug.findById(bugId);
    if (!bug) return null;
    const project = await Project.findOne({ _id: bug.projectId, userId });
    if (!project) return null;
    const wasResolved = data.status === 'resolved' && bug.status !== 'resolved';
    Object.assign(bug, data);
    if (wasResolved) bug.resolvedDate = new Date();
    await bug.save();
    if (wasResolved) {
      await MemoryEngine.save(userId, 'bug_resolved', `bug:${bugId}:resolved`, {
        projectName: project.title, bugTitle: bug.title,
      }, { source: 'system', tags: ['project', 'bug', 'resolved'] }).catch(() => {});
    }
    return bug;
  }

  async deleteBug(bugId, userId) {
    const bug = await ProjectBug.findById(bugId);
    if (!bug) return null;
    const project = await Project.findOne({ _id: bug.projectId, userId });
    if (!project) return null;
    await ProjectBug.findByIdAndDelete(bugId);
    return bug;
  }

  // ── Search ──

  async search(userId, query) {
    if (!query || !query.trim()) return [];
    const q = { $regex: query, $options: 'i' };
    const [projects, features, sprints, bugs] = await Promise.all([
      Project.find({ userId, $or: [{ title: q }, { description: q }, { tags: q }] }).limit(10).lean(),
      ProjectFeature.find({ title: q }).populate('projectId', 'title userId').limit(10).lean(),
      Sprint.find({ $or: [{ name: q }, { goal: q }] }).populate('projectId', 'title userId').limit(10).lean(),
      ProjectBug.find({ title: q }).populate('projectId', 'title userId').limit(10).lean(),
    ]);
    return {
      projects: projects.map(p => ({ _id: p._id, title: p.title, type: 'project' })),
      features: features.filter(f => f.projectId?.userId?.toString() === userId.toString()).map(f => ({ _id: f._id, title: f.title, projectTitle: f.projectId?.title, type: 'feature' })),
      sprints: sprints.filter(s => s.projectId?.userId?.toString() === userId.toString()).map(s => ({ _id: s._id, name: s.name, projectTitle: s.projectId?.title, type: 'sprint' })),
      bugs: bugs.filter(b => b.projectId?.userId?.toString() === userId.toString()).map(b => ({ _id: b._id, title: b.title, projectTitle: b.projectId?.title, type: 'bug' })),
    };
  }
}

module.exports = new ProjectService();
