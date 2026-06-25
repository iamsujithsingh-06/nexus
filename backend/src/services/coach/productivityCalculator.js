const GoalTask = require('../../models/GoalTask');
const Activity = require('../../models/Activity');
const Goal = require('../../models/Goal');
const Project = require('../../models/Project');
const Streak = require('../../models/Streak');

class ProductivityCalculator {
  async calculateDailyScore(userId) {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [tasksCompleted, tasksCreated, goalsActive, projectsActive, streaks] = await Promise.all([
      GoalTask.countDocuments({ userId, status: 'completed', completedAt: { $gte: todayStart, $lt: tomorrowStart } }),
      GoalTask.countDocuments({ userId, createdAt: { $gte: todayStart, $lt: tomorrowStart } }),
      Goal.countDocuments({ userId, status: 'active' }),
      Project.countDocuments({ userId, status: 'active' }),
      Streak.find({ userId }).lean(),
    ]);

    const bestStreak = streaks.length ? Math.max(...streaks.map(s => s.currentStreak)) : 0;
    const consistencyBonus = Math.min(bestStreak * 2, 20);
    const tasksScore = Math.min(tasksCompleted * 15, 45);
    const engagementScore = Math.min((goalsActive * 5) + (projectsActive * 5), 20);
    const creationScore = Math.min(tasksCreated * 5, 15);

    return Math.min(Math.round(tasksScore + engagementScore + creationScore + consistencyBonus), 100);
  }

  async calculateWeeklyScore(userId, days = 7) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const activities = await Activity.find({ userId, date: { $gte: start.toISOString().split('T')[0] } }).lean();
    if (activities.length === 0) return 0;
    const avg = activities.reduce((s, a) => s + (a.score || 0), 0) / activities.length;
    return Math.round(avg);
  }

  async calculateMonthlyScore(userId) {
    return this.calculateWeeklyScore(userId, 30);
  }

  async getFullScoreBreakdown(userId) {
    const [daily, weekly, monthly, streaks] = await Promise.all([
      this.calculateDailyScore(userId),
      this.calculateWeeklyScore(userId),
      this.calculateMonthlyScore(userId),
      Streak.find({ userId }).lean(),
    ]);
    const bestStreak = streaks.length ? Math.max(...streaks.map(s => s.currentStreak)) : 0;
    const longestStreak = streaks.length ? Math.max(...streaks.map(s => s.longestStreak)) : 0;
    const totalTasksCompleted = await GoalTask.countDocuments({ userId, status: 'completed' });
    const totalActiveGoals = await Goal.countDocuments({ userId, status: 'active' });
    const avgGoalProgress = totalActiveGoals > 0
      ? await Goal.aggregate([
          { $match: { userId, status: 'active' } },
          { $group: { _id: null, avg: { $avg: '$progress' } } },
        ]).then(r => r[0]?.avg || 0)
      : 0;

    return {
      daily,
      weekly,
      monthly,
      bestStreak,
      longestStreak,
      totalTasksCompleted,
      totalActiveGoals,
      avgGoalProgress: Math.round(avgGoalProgress),
      consistencyScore: Math.min(bestStreak * 3, 30),
    };
  }
}

module.exports = new ProductivityCalculator();
