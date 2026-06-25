const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

router.use((req, res, next) => {
  console.log(`[TASK] ${req.method} ${req.originalUrl}`);
  next();
});

router.use(protect);

// ── Dashboard / Stats / Plan ──
router.get('/dashboard', taskController.dashboard);
router.get('/stats', taskController.stats);
router.get('/plan', taskController.dailyPlan);

// ── AI Generation ──
router.post('/generate/goal/:goalId', taskController.generateFromGoal);
router.post('/generate/learning/:pathId', taskController.generateFromLearning);

// ── CRUD ──
router.get('/', taskController.list);
router.post('/', taskController.create);
router.get('/:taskId', taskController.getById);
router.put('/:taskId', taskController.update);
router.patch('/:taskId/toggle', taskController.toggle);
router.delete('/:taskId', taskController.remove);

module.exports = router;
