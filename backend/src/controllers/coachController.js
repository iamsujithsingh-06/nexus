const coachService = require('../services/coachService');

exports.getCoachCard = async (req, res, next) => {
  try {
    const card = await coachService.getCoachCard(req.user._id);
    res.json({ success: true, card });
  } catch (error) { next(error); }
};

exports.getDailyBrief = async (req, res, next) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const brief = await coachService.getDailyBrief(req.user._id, forceRefresh);
    res.json({ success: true, brief });
  } catch (error) { next(error); }
};

exports.getDailyReview = async (req, res, next) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const review = await coachService.getDailyReview(req.user._id, forceRefresh);
    res.json({ success: true, review });
  } catch (error) { next(error); }
};

exports.getWeeklyReview = async (req, res, next) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const review = await coachService.getWeeklyReview(req.user._id, forceRefresh);
    res.json({ success: true, review });
  } catch (error) { next(error); }
};

exports.getProductivityScores = async (req, res, next) => {
  try {
    const scores = await coachService.getProductivityScores(req.user._id);
    res.json({ success: true, scores });
  } catch (error) { next(error); }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await coachService.getRecommendations(req.user._id);
    res.json({ success: true, recommendations });
  } catch (error) { next(error); }
};

exports.getMotivationalMessage = async (req, res, next) => {
  try {
    const msg = await coachService.getMotivationalMessage(req.user._id);
    res.json({ success: true, ...msg });
  } catch (error) { next(error); }
};

exports.getFullDashboard = async (req, res, next) => {
  try {
    const dashboard = await coachService.getFullCoachDashboard(req.user._id);
    res.json({ success: true, ...dashboard });
  } catch (error) { next(error); }
};
