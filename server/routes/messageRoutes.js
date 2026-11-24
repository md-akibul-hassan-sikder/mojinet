const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getCustomerThread,
  getThreadWith,
  getConversations,
  getUnreadCount,
  markRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendMessage);
router.get('/thread', getCustomerThread);
router.get('/with/:userId', getThreadWith);
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.put('/read/:userId', markRead);

module.exports = router;