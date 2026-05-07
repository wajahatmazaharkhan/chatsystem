const mongoose = require('mongoose');
const Message = require('../../../../schema/Message');
const { sendMessage, getGroupHistory } = require('../services/chatServices');

/**
 * POST /v1/chat/send
 * Sends a message to a group.
 */
const send = async (req, res, next) => {
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
        next(error);
    }
};

/**
 * GET /v1/chat/history/:group_id
 * Returns the last 50 messages for a group.
 */
const getHistory = async (req, res, next) => {
    const { group_id } = req.params;

    try {
        const history = await getGroupHistory(group_id);
        return res.status(200).json({ status: "success", data: history });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /v1/chat/message/:message_id
 * Soft-deletes a message. Only the original sender can delete their own message.
 */
const remove = async (req, res, next) => {
    const { message_id } = req.params;
    const { user_id } = req.user;

    if (!mongoose.isValidObjectId(message_id)) {
        return res.status(400).json({
            code: "ERR_INVALID_MESSAGE_ID",
            message: "Invalid message_id",
        });
    }

    try {
        const message = await Message.findById(message_id);

        if (!message) {
            return res.status(404).json({
                code: "ERR_NOT_FOUND",
                message: "Message not found",
            });
        }

        if (message.sender_id.toString() !== user_id.toString()) {
            return res.status(403).json({
                code: "ERR_FORBIDDEN",
                message: "Cannot delete others' messages",
            });
        }

        message.deleted_at = new Date();
        await message.save();

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};

module.exports = { send, getHistory, remove };
