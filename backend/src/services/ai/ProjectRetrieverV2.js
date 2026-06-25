const Project = require('../../models/Project');
const Sprint = require('../../models/Sprint');
const ProjectFeature = require('../../models/ProjectFeature');
const ProjectBug = require('../../models/ProjectBug');
const GoalTask = require('../../models/GoalTask');
const CacheManager = require('./CacheManager');

const MAX_PROJECTS = 3;
const CACHE_TTL_MS = 120000;

async function retrieve(userId) {
  const start = Date.now();
  const cached = CacheManager.get(userId, 'projects_v2');
  if (cached) return { ...cached, elapsed: Date.now() - start, cached: true };

  try {
    const projects = await Project.find({ userId, status: { $in: ['active', 'paused'] } })
      .sort({ progress: -1, updatedAt: -1 }).limit(MAX_PROJECTS).lean();

    const enriched = await Promise.all(projects.map(async (p) => {
      let currentSprint = null;
      try { currentSprint = await Sprint.findOne({ projectId: p._id, status: 'active' }).lean(); } catch {}
      return {
        _id: p._id, title: p.title, category: p.category, status: p.status,
        priority: p.priority, progress: p.progress, version: p.version,
        currentSprint: currentSprint?.name || null,
        sprintGoal: currentSprint?.goal || null,
        sprintProgress: currentSprint?.progress || 0,
      };
    }));

    const pendingFeatures = await ProjectFeature.countDocuments({
      projectId: { $in: projects.map(p => p._id) },
      status: { $nin: ['completed', 'rejected'] },
    });
    const openBugs = await ProjectBug.countDocuments({
      projectId: { $in: projects.map(p => p._id) },
      status: { $in: ['open', 'in_progress'] },
    });
    const pendingTasks = await GoalTask.countDocuments({
      projectId: { $in: projects.map(p => p._id) },
      status: { $ne: 'completed' },
    });

    const result = {
      projects: enriched,
      count: enriched.length,
      pendingFeaturesTotal: pendingFeatures,
      openBugsTotal: openBugs,
      pendingTasksTotal: pendingTasks,
      hasActiveProjects: enriched.length > 0,
    };

    CacheManager.set(userId, 'projects_v2', result, CACHE_TTL_MS);
    return { ...result, elapsed: Date.now() - start, cached: false };
  } catch (err) {
    return { projects: [], count: 0, elapsed: Date.now() - start, error: err.message };
  }
}

function formatProjectsContext(data) {
  if (!data || !data.projects || data.projects.length === 0) return '';
  const lines = ['[Projects]'];
  data.projects.forEach((p) => {
    const parts = [`  • ${p.title}`];
    if (p.progress !== undefined) parts.push(`${p.progress}%`);
    if (p.currentSprint) parts.push(`sprint: ${p.currentSprint}${p.sprintProgress !== undefined ? ` (${p.sprintProgress}%)` : ''}`);
    if (p.sprintGoal) parts.push(`goal: ${p.sprintGoal}`);
    if (p.priority) parts.push(p.priority);
    lines.push(parts.join(' — '));
  });
  if (data.pendingFeaturesTotal > 0) lines.push(`  Pending features: ${data.pendingFeaturesTotal}`);
  if (data.openBugsTotal > 0) lines.push(`  Open bugs: ${data.openBugsTotal}`);
  if (data.pendingTasksTotal > 0) lines.push(`  Project tasks: ${data.pendingTasksTotal}`);
  lines.push('');
  return lines.join('\n');
}

module.exports = { retrieve, formatProjectsContext };
