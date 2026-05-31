const ActivityLog = require('../schema/ActivityLog');

exports.logMessageEvent = async ({ user_id, group_id, message_id }) => {
  try {
    await ActivityLog.create({
      event_id: new Date().getTime().toString(), // simple unique id
      user_id,
      activity_type: 'MESSAGE',
      activity_subtype: 'MESSAGE_SENT',
      group_id,
      metadata: {
        message_id,
        group_id,
      },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Activity Log Error:', err);
  }
};