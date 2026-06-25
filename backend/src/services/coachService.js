const coachEngine = require('./coach/coachEngine');

class CoachService {
  async getDailyBrief(userId, forceRefresh) {
    return coachEngine.getDailyBrief(userId, forceRefresh);
  }

  async getDailyReview(userId, forceRefresh) {
    return coachEngine.getDailyReview(userId, forceRefresh);
  }

  async getWeeklyReview(userId, forceRefresh) {
    return coachEngine.getWeeklyReview(userId, forceRefresh);
  }

  async getProductivityScores(userId) {
    return coachEngine.getProductivityScores(userId);
  }

  async getRecommendations(userId) {
    return coachEngine.getRecommendations(userId);
  }

  async getMotivationalMessage(userId) {
    return coachEngine.getMotivationalMessage(userId);
  }

  async getCoachCard(userId) {
    return coachEngine.getCoachCard(userId);
  }

  async getFullCoachDashboard(userId) {
    const [card, recommendations, weeklyReview] = await Promise.all([
      coachEngine.getCoachCard(userId),
      coachEngine.getRecommendations(userId),
      coachEngine.getWeeklyReview(userId).catch(() => null),
    ]);
    return { card, recommendations, weeklyReview };
  }
}

module.exports = new CoachService();
