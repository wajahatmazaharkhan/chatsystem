const mongoose = require('mongoose');
const axios = require('axios');
const Message = require('../schema/Message');
const ActivityLog = require('../schema/ActivityLog');
const Group = require('../schema/Group');
const UserStatus = require('../schema/UserStatus');

exports.sendMessage = async (data, token = null) => {
  const { group_id, sender_id, content } = data;

  // ✅ GROUP VALIDATION (Microservice URL vs Database Fallback)
  const groupServiceUrl = process.env.GROUP_SERVICE_URL || (process.env.GROUP_SERVICE ? `${process.env.GROUP_SERVICE}/groups/${group_id}/members` : null);

  if (!groupServiceUrl) {
    // Only validate ObjectId if we are falling back to DB lookup
    if (mongoose.Types.ObjectId.isValid(group_id)) {
      const groupExists = await Group.findById(group_id);
      if (!groupExists) {
        throw new Error('Group not found');
      }
    }
  }

  // ✅ SAVE MESSAGE
  const message = await Message.create({
    group_id,
    sender_id,
    content,
  });

  const authHeaders = token ? { Authorization: token } : {};

  // ✅ ACTIVITY LOG / EVENT EMISSION
  const activityServiceUrl = process.env.ACTIVITY_SERVICE_URL || 'http://localhost:3003/activity/log';
  const eventPayload = {
    event_id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    user_id: sender_id,
    activity_type: 'MESSAGE',
    activity_subtype: 'MESSAGE_SENT',
    group_id,
    metadata: {
      message_id: message._id.toString(),
      content,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await axios.post(activityServiceUrl, eventPayload, { headers: authHeaders });
  } catch (err) {
    console.error('Failed to emit MESSAGE_SENT to Activity Service. Falling back to local logging. Error:', err.message);
    await logLocally(eventPayload);
  }

  // ✅ STATUS SERVICE INTEGRATION — Mark sender as ACTIVE on every message sent
  const statusServiceUrl = process.env.STATUS_SERVICE_URL || (process.env.STATUS_SERVICE ? `${process.env.STATUS_SERVICE}/status/update` : null);
  const statusPayload = {
    user_id: sender_id,
    group_id,
    status: 'ACTIVE',
    last_active_at: new Date().toISOString(),
  };

  if (statusServiceUrl) {
    try {
      await axios.post(statusServiceUrl, statusPayload, { headers: authHeaders });
    } catch (err) {
      console.error('Failed to update status via Status Service. Falling back to local update. Error:', err.message);
      await updateStatusLocally(sender_id, group_id);
    }
  } else {
    await updateStatusLocally(sender_id, group_id);
  }

  // ✅ ANALYTICS INTEGRATION
  const analyticsServiceUrl = process.env.ANALYTICS_SERVICE_URL;
  if (analyticsServiceUrl) {
    try {
      await axios.post(`${analyticsServiceUrl}/track`, { event: 'MESSAGE_SENT', user_id: sender_id, group_id }, { headers: authHeaders });
    } catch (err) {
      console.error('Failed to send analytics data:', err.message);
    }
  }

  return message;
};

exports.getMessages = async (groupId) => {
  const messages = await Message.find({ group_id: groupId })
    .sort({ sent_at: -1 });

  return messages;
};

async function logLocally(payload) {
  try {
    await ActivityLog.create({
      event_id: payload.event_id,
      user_id: payload.user_id,
      activity_type: payload.activity_type,
      activity_subtype: payload.activity_subtype,
      group_id: payload.group_id,
      metadata: payload.metadata,
      timestamp: payload.timestamp,
    });
  } catch (err) {
    console.error('Failed to save activity log locally:', err.message);
  }
}

async function updateStatusLocally(userId, groupId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || (groupId && !mongoose.Types.ObjectId.isValid(groupId))) {
      console.warn('Skipping local status update due to invalid ObjectId format of userId or groupId');
      return;
    }
    await UserStatus.findOneAndUpdate(
      { user_id: userId, group_id: groupId },
      { status: 'ACTIVE', last_active_at: new Date() },
      { upsert: true }
    );
  } catch (err) {
    console.error('Failed to update status locally:', err.message);
  }
}