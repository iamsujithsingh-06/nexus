const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/memoryController');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = Router();

router.use(protect);

// ── List / Search ──
router.get('/', controller.list.bind(controller));

// ── Single memory CRUD ──
router.get('/:id', controller.getById.bind(controller));
router.post(
  '/',
  [
    body('type').notEmpty().withMessage('Memory type is required'),
    body('value').notEmpty().withMessage('Memory value is required'),
  ],
  validate,
  controller.create.bind(controller)
);
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

// ── Semantic search ──
router.post(
  '/search',
  [body('query').notEmpty().withMessage('Search query is required')],
  validate,
  controller.search.bind(controller)
);

// ── Profile summary ──
router.get('/summary', controller.summary.bind(controller));

// ── Consolidation ──
router.post('/consolidate', controller.consolidate.bind(controller));

// ── Stats ──
router.get('/stats', controller.stats.bind(controller));

// ── Categories ──
router.get('/categories', controller.categories.bind(controller));

// ── Batch ──
router.post(
  '/batch',
  [body('memories').isArray().withMessage('Memories must be an array')],
  validate,
  controller.batchCreate.bind(controller)
);

module.exports = router;
