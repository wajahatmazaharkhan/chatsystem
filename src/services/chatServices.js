const Message = require('../../../schema/Message');

/**
 * Saves a new message to the database.
 * @param {string} group_id
 * @param {string} sender_id
 * @param {string} content
 * @returns {Promise<Message>}
 */
const sendMessage = async (group_id, sender_id, content) => {
    const message = new Message({ group_id, sender_id, content });
    await message.save();
    return message;
};

/**
 * Retrieves the last 50 messages for a group, sorted newest first.
 * @param {string} group_id
 * @returns {Promise<Message[]>}
 */
const getGroupHistory = async (group_id) => {
    return await Message.find({ group_id })
        .sort({ sent_at: -1 })
        .limit(50);
};

/**
 * Soft-deletes a message by setting deleted_at.
 * Only the original sender can delete their own message.
 * @param {string} message_id
 * @param {string} user_id
 * @returns {Promise<Message|null>}
 */
const deleteMessage = async (message_id, user_id) => {
    const message = await Message.findOneAndUpdate(
        { _id: message_id, sender_id: user_id },
        { deleted_at: new Date() },
        { new: true }
    );
    return message; // null if not found or not the sender
};

module.exports = { sendMessage, getGroupHistory, deleteMessage };
