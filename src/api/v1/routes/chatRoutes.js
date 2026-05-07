const express = require('express');
const router = express.Router();
const validateAuth = require('../../../middleware/authMiddleware');
const checkGroupAccess = require('../../../middleware/groupMiddleware');
const { send, getHistory, remove } = require('../controllers/chatController');

// Apply authentication to all chat routes
router.use(validateAuth);

/**
 * POST /v1/chat/send
 * Sends a message to a group.
 * Body: { group_id, content }
 */
router.post('/send', checkGroupAccess, send);

/**
 * GET /v1/chat/history/:group_id
 * Retrieves last 50 messages for a group (newest first).
 */
router.get('/history/:group_id', checkGroupAccess, getHistory);

/**
 * DELETE /v1/chat/message/:message_id
 * Soft-deletes a message. Only the original sender can do this.
 */
router.delete('/message/:message_id', remove);

module.exports = router;