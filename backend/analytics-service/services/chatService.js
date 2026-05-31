const Message = require("../schema/Message");
const ActivityLog = require("../schema/ActivityLog");
const Group = require("../schema/Group");

exports.sendMessage = async (data) => {
  const { group_id, sender_id, content } = data;

  // ✅ GROUP VALIDATION
  const groupExists = await Group.findById(group_id);
  if (!groupExists) {
    throw new Error("Group not found");
  }

  // ✅ SAVE MESSAGE
  const message = await Message.create({
    group_id,
    sender_id,
    content,
  });

  // ✅ ACTIVITY LOG
  await ActivityLog.create({
    event_id: Date.now().toString(),
    user_id: sender_id,
    activity_type: "MESSAGE",
    activity_subtype: "MESSAGE_SENT",
    group_id,
    metadata: {
      message_id: message._id,
      content,
    },
    timestamp: new Date(),
  });

  return message;
};

exports.getMessages = async (groupId) => {
  const messages = await Message.find({ group_id: groupId })
    .sort({ sent_at: -1 });

  return messages;
};