const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const learningController = require('../controllers/learningController');

router.use((req, res, next) => {
  console.log(`[LEARNING] ${req.method} ${req.originalUrl}`);
  next();
});

router.use(protect);

// ── Dashboard & Stats ──
router.get('/dashboard', learningController.dashboard);
router.get('/stats', learningController.stats);

// ── Search ──
router.get('/search', learningController.search);

// ── Revisions ──
router.get('/revisions/due', learningController.getDueRevisions);
router.patch('/revisions/:id/complete', learningController.completeRevision);

// ── Learning Paths ──
router.get('/', learningController.list);
router.post('/', learningController.create);
router.get('/:id', learningController.getById);
router.put('/:id', learningController.update);
router.delete('/:id', learningController.remove);

// ── Study Time ──
router.post('/:id/study', learningController.recordStudyTime);

// ── Topics ──
router.get('/:id/topics', learningController.listTopics);
router.post('/:id/topics', learningController.createTopic);
router.put('/topics/:topicId', learningController.updateTopic);
router.delete('/topics/:topicId', learningController.removeTopic);

// ── Topic Notes ──
router.get('/topics/:topicId/notes', learningController.getTopicNotes);
router.post('/topics/:topicId/notes', learningController.saveTopicNote);

// ── Practice Problems ──
router.get('/problems', learningController.listProblems);
router.post('/problems', learningController.createProblem);
router.put('/problems/:id', learningController.updateProblem);
router.delete('/problems/:id', learningController.removeProblem);

module.exports = router;
