const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

router.use((req, res, next) => {
  console.log(`[PROJECT] ${req.method} ${req.originalUrl}`);
  next();
});

router.use(protect);

// ── Dashboard / Search ──
router.get('/dashboard', projectController.dashboard);
router.get('/search', projectController.search);

// ── CRUD ──
router.get('/', projectController.list);
router.post('/', projectController.create);
router.get('/:projectId', projectController.getById);
router.put('/:projectId', projectController.update);
router.delete('/:projectId', projectController.remove);

// ── Stats / Timeline / Version ──
router.get('/:projectId/stats', projectController.stats);
router.get('/:projectId/timeline', projectController.timeline);
router.get('/:projectId/version', projectController.versionReport);

// ── Features ──
router.get('/:projectId/features', projectController.listFeatures);
router.post('/:projectId/features', projectController.createFeature);
router.put('/:projectId/features/:featureId', projectController.updateFeature);
router.delete('/:projectId/features/:featureId', projectController.deleteFeature);

// ── Sprints ──
router.get('/:projectId/sprints', projectController.listSprints);
router.post('/:projectId/sprints', projectController.createSprint);
router.put('/:projectId/sprints/:sprintId', projectController.updateSprint);
router.delete('/:projectId/sprints/:sprintId', projectController.deleteSprint);

// ── Bugs ──
router.get('/:projectId/bugs', projectController.listBugs);
router.post('/:projectId/bugs', projectController.createBug);
router.put('/:projectId/bugs/:bugId', projectController.updateBug);
router.delete('/:projectId/bugs/:bugId', projectController.deleteBug);

module.exports = router;
