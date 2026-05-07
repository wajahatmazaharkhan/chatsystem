const ActivityLog = require('../schema/ActivityLog');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * POST /v1/activity/log
 
 *
 * Expected body:
 * {
 *   user_id: string,
 *   activity_type: 'LOGIN',
 *   timestamp: ISO string (UTC)
 * }
 *
 
 */

const logLogin = async (req, res) => {
  try {
    const { user_id, activity_type, timestamp } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required',
      });
    }

    if (!activity_type || activity_type !== 'LOGIN') {
      return res.status(400).json({
        success: false,
        message: 'activity_type must be LOGIN',
      });
    }

    if (!timestamp) {
      return res.status(400).json({
        success: false,
        message: 'timestamp is required',
      });
    }

    const loginLog = new ActivityLog({
      event_id: uuidv4(),
      user_id,
      activity_type: 'LOGIN',
      activity_subtype: null,
      group_id: null,              // null for LOGIN — no group context
      source_timestamp: new Date(timestamp),
      metadata: {},
      timestamp: new Date(),       // ingestion time
    });

    const saved = await loginLog.save();

    logger.info(`LOGIN logged — user: ${user_id}`);

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

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate event — login already logged',
      });
    }

    logger.error('Error logging login:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to log login activity',
    });
  }
};
/**
 * GET /v1/activity/log/login/:user_id
 * Returns login history for a specific user
 * Admin and Manager only
 */
const getLoginHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const logs = await ActivityLog.find({
      user_id: id,
      activity_type: 'LOGIN'
    })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .select('event_id user_id activity_type source_timestamp metadata timestamp');

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No login history found for user ${id}`,
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        user_id: id,
        total_logins: logs.length,
        login_history: logs,
      },
    });

  } catch (err) {
    logger.error('Error fetching login history:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch login history',
    });
  }
};
 
module.exports = { logLogin, getLoginHistory };