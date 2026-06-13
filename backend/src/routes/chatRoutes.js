const { Router } = require('express');
const { body } = require('express-validator');
const {
  createChat,
  getUserChats,
  getChat,
  deleteChat,
  sendMessage,
} = require('../controllers/chatController');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = Router();

router.use(protect);

router.post('/', createChat);

router.get('/', getUserChats);

router.get('/:id', getChat);

router.delete('/:id', deleteChat);

router.post(
  '/message',
  [
    body('chatId').notEmpty().withMessage('Chat ID is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
  ],
  validate,
  sendMessage
);

module.exports = router;
