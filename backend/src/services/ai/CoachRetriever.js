const CoachReport = require('../../models/CoachReport');
const GoalTask = require('../../models/GoalTask');
const Goal = require('../../models/Goal');
const Project = require('../../models/Project');
const Streak = require('../../models/Streak');
const Activity = require('../../models/Activity');
const CacheManager = require('./CacheManager');

const CACHE_TTL_MS = 180000;

async function retrieve(userId) {
  const start = Date.now();
  const cached = CacheManager.get(userId, 'coach');
  if (cached) return { ...cached, elapsed: Date.now() - start, cached: true };

  try {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [brief, goalsActive, pendingTasks, projectsActive, streaks, activities, completedToday] = await Promise.all([
      CoachReport.findOne({ userId, type: 'daily_brief', date: today }).lean().catch(() => null),
      Goal.countDocuments({ userId, status: 'active' }),
      GoalTask.countDocuments({ userId, status: { $ne: 'completed' } }),
      Project.countDocuments({ userId, status: 'active' }),
      Streak.find({ userId }).lean(),
      Activity.find({ userId }).sort({ date: -1 }).limit(7).lean(),
      GoalTask.countDocuments({ userId, status: 'completed', completedAt: { $gte: todayStart, $lt: tomorrowStart } }),
    ]);

    const bestStreak = streaks.length ? Math.max(...streaks.map(s => s.currentStreak)) : 0;
    const avgScore = activities.length > 0
      ? Math.round(activities.reduce((s, a) => s + (a.score || 0), 0) / activities.length) : 0;

    const result = {
      hasCoachData: true,
      greeting: brief?.data?.greeting || 'Good day',
      todaysFocus: brief?.data?.todaysFocus || `${pendingTasks} pending tasks`,
      motivationalMessage: brief?.data?.motivationalMessage || '',
      productivityScore: avgScore,
      currentStreak: bestStreak,
      activeGoals: goalsActive,
      activeProjects: projectsActive,
      pendingTasks,
      completedToday,
      topGoal: brief?.data?.highestPriorityGoal
        ? { title: brief.data.highestPriorityGoal.title, progress: brief.data.highestPriorityGoal.progress }
        : null,
      recommendedTasks: brief?.data?.recommendedTasks?.slice(0, 3) || [],
    };

    CacheManager.set(userId, 'coach', result, CACHE_TTL_MS);
    return { ...result, elapsed: Date.now() - start, cached: false };
  } catch (err) {
    return { hasCoachData: false, elapsed: Date.now() - start, error: err.message };
  }
}

function formatCoachContext(data) {
  if (!data || !data.hasCoachData) return '';
  const lines = ['[Coach]'];
  lines.push(`  ${data.greeting} — ${data.todaysFocus}`);
  if (data.productivityScore > 0) lines.push(`  Productivity: ${data.productivityScore}/100`);
  if (data.currentStreak > 0) lines.push(`  Streak: ${data.currentStreak} days`);
  if (data.topGoal) lines.push(`  Top goal: ${data.topGoal.title} (${data.topGoal.progress}%)`);
  if (data.recommendedTasks?.length > 0) {
    const taskList = data.recommendedTasks.map(t => `  • ${t.title} [${t.priority}]`).join('\n');
    lines.push(`  Recommended tasks:\n${taskList}`);
  }
  if (data.motivationalMessage) lines.push(`  💡 ${data.motivationalMessage}`);
  lines.push('');
  return lines.join('\n');
}

module.exports = { retrieve, formatCoachContext };
