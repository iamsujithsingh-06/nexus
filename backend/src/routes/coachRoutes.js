const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const coachController = require('../controllers/coachController');

router.use((req, res, next) => {
  console.log(`[COACH] ${req.method} ${req.originalUrl}`);
  next();
});

router.use(protect);

router.get('/card', coachController.getCoachCard);
router.get('/brief', coachController.getDailyBrief);
router.get('/review', coachController.getDailyReview);
router.get('/weekly', coachController.getWeeklyReview);
router.get('/productivity', coachController.getProductivityScores);
router.get('/recommendations', coachController.getRecommendations);
router.get('/motivation', coachController.getMotivationalMessage);
router.get('/dashboard', coachController.getFullDashboard);

module.exports = router;
