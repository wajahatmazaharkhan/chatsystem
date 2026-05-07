const express = require('express');
const router = express.Router();
const validateAuth = require('../../../middleware/authMiddleware');
const checkGroupAccess = require('../../../middleware/groupMiddleware');
const Message = require('../../../../schema/Message');
const chatController = require('../controllers/chatController')

// Apply authentication to all chat routes
router.use(validateAuth);

/**
 * POST /v1/chat/send
 * Sends a message and logs activity to Module 5.
 */
router.post('/send', checkGroupAccess, async (req, res) => {
    const { group_id, content } = req.body;
    const { user_id } = req.user;

    try {
        const newMessage = new Message({
            group_id,
            sender_id: user_id,
            content
        });
        await newMessage.save();

        
            try {

            // The logic for Emit event to Activity Module (Module 5)

            } catch (error) {
                console.error("Activity Logging Failed:", error.message);
            }

        res.status(201).json({
            status: "success",
            data: newMessage
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to process message" });
    }
});

/**
 * GET /v1/chat/history/:group_id
 * Retrieves last 50 messages for a group.
 */
router.get('/history/:group_id', checkGroupAccess, async (req, res) => {
    try {
        // Uses index { group_id: 1, sent_at: -1 } 
        const history = await Message.find({ group_id: req.params.group_id })
            .sort({ sent_at: -1 })
            .limit(50);

        res.status(200).json({ status: "success", data: history });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

/**
 * DELETE /v1/chat/:message_id
 * soft-delete message
 */

router.delete('/:message_id', checkGroupAccess, chatController.deleteMessage);

module.exports = router;