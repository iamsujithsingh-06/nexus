const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const goalController = require('../controllers/goalController');

// Log incoming requests
router.use((req, res, next) => {
  const reqId = req._reqId || 'no-id';
  console.log(`[GOAL_ROUTE:${reqId}] ${req.method} ${req.originalUrl} body=${req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body).substring(0, 500) : 'N/A'}`);
  next();
});

// All goal routes require authentication
router.use(protect);

// ── Dashboard ──
router.get('/dashboard', goalController.dashboard);
router.get('/coach', goalController.coachInsights);

// ── Achievements ──
router.get('/achievements', goalController.listAchievements);

// ── Activity ──
router.get('/activity', goalController.listActivity);

// ── Weekly Reports ──
router.get('/reports', goalController.listWeeklyReports);
router.post('/reports/generate', goalController.getWeeklyReport);

// ── Streaks ──
router.get('/streaks', goalController.listStreaks);

// ── Goals ──
router.get('/', goalController.list);
router.post('/', goalController.create);
router.get('/:id', goalController.getById);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.remove);

// ── Roadmap Phases ──
router.post('/:id/phases', goalController.addPhase);
router.delete('/:id/phases/:phaseId', goalController.removePhase);
router.put('/:id/phases/:phaseId', goalController.renamePhase);

// ── Milestones ──
router.get('/:id/milestones', goalController.listMilestones);
router.post('/:id/milestones', goalController.createMilestone);
router.put('/milestones/:milestoneId', goalController.editMilestone);
router.patch('/milestones/:milestoneId/toggle', goalController.toggleMilestone);
router.delete('/milestones/:milestoneId', goalController.deleteMilestone);

// ── Tasks (scoped under goals + standalone) ──
router.get('/:id/tasks', goalController.listTasks);
router.post('/:id/tasks', goalController.createTask);

// ── Standalone Task Routes ──
const taskRouter = express.Router();
taskRouter.use((req, res, next) => {
  const reqId = req._reqId || 'no-id';
  console.log(`[TASK_ROUTE:${reqId}] ${req.method} ${req.originalUrl} body=${req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body).substring(0, 500) : 'N/A'}`);
  next();
});
taskRouter.use(protect);
taskRouter.get('/', goalController.listTasks);
taskRouter.post('/', goalController.createTask);
taskRouter.put('/:taskId', goalController.updateTask);
taskRouter.patch('/:taskId/toggle', goalController.toggleTask);
taskRouter.delete('/:taskId', goalController.deleteTask);

module.exports = { goalRoutes: router, taskRoutes: taskRouter };
