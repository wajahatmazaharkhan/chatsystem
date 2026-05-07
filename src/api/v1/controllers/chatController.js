const { sendMessage, getGroupHistory, deleteMessage } = require('../services/chatServices');

/**
 * POST /v1/chat/send
 * Sends a message to a group.
 */
const send = async (req, res) => {
    const { group_id, content } = req.body;
    const { user_id } = req.user;

    if (!group_id || !content) {
        return res.status(400).json({ error: "group_id and content are required" });
    }

    try {
        const message = await sendMessage(group_id, user_id, content);

        // TODO (Integration): Emit event to Activity Module (Module 5) here.

        return res.status(201).json({ status: "success", data: message });
    } catch (error) {
        console.error("send error:", error.message);
        return res.status(500).json({ error: "Failed to send message" });
    }
};

/**
 * GET /v1/chat/history/:group_id
 * Returns the last 50 messages for a group.
 */
const getHistory = async (req, res) => {
    const { group_id } = req.params;

    try {
        const history = await getGroupHistory(group_id);
        return res.status(200).json({ status: "success", data: history });
    } catch (error) {
        console.error("getHistory error:", error.message);
        return res.status(500).json({ error: "Failed to fetch history" });
    }
};

/**
 * DELETE /v1/chat/message/:message_id
 * Soft-deletes a message. Only the sender can delete their own message.
 */
const remove = async (req, res) => {
    const { message_id } = req.params;
    const { user_id } = req.user;

    try {
        const deleted = await deleteMessage(message_id, user_id);

        if (!deleted) {
            return res.status(404).json({ error: "Message not found or you are not the sender" });
        }

        return res.status(200).json({ status: "success", data: deleted });
    } catch (error) {
        console.error("remove error:", error.message);
        return res.status(500).json({ error: "Failed to delete message" });
    }
};

module.exports = { send, getHistory, remove };
