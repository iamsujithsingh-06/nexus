const LearningPath = require('../models/LearningPath');
const Topic = require('../models/Topic');
const PracticeProblem = require('../models/PracticeProblem');
const RevisionSchedule = require('../models/RevisionSchedule');
const LearningNote = require('../models/LearningNote');
const learningEngine = require('./learningEngine');

const REVISION_INTERVALS = [1, 3, 7, 14, 30];

// ── Learning Paths ──

async function create(data) {
  const path = await LearningPath.create(data);

  if (data.generatePlan) {
    try {
      const plan = await learningEngine.generateRoadmap(data.title, data.category, data.difficulty || 'beginner');
      path.estimatedHours = plan.estimatedHours || 0;
      path.roadmap = plan.roadmap || [];
      path.milestones = (plan.milestones || []).map(m => ({ title: m.title, completed: false }));
      await path.save();

      if (plan.topics && plan.topics.length > 0) {
        const topicDocs = plan.topics.map(t => ({
          userId: data.userId,
          pathId: path._id,
          title: t.title,
          description: t.description || '',
          difficulty: t.difficulty || data.difficulty || 'beginner',
          estimatedHours: t.estimatedHours || 2,
          order: t.order,
          status: 'pending',
        }));
        await Topic.insertMany(topicDocs);
      }
    } catch (err) {
      console.error('[LearningService] Plan generation failed:', err.message);
    }
  }

  return LearningPath.findById(path._id);
}

async function list(userId, filters = {}) {
  const query = { userId };
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;

  const sort = {};
  if (filters.sort === 'progress') sort.progress = -1;
  else if (filters.sort === 'updated') sort.updatedAt = -1;
  else if (filters.sort === 'created') sort.createdAt = -1;
  else sort.updatedAt = -1;

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [paths, total] = await Promise.all([
    LearningPath.find(query).sort(sort).skip(skip).limit(limit).lean(),
    LearningPath.countDocuments(query),
  ]);

  return { paths, total, page, pages: Math.ceil(total / limit) };
}

async function getById(pathId, userId) {
  const path = await LearningPath.findOne({ _id: pathId, userId }).lean();
  if (!path) return null;
  const topics = await Topic.find({ pathId }).sort({ order: 1 }).lean();
  const topicIds = topics.map(t => t._id);
  const [practiceProblems, revisionSchedules] = await Promise.all([
    PracticeProblem.find({ pathId }).sort({ createdAt: -1 }).lean(),
    RevisionSchedule.find({ pathId, completed: false }).sort({ dueDate: 1 }).lean(),
  ]);
  return { ...path, topics, practiceProblems, revisionSchedules };
}

async function update(pathId, userId, data) {
  const path = await LearningPath.findOneAndUpdate(
    { _id: pathId, userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  return path;
}

async function remove(pathId, userId) {
  await Promise.all([
    LearningPath.deleteOne({ _id: pathId, userId }),
    Topic.deleteMany({ pathId }),
    PracticeProblem.deleteMany({ pathId }),
    RevisionSchedule.deleteMany({ pathId }),
    LearningNote.deleteMany({ pathId }),
  ]);
  return true;
}

// ── Topics ──

async function addTopic(pathId, userId, data) {
  const maxOrder = await Topic.findOne({ pathId }).sort({ order: -1 }).select('order').lean();
  const topic = await Topic.create({
    ...data,
    userId,
    pathId,
    order: (maxOrder?.order || 0) + 1,
  });
  await recalculateProgress(pathId);
  return topic;
}

async function updateTopic(topicId, userId, data) {
  const topic = await Topic.findOneAndUpdate(
    { _id: topicId, userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (topic && (data.status === 'completed' || data.status === 'in_progress')) {
    await handleTopicStatusChange(topic);
    await recalculateProgress(topic.pathId);
  }
  return topic;
}

async function removeTopic(topicId, userId) {
  const topic = await Topic.findOne({ _id: topicId, userId });
  if (!topic) return false;
  await Promise.all([
    Topic.deleteOne({ _id: topicId }),
    PracticeProblem.deleteMany({ topicId }),
    RevisionSchedule.deleteMany({ topicId }),
    LearningNote.deleteMany({ topicId }),
  ]);
  await recalculateProgress(topic.pathId);
  return true;
}

async function handleTopicStatusChange(topic) {
  if (topic.status === 'completed') {
    topic.completionDate = new Date();
    topic.revisionCount = 0;
    await topic.save();
    await scheduleRevisions(topic);
  }
  if (topic.status === 'in_progress' && !topic.completionDate) {
    await topic.save();
  }
}

async function recalculateProgress(pathId) {
  const [total, completed] = await Promise.all([
    Topic.countDocuments({ pathId }),
    Topic.countDocuments({ pathId, status: 'completed' }),
  ]);
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  await LearningPath.updateOne({ _id: pathId }, { $set: { progress } });
}

// ── Revision Engine (Spaced Repetition) ──

async function scheduleRevisions(topic) {
  const schedules = REVISION_INTERVALS.map(days => ({
    userId: topic.userId,
    topicId: topic._id,
    pathId: topic.pathId,
    dueDate: new Date(Date.now() + days * 86400000),
    interval: days,
  }));
  await RevisionSchedule.insertMany(schedules);
}

async function getDueRevisions(userId) {
  const now = new Date();
  return RevisionSchedule.find({ userId, dueDate: { $lte: now }, completed: false })
    .populate('topicId', 'title pathId')
    .sort({ dueDate: 1 })
    .lean();
}

async function completeRevision(scheduleId, userId) {
  return RevisionSchedule.findOneAndUpdate(
    { _id: scheduleId, userId },
    { $set: { completed: true, completedAt: new Date() } },
    { new: true }
  );
}

async function recordStudyTime(pathId, userId, hours) {
  return LearningPath.findOneAndUpdate(
    { _id: pathId, userId },
    { $inc: { actualHoursStudied: hours } },
    { new: true }
  );
}

// ── Statistics ──

async function getStats(userId) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    totalPaths,
    activePaths,
    completedPaths,
    totalTopics,
    completedTopics,
    weeklyTopics,
    totalProblems,
    solvedProblems,
    dueRevisions,
    paths,
  ] = await Promise.all([
    LearningPath.countDocuments({ userId }),
    LearningPath.countDocuments({ userId, status: 'active' }),
    LearningPath.countDocuments({ userId, status: 'completed' }),
    Topic.countDocuments({ userId }),
    Topic.countDocuments({ userId, status: 'completed' }),
    Topic.countDocuments({ userId, status: 'completed', completionDate: { $gte: startOfWeek } }),
    PracticeProblem.countDocuments({ userId }),
    PracticeProblem.countDocuments({ userId, status: 'solved' }),
    RevisionSchedule.countDocuments({ userId, dueDate: { $lte: now }, completed: false }),
    LearningPath.find({ userId }).select('actualHoursStudied').lean(),
  ]);

  const totalStudyHours = paths.reduce((sum, p) => sum + (p.actualHoursStudied || 0), 0);

  const currentPath = await LearningPath.findOne({ userId, status: 'active' })
    .sort({ updatedAt: -1 })
    .select('title progress')
    .lean();

  return {
    totalPaths,
    activePaths,
    completedPaths,
    totalTopics,
    completedTopics,
    weeklyTopics,
    totalProblems,
    solvedProblems,
    dueRevisions,
    totalStudyHours: Math.round(totalStudyHours * 10) / 10,
    currentLearningGoal: currentPath ? { title: currentPath.title, progress: currentPath.progress } : null,
  };
}

async function getDashboardData(userId) {
  const stats = await getStats(userId);
  const dueRevisions = await getDueRevisions(userId);

  const currentTopic = await Topic.findOne({ userId, status: 'in_progress' })
    .populate('pathId', 'title')
    .sort({ updatedAt: -1 })
    .lean();

  const lastCompletedTopic = await Topic.findOne({ userId, status: 'completed' })
    .sort({ completionDate: -1 })
    .lean();

  const activePaths = await LearningPath.find({ userId, status: 'active' })
    .select('title progress')
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  return {
    stats,
    currentTopic: currentTopic ? {
      title: currentTopic.title,
      pathTitle: currentTopic.pathId?.title || '',
      confidence: currentTopic.confidenceScore,
    } : null,
    lastCompletedTopic: lastCompletedTopic ? {
      title: lastCompletedTopic.title,
      daysAgo: Math.round((Date.now() - new Date(lastCompletedTopic.completionDate).getTime()) / 86400000),
    } : null,
    activePaths,
    dueRevisions: dueRevisions.slice(0, 5),
    recommendations: activePaths.length > 0
      ? await generateRecommendations(userId, stats, activePaths)
      : [],
  };
}

async function generateRecommendations(userId, stats, activePaths) {
  const inProgressTopics = await Topic.find({ userId, status: 'in_progress' })
    .populate('pathId', 'title')
    .sort({ updatedAt: -1 })
    .limit(3)
    .lean();

  const state = {
    currentTopics: inProgressTopics.map(t => ({
      title: t.title,
      status: 'in_progress',
      confidence: t.confidenceScore || 0,
    })),
    completedTopics: [],
    pendingTopics: [],
    totalProgress: activePaths[0]?.progress || 0,
    goals: [],
    weakAreas: [],
  };

  try {
    return await learningEngine.generateRecommendations(state);
  } catch {
    return [];
  }
}

async function search(userId, query) {
  const paths = await LearningPath.find(
    { userId, $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } }).limit(10).lean();

  const topics = await Topic.find(
    { userId, $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } }).limit(10).populate('pathId', 'title').lean();

  return { paths, topics };
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  addTopic,
  updateTopic,
  removeTopic,
  recalculateProgress,
  scheduleRevisions,
  getDueRevisions,
  completeRevision,
  recordStudyTime,
  getStats,
  getDashboardData,
  search,
};
