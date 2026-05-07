const mongoose = require("mongoose");
const Message = require("../../../../schema/Message");

//soft-delete message
exports.deleteMessage = async function deleteMessage(req, res, next) {
  try {
    const { message_id } = req.params;
    const user = req.user;

    if (!mongoose.isValidObjectId(message_id)) {
      return res.status(400).json({
        code: "ERR_INVALID_MESSAGE_ID",
        message: "Invalid message_id",
      });
    }

    const message = await Message.findById(message_id);

    if (!message) {
      return res.status(404).json({
        code: "ERR_NOT_FOUND",
        message: "Message not found",
      });
    }

    if (message.sender_id.toString() !== user.user_id) {
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