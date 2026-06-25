const Goal = require('../../models/Goal');
const GoalTask = require('../../models/GoalTask');
const Project = require('../../models/Project');
const ProjectFeature = require('../../models/ProjectFeature');
const ProjectBug = require('../../models/ProjectBug');
const LearningPath = require('../../models/LearningPath');
const Streak = require('../../models/Streak');
const Activity = require('../../models/Activity');

class InsightGenerator {
  async generateDailyBrief(userId) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const todayStart = new Date(today);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [goals, pendingTasks, projects, learningPaths, activities, streaks, completedToday] = await Promise.all([
      Goal.find({ userId, status: 'active' }).sort({ priority: -1 }).lean(),
      GoalTask.find({ userId, status: { $ne: 'completed' } }).sort({ priority: -1, dueDate: 1 }).lean(),
      Project.find({ userId, status: 'active' }).sort({ progress: 1 }).lean(),
      LearningPath.find({ userId, status: 'active' }).sort({ progress: 1 }).lean(),
      Activity.find({ userId }).sort({ date: -1 }).limit(7).lean(),
      Streak.find({ userId }).lean(),
      GoalTask.countDocuments({ userId, status: 'completed', completedAt: { $gte: todayStart, $lt: tomorrowStart } }),
    ]);

    const bestStreak = streaks.length ? Math.max(...streaks.map(s => s.currentStreak)) : 0;
    const avgGoalProgress = goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
    const overdueTasks = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < now);
    const todayDueTasks = pendingTasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).toISOString().split('T')[0] === today;
    });
    const estimatedTime = pendingTasks.reduce((s, t) => s + (t.estimatedTime || 0), 0);
    const weeklyActive = activities.filter(a => a.score > 0).length;
    const activeProjectCount = projects.length;

    // Morning/afternoon/evening greeting
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Highest priority goal
    const topGoal = goals.sort((a, b) => a.priority - b.priority || a.progress - b.progress)[0];

    // Recommended learning (lowest progress path)
    const topLearning = learningPaths.sort((a, b) => a.progress - b.progress)[0];

    // Motivational message based on actual data
    let motivation = '';
    if (bestStreak >= 30) motivation = `Incredible ${bestStreak}-day streak! You are building a legendary habit.`;
    else if (bestStreak >= 7) motivation = `${bestStreak}-day streak! Consistency is turning into a superpower.`;
    else if (bestStreak >= 3) motivation = `${bestStreak} days and counting! Keep the momentum going.`;
    else if (completedToday > 0) motivation = `Already completed ${completedToday} task${completedToday > 1 ? 's' : ''} today. Great start!`;
    else if (goals.length === 0 && projects.length === 0) motivation = `Ready to start something amazing? Set a goal or create a project.`;
    else if (overdueTasks.length > 0) motivation = `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Let us tackle them one at a time.`;
    else motivation = `You have everything you need for a productive day. Let us make it count.`;

    return {
      greeting,
      date: today,
      currentStreak: bestStreak,
      todaysFocus: todayDueTasks.length > 0
        ? `${todayDueTasks.length} task${todayDueTasks.length > 1 ? 's' : ''} due today`
        : overdueTasks.length > 0
          ? `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} to catch up on`
          : `${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''} to work on`,
      highestPriorityGoal: topGoal ? { title: topGoal.title, progress: topGoal.progress, _id: topGoal._id } : null,
      recommendedLearning: topLearning ? { title: topLearning.title, progress: topLearning.progress, _id: topLearning._id } : null,
      recommendedTasks: todayDueTasks.length > 0
        ? todayDueTasks.slice(0, 5).map(t => ({ _id: t._id, title: t.title, priority: t.priority }))
        : pendingTasks.slice(0, 5).map(t => ({ _id: t._id, title: t.title, priority: t.priority })),
      estimatedStudyTime: estimatedTime,
      activeProjects: activeProjectCount,
      avgGoalProgress,
      weeklyActiveDays: weeklyActive,
      motivationalMessage: motivation,
    };
  }

  async generateDailyReview(userId) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const todayStart = new Date(today);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [completedTasks, learningPaths, projects, goals, activity] = await Promise.all([
      GoalTask.find({ userId, status: 'completed', completedAt: { $gte: todayStart, $lt: tomorrowStart } }).lean(),
      LearningPath.find({ userId, status: 'active' }).lean(),
      Project.find({ userId, status: 'active' }).lean(),
      Goal.find({ userId, status: { $ne: 'archived' } }).lean(),
      Activity.findOne({ userId, date: today }).lean(),
    ]);

    const missedTasks = await GoalTask.countDocuments({
      userId,
      status: { $ne: 'completed' },
      dueDate: { $lt: now },
    });

    const projectProgress = projects.length > 0
      ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0;
    const goalProgress = goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
    const learningProgress = learningPaths.length > 0
      ? Math.round(learningPaths.reduce((s, l) => s + l.progress, 0) / learningPaths.length) : 0;

    const productivityScore = activity?.score || 0;

    // Recommendations for tomorrow
    const recommendations = [];
    if (missedTasks > 0) recommendations.push(`Catch up on ${missedTasks} missed task${missedTasks > 1 ? 's' : ''}`);
    if (projectProgress < 50) recommendations.push('Focus on project progress');
    if (goalProgress < 50) recommendations.push('Make progress on your goals');

    return {
      date: today,
      completedTasks: completedTasks.map(t => ({ _id: t._id, title: t.title, category: t.category })),
      completedCount: completedTasks.length,
      learningProgress,
      goalProgress,
      projectProgress,
      missedTasks,
      productivityScore,
      tomorrowRecommendations: recommendations.length > 0 ? recommendations : ['Keep up the good work'],
    };
  }

  async generateWeeklyReview(userId) {
    const now = new Date();
    const weekEnd = now.toISOString().split('T')[0];
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const [tasks, goals, projects, learningPaths, activities, streaks] = await Promise.all([
      GoalTask.find({ userId, completedAt: { $gte: weekStart, $lte: now } }).lean(),
      Goal.find({ userId, status: { $ne: 'archived' } }).lean(),
      Project.find({ userId }).lean(),
      LearningPath.find({ userId }).lean(),
      Activity.find({ userId, date: { $gte: weekStartStr } }).sort({ date: -1 }).lean(),
      Streak.find({ userId }).lean(),
    ]);

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalStudyHours = completedTasks.reduce((s, t) => s + (t.actualTime || t.estimatedTime || 0), 0);
    const avgProjectProgress = projects.length > 0
      ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0;
    const avgGoalProgress = goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
    const taskCompletionRate = tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    const bestStreak = streaks.length ? Math.max(...streaks.map(s => s.currentStreak)) : 0;
    const activeDays = activities.filter(a => a.score > 0).length;
    const avgScore = activities.length > 0
      ? Math.round(activities.reduce((s, a) => s + (a.score || 0), 0) / activities.length) : 0;

    const completedTopics = await LearningPath.aggregate([
      { $match: { userId } },
      { $unwind: '$topics' },
      { $match: { 'topics.status': 'completed', 'topics.completedAt': { $gte: weekStart, $lte: now } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]).then(r => r[0]?.count || 0);

    const achievements = [];
    if (bestStreak >= 30) achievements.push('Legendary consistency — 30+ day streak');
    else if (bestStreak >= 7) achievements.push('Week warrior — 7+ day streak maintained');
    if (taskCompletionRate >= 80) achievements.push('Top task completion rate');
    if (activeDays >= 5) achievements.push('Active on 5+ days this week');
    if (completedTopics >= 3) achievements.push(`Completed ${completedTopics} learning topics`);

    const areasToImprove = [];
    if (activeDays < 3) areasToImprove.push('Be active on more days');
    if (taskCompletionRate < 50) areasToImprove.push('Improve task completion rate');
    if (avgScore < 30) areasToImprove.push('Increase daily productivity score');

    return {
      weekStart: weekStartStr,
      weekEnd,
      studyHours: Math.round(totalStudyHours / 60),
      completedTasks: completedTasks.length,
      completedTopics,
      avgProjectProgress,
      avgGoalProgress,
      taskCompletionRate,
      activeDays,
      avgProductivityScore: avgScore,
      bestStreak,
      achievements: achievements.slice(0, 5),
      areasToImprove: areasToImprove.slice(0, 5),
      dailyBreakdown: activities.map(a => ({ date: a.date, score: a.score || 0 })),
    };
  }
}

module.exports = new InsightGenerator();
