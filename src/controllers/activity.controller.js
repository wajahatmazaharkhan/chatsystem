const ActivityLog = require('../models/ActivityLog');
const { v4: uuidv4 } = require('uuid');

const logActivity = async (req, res) => {
  try {
    const { user_id, activity_type, timestamp, metadata = {} } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required',
      });
    }

    if (!activity_type) {
      return res.status(400).json({
        success: false,
        message: 'activity_type is required',
      });
    }

    if (!timestamp) {
      return res.status(400).json({
        success: false,
        message: 'timestamp is required',
      });
    }

    
    if (activity_type === 'LOGIN') {
      const loginLog = new ActivityLog({
        event_id: uuidv4(),
        user_id,
        activity_type: 'LOGIN',
        activity_subtype: null,
        group_id: null,
        source_timestamp: new Date(timestamp),
        metadata: {},
        timestamp: new Date(),
      });

      const saved = await loginLog.save();

      return res.status(201).json({
        success: true,
        message: 'Login activity logged successfully',
        data: {
          event_id: saved.event_id,
          user_id: saved.user_id,
          activity_type: saved.activity_type,
          source_timestamp: saved.source_timestamp,
          timestamp: saved.timestamp,
        },
      });
    }


    return res.status(400).json({
      success: false,
      message: `Unknown activity_type: ${activity_type}`,
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate event',
      });
    }
    console.error('Error logging activity:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to log activity',
    });
  }
};

const getActivityByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const logs = await ActivityLog.find({ user_id: id })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .select('event_id user_id activity_type source_timestamp metadata timestamp');

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No activity found for user ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user_id: id,
        total: logs.length,
        logs,
      },
    });

  } catch (err) {
    console.error('Error fetching activity:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
    });
  }
};

module.exports = { logActivity, getActivityByUser };