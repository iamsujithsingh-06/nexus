const Goal = require('../../models/Goal');
const GoalTask = require('../../models/GoalTask');
const Project = require('../../models/Project');
const ProjectFeature = require('../../models/ProjectFeature');
const LearningPath = require('../../models/LearningPath');
const Streak = require('../../models/Streak');
const Activity = require('../../models/Activity');

class RecommendationEngine {
  async generate(userId) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const todayStart = new Date(today);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [goals, tasks, projects, learningPaths, activities] = await Promise.all([
      Goal.find({ userId, status: 'active' }).sort({ priority: -1, progress: 1 }).lean(),
      GoalTask.find({ userId, status: { $ne: 'completed' } }).sort({ priority: -1, dueDate: 1 }).limit(20).lean(),
      Project.find({ userId, status: 'active' }).sort({ progress: 1 }).lean(),
      LearningPath.find({ userId, status: 'active' }).sort({ progress: 1 }).lean(),
      Activity.find({ userId }).sort({ date: -1 }).limit(14).lean(),
    ]);

    const recommendations = [];

    // 1. Highest priority incomplete task
    const topTask = tasks.find(t => t.priority === 'critical' || t.priority === 'high');
    if (topTask) recommendations.push({
      type: 'task',
      title: topTask.title,
      description: `Priority ${topTask.priority} task`,
      action: 'complete',
      refId: topTask._id,
      refType: 'task',
      urgency: 'high',
    });

    // 2. Goal needing attention (lowest progress active goal)
    const stalledGoal = goals.sort((a, b) => a.progress - b.progress)[0];
    if (stalledGoal && stalledGoal.progress < 50) recommendations.push({
      type: 'goal',
      title: `Work on "${stalledGoal.title}"`,
      description: `Only ${stalledGoal.progress}% complete`,
      action: 'focus',
      refId: stalledGoal._id,
      refType: 'goal',
      urgency: stalledGoal.progress < 25 ? 'high' : 'medium',
    });

    // 3. Project needing attention
    const stalledProject = projects.sort((a, b) => a.progress - b.progress)[0];
    if (stalledProject) recommendations.push({
      type: 'project',
      title: `Continue "${stalledProject.title}"`,
      description: `${stalledProject.progress}% complete`,
      action: 'continue',
      refId: stalledProject._id,
      refType: 'project',
      urgency: 'medium',
    });

    // 4. Learning path continuation
    if (learningPaths.length > 0) {
      const topPath = learningPaths[0];
      recommendations.push({
        type: 'learning',
        title: `Continue ${topPath.title}`,
        description: `${topPath.progress}% through path`,
        action: 'resume',
        refId: topPath._id,
        refType: 'learning',
        urgency: 'medium',
      });
    }

    // 5. Overdue tasks
    const overdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now).length;
    if (overdueCount > 0) recommendations.push({
      type: 'overdue',
      title: `${overdueCount} overdue task${overdueCount > 1 ? 's' : ''}`,
      description: 'Catch up on missed tasks',
      action: 'review',
      urgency: 'high',
    });

    // 6. Streak maintenance
    const streaks = await Streak.find({ userId }).lean();
    const bestStreak = streaks.length ? Math.max(...streaks.map(s => s.currentStreak)) : 0;
    if (bestStreak > 0) recommendations.push({
      type: 'streak',
      title: `Maintain your ${bestStreak}-day streak`,
      description: 'Complete a task today to keep it alive',
      action: 'maintain',
      urgency: 'medium',
    });

    // 7. Feature work from active project
    const activeProjectIds = projects.map(p => p._id);
    if (activeProjectIds.length > 0) {
      const pendingFeatures = await ProjectFeature.countDocuments({
        projectId: { $in: activeProjectIds },
        status: { $in: ['backlog', 'planned'] },
      });
      if (pendingFeatures > 0) recommendations.push({
        type: 'feature',
        title: `${pendingFeatures} pending feature${pendingFeatures > 1 ? 's' : ''}`,
        description: 'Ready to be started across your projects',
        action: 'plan',
        urgency: 'low',
      });
    }

    // 8. Activity-based recommendation
    const recentActive = activities.filter(a => a.score > 0).length;
    if (recentActive === 0) recommendations.push({
      type: 'start',
      title: 'Take the first step today',
      description: 'Begin with a small task to build momentum',
      action: 'begin',
      urgency: 'medium',
    });

    // Detect low activity
    const scores = activities.map(a => a.score || 0);
    const recentAvg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    if (recentAvg < 20 && activities.length >= 3) recommendations.push({
      type: 'recovery',
      title: 'Let us rebuild momentum',
      description: 'Try a 5-minute task to get started',
      action: 'start_small',
      urgency: 'medium',
    });

    return recommendations.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.urgency] || 1) - (order[b.urgency] || 1);
    });
  }
}

module.exports = new RecommendationEngine();
