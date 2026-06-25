const LearningPath = require('../../models/LearningPath');
const Topic = require('../../models/Topic');
const RevisionSchedule = require('../../models/RevisionSchedule');
const CacheManager = require('./CacheManager');

const MAX_PATHS = 3;
const MAX_TOPICS = 5;

async function retrieve(userId, userMessage = '') {
  const start = Date.now();

  const cacheKey = `learning:${userId}`;
  const cached = CacheManager.get(userId, cacheKey);
  if (cached) return { ...cached, elapsed: Date.now() - start, cached: true };

  try {
    const isLearningQuery = /continue|learn|study|revise|practice|teach|tutorial/i.test(userMessage);

    const activePaths = await LearningPath.find({ userId, status: 'active' })
      .sort({ updatedAt: -1 })
      .limit(MAX_PATHS)
      .select('title category difficulty progress actualHoursStudied')
      .lean();

    let result = { paths: [], currentTopic: null, dueRevisions: 0, hasLearningContext: false };

    if (activePaths.length > 0 || isLearningQuery) {
      const inProgressTopic = await Topic.findOne({ userId, status: 'in_progress' })
        .populate('pathId', 'title')
        .sort({ updatedAt: -1 })
        .select('title status confidenceScore pathId')
        .lean();

      const recentCompleted = await Topic.findOne({ userId, status: 'completed' })
        .sort({ completionDate: -1 })
        .select('title')
        .lean();

      const dueCount = await RevisionSchedule.countDocuments({
        userId, completed: false, dueDate: { $lte: new Date() },
      });

      const pathTopics = [];
      if (activePaths.length > 0) {
        for (const path of activePaths.slice(0, 2)) {
          const topics = await Topic.find({ pathId: path._id })
            .sort({ order: 1 })
            .limit(MAX_TOPICS)
            .select('title status difficulty order')
            .lean();
          pathTopics.push({ pathId: path._id, pathTitle: path.title, topics });
        }
      }

      result = {
        paths: activePaths,
        pathTopics,
        currentTopic: inProgressTopic ? {
          title: inProgressTopic.title,
          pathTitle: inProgressTopic.pathId?.title || '',
          confidence: inProgressTopic.confidenceScore,
        } : null,
        lastCompletedTopic: recentCompleted?.title || null,
        dueRevisions: dueCount,
        hasLearningContext: activePaths.length > 0 || isLearningQuery,
      };

      CacheManager.set(userId, cacheKey, result, 120);
    }

    return { ...result, elapsed: Date.now() - start, cached: false };
  } catch (err) {
    return { paths: [], hasLearningContext: false, elapsed: Date.now() - start, error: err.message };
  }
}

module.exports = { retrieve };
