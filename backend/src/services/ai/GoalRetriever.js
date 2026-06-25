/**
 * GoalRetriever — fetches active goals for AI Brain context.
 *
 * Returns top 3 active goals with their milestones and progress.
 * Uses CacheManager for 2-minute TTL.
 */

const Goal = require('../../models/Goal');
const Milestone = require('../../models/Milestone');
const CacheManager = require('./CacheManager');

const MAX_GOALS = 3;

async function retrieve(userId) {
  const start = Date.now();

  const cached = CacheManager.get(userId, 'goals');
  if (cached) return { ...cached, elapsed: Date.now() - start, cached: true };

  try {
    const goals = await Goal.find({ userId, status: { $in: ['active', 'paused'] } })
      .sort({ priority: -1, createdAt: -1 })
      .limit(MAX_GOALS)
      .lean();

    const enriched = await Promise.all(goals.map(async (goal) => {
      const milestones = await Milestone.find({ goalId: goal._id })
        .sort({ order: 1 })
        .limit(5)
        .lean();
      return {
        _id: goal._id,
        title: goal.title,
        category: goal.category,
        status: goal.status,
        progress: goal.progress,
        priority: goal.priority,
        milestones: milestones.map(m => ({
          title: m.title,
          status: m.status,
          phase: m.phase,
        })),
        createdAt: goal.createdAt,
      };
    }));

    const result = { goals: enriched, count: enriched.length };
    CacheManager.set(userId, 'goals', result);
    return { ...result, elapsed: Date.now() - start, cached: false };
  } catch (err) {
    return { goals: [], count: 0, elapsed: Date.now() - start, error: err.message };
  }
}

module.exports = { retrieve };
