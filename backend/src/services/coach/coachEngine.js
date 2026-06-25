const CoachReport = require('../../models/CoachReport');
const productivityCalculator = require('./productivityCalculator');
const recommendationEngine = require('./recommendationEngine');
const insightGenerator = require('./insightGenerator');
const MemoryEngine = require('../../memory/engine/MemoryEngine');

class CoachEngine {
  async getDailyBrief(userId, forceRefresh = false) {
    const today = new Date().toISOString().split('T')[0];
    if (!forceRefresh) {
      const cached = await CoachReport.findOne({ userId, type: 'daily_brief', date: today }).lean();
      if (cached && Date.now() - new Date(cached.generatedAt).getTime() < 3600000) return cached.data;
    }
    const brief = await insightGenerator.generateDailyBrief(userId);
    await CoachReport.findOneAndUpdate(
      { userId, type: 'daily_brief', date: today },
      { userId, type: 'daily_brief', date: today, data: brief, generatedAt: new Date() },
      { upsert: true, new: true }
    );
    return brief;
  }

  async getDailyReview(userId, forceRefresh = false) {
    const today = new Date().toISOString().split('T')[0];
    if (!forceRefresh) {
      const cached = await CoachReport.findOne({ userId, type: 'daily_review', date: today }).lean();
      if (cached) return cached.data;
    }
    const review = await insightGenerator.generateDailyReview(userId);
    await CoachReport.findOneAndUpdate(
      { userId, type: 'daily_review', date: today },
      { userId, type: 'daily_review', date: today, data: review, generatedAt: new Date() },
      { upsert: true, new: true }
    );
    if (review.completedCount > 0) {
      await MemoryEngine.save(userId, 'daily_review', `daily_review:${today}`, {
        date: today,
        tasksCompleted: review.completedCount,
        productivityScore: review.productivityScore,
      }, { source: 'system', tags: ['coach', 'daily', 'productivity'] }).catch(() => {});
    }
    return review;
  }

  async getWeeklyReview(userId, forceRefresh = false) {
    const now = new Date();
    const weekEnd = now.toISOString().split('T')[0];
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const cacheKey = `${weekStart.toISOString().split('T')[0]}_${weekEnd}`;
    if (!forceRefresh) {
      const cached = await CoachReport.findOne({ userId, type: 'weekly_review', date: cacheKey }).lean();
      if (cached) return cached.data;
    }
    const review = await insightGenerator.generateWeeklyReview(userId);
    await CoachReport.findOneAndUpdate(
      { userId, type: 'weekly_review', date: cacheKey },
      { userId, type: 'weekly_review', date: cacheKey, data: review, generatedAt: new Date() },
      { upsert: true, new: true }
    );
    if (review.achievements.length > 0) {
      const achievKey = `weekly:${cacheKey}`;
      await MemoryEngine.save(userId, 'weekly_milestone', achievKey, {
        week: cacheKey,
        achievements: review.achievements,
        studyHours: review.studyHours,
        tasksCompleted: review.completedTasks,
        avgProductivityScore: review.avgProductivityScore,
      }, { source: 'system', tags: ['coach', 'weekly', 'milestone'] }).catch(() => {});
    }
    return review;
  }

  async getProductivityScores(userId) {
    return productivityCalculator.getFullScoreBreakdown(userId);
  }

  async getRecommendations(userId) {
    return recommendationEngine.generate(userId);
  }

  async getMotivationalMessage(userId) {
    const brief = await this.getDailyBrief(userId);
    return { message: brief.motivationalMessage, date: brief.date, streak: brief.currentStreak };
  }

  async getCoachCard(userId) {
    const [scores, recommendations, brief] = await Promise.all([
      this.getProductivityScores(userId),
      this.getRecommendations(userId),
      this.getDailyBrief(userId),
    ]);
    return {
      greeting: brief.greeting,
      todaysFocus: brief.todaysFocus,
      productivityScore: scores.daily,
      weeklyScore: scores.weekly,
      monthlyScore: scores.monthly,
      bestStreak: brief.currentStreak,
      topRecommendation: recommendations[0] || null,
      topGoal: brief.highestPriorityGoal,
      motivationalMessage: brief.motivationalMessage,
    };
  }
}

module.exports = new CoachEngine();
