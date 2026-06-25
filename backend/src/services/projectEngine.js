const Project = require('../models/Project');
const ProjectFeature = require('../models/ProjectFeature');
const Sprint = require('../models/Sprint');
const ProjectBug = require('../models/ProjectBug');
const GoalTask = require('../models/GoalTask');

class ProjectEngine {
  async computeProjectProgress(projectId) {
    const [features, totalTasks] = await Promise.all([
      ProjectFeature.find({ projectId }),
      GoalTask.countDocuments({ projectId }),
    ]);
    if (features.length === 0 && totalTasks === 0) return 0;
    const completedFeatures = features.filter(f => f.status === 'completed').length;
    const completedTasks = await GoalTask.countDocuments({ projectId, status: 'completed' });
    const featureScore = features.length > 0 ? (completedFeatures / features.length) * 100 : 0;
    const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    if (features.length > 0 && totalTasks > 0) return Math.round((featureScore * 0.6 + taskScore * 0.4));
    if (features.length > 0) return Math.round(featureScore);
    return Math.round(taskScore);
  }

  async computeSprintProgress(sprintId) {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint || !sprint.tasks?.length) return 0;
    const completed = await GoalTask.countDocuments({ _id: { $in: sprint.tasks }, status: 'completed' });
    return Math.round((completed / sprint.tasks.length) * 100);
  }

  async getStatistics(projectId) {
    const [features, sprints, bugs, tasks] = await Promise.all([
      ProjectFeature.find({ projectId }),
      Sprint.find({ projectId }),
      ProjectBug.find({ projectId }),
      GoalTask.find({ projectId }),
    ]);
    const totalFeatures = features.length;
    const completedFeatures = features.filter(f => f.status === 'completed').length;
    const totalSprints = sprints.length;
    const completedSprints = sprints.filter(s => s.status === 'completed').length;
    const totalBugs = bugs.length;
    const openBugs = bugs.filter(b => b.status === 'open' || b.status === 'in_progress').length;
    const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    const actualHours = tasks.reduce((sum, t) => sum + (t.actualTime || 0), 0);
    const avgSprintTime = completedSprints > 0
      ? sprints.filter(s => s.status === 'completed').reduce((sum, s) => {
          if (s.startDate && s.completedAt) return sum + (new Date(s.completedAt) - new Date(s.startDate));
          return sum;
        }, 0) / completedSprints
      : 0;
    return {
      projectCompletion: await this.computeProjectProgress(projectId),
      sprintCompletion: completedSprints > 0 ? Math.round((completedSprints / totalSprints) * 100) : 0,
      featureCompletion: totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0,
      bugCount: totalBugs,
      openBugCount: openBugs,
      developmentHours: { estimated: totalHours, actual: actualHours },
      velocity: completedSprints > 0 ? Math.round(totalFeatures / completedSprints) : 0,
      avgSprintTimeMs: Math.round(avgSprintTime),
    };
  }

  async getDashboardStats(userId) {
    const [total, active, completed, archived, features, sprints, bugs] = await Promise.all([
      Project.countDocuments({ userId }),
      Project.countDocuments({ userId, status: 'active' }),
      Project.countDocuments({ userId, status: 'completed' }),
      Project.countDocuments({ userId, status: 'archived' }),
      ProjectFeature.aggregate([
        { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } },
        { $match: { 'project.userId': userId } },
        { $group: { _id: null, total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      ]),
      Sprint.aggregate([
        { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } },
        { $match: { 'project.userId': userId } },
        { $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } } } },
      ]),
      ProjectBug.aggregate([
        { $lookup: { from: 'projects', localField: 'projectId', foreignField: '_id', as: 'project' } },
        { $match: { 'project.userId': userId } },
        { $group: { _id: null, total: { $sum: 1 }, open: { $sum: { $cond: [{ $in: ['$status', ['open', 'in_progress']] }, 1, 0] } } } },
      ]),
    ]);
    const totalProgress = total > 0
      ? await Project.aggregate([
          { $match: { userId } },
          { $group: { _id: null, avg: { $avg: '$progress' } } },
        ]).then(r => r[0]?.avg || 0)
      : 0;
    return {
      total,
      active,
      completed,
      archived,
      overallProgress: Math.round(totalProgress),
      totalFeatures: features[0]?.total || 0,
      completedFeatures: features[0]?.completed || 0,
      activeSprints: sprints[0]?.active || 0,
      totalBugs: bugs[0]?.total || 0,
      openBugs: bugs[0]?.open || 0,
    };
  }

  async getCurrentSprint(projectId) {
    return Sprint.findOne({ projectId, status: 'active' }).populate('tasks').lean();
  }

  async getUpcomingMilestones(projectId, limit = 5) {
    return ProjectFeature.find({ projectId, status: { $in: ['planned', 'backlog'] } })
      .sort({ priority: -1, order: 1 }).limit(limit).lean();
  }

  async generateVersionReport(projectId) {
    const project = await Project.findById(projectId).lean();
    if (!project) return null;
    const [completedFeatures, resolvedBugs, activeSprint] = await Promise.all([
      ProjectFeature.find({ projectId, status: 'completed' }).lean(),
      ProjectBug.find({ projectId, status: 'resolved' }).lean(),
      Sprint.findOne({ projectId, status: 'active' }).lean(),
    ]);
    return {
      version: project.version,
      releaseDate: project.completionDate || null,
      completedFeatures: completedFeatures.map(f => f.title),
      bugFixes: resolvedBugs.map(b => b.title),
      currentSprint: activeSprint?.name || null,
      sprintProgress: activeSprint ? this.computeSprintProgress(activeSprint._id) : null,
    };
  }

  async getTimeline(projectId) {
    const [features, sprints, bugs, tasks] = await Promise.all([
      ProjectFeature.find({ projectId }).sort({ createdAt: -1 }).lean(),
      Sprint.find({ projectId }).sort({ startDate: -1 }).lean(),
      ProjectBug.find({ projectId }).sort({ createdAt: -1 }).lean(),
      GoalTask.find({ projectId }).sort({ createdAt: -1 }).lean(),
    ]);
    const events = [];
    features.forEach(f => events.push({ type: 'feature', action: f.status === 'completed' ? 'completed' : 'created', title: f.title, date: f.completedAt || f.createdAt }));
    sprints.forEach(s => events.push({ type: 'sprint', action: s.status === 'completed' ? 'completed' : s.status === 'active' ? 'started' : 'planned', title: s.name, date: s.completedAt || s.startDate || s.createdAt }));
    bugs.forEach(b => events.push({ type: 'bug', action: b.status === 'resolved' ? 'resolved' : 'reported', title: b.title, date: b.resolvedDate || b.createdAt }));
    tasks.forEach(t => events.push({ type: 'task', action: t.status === 'completed' ? 'completed' : 'created', title: t.title, date: t.completedAt || t.createdAt }));
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    return events.slice(0, 50);
  }
}

module.exports = new ProjectEngine();
