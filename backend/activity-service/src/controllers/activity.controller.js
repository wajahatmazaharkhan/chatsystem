const { createActivityLog, fetchUserActivityLogs, fetchStudentsInactivityStatus, getActivitySummary, getActivityLogs, countActivitiesByUsersService, queryActivitiesService, getBatchSummaryService } = require('../services/activity.services')

const logActivity = async(req, res, next) => {
    try{
        const activity = await createActivityLog(req.body)

        return res.status(201).json({
            success: true,
            message: 'Activity logged successfully',
            data: activity
        })
    } catch (err) {
        next(err)
    }
}

const getuserActivity = async(req, res, next) => {
    try {
        const logs = await fetchUserActivityLogs(
            req.params.id,
            req.query
        )

        return res.status(200).json({
            success: true,
            message: 'User activity logs retrieved successfully',
            data: logs
        })
    
    } catch (err) {
        next(err)
    }
}

const getStudentsInactivityReport = async (req, res, next) => {
    try {
        const { student_ids } = req.body;

        if (!student_ids || !Array.isArray(student_ids)) {
            const error = new Error('student_ids array is required in request body');
            error.statusCode = 400;
            return next(error);
        }

        const report = await fetchStudentsInactivityStatus(student_ids);

        return res.status(200).json({
            success: true,
            message: 'Students inactivity statuses generated successfully',
            data: report
        });
        
    } catch (err) {
        next(err);
    }
};

const getSummary = async (req, res, next) => {
  try {
    const summary = await getActivitySummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

const getLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      user_id,
      group_id,
      activity_type,
      activity_subtype,
      from,
      to,
    } = req.query;

    const result = await getActivityLogs({
      page: Number(page),
      limit: Number(limit),
      user_id,
      group_id,
      activity_type,
      activity_subtype,
      from,
      to,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const countActivitiesByUsers = async (req, res, next) => {
  try {
    const result = await countActivitiesByUsersService(
      req.body.user_ids
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

const queryActivities = async (req, res, next) => {
  try {
    const result =
      await queryActivitiesService(
        req.body
      );

    res.status(200).json({
      success: true,
      ...result,
    });

  } catch (err) {
    next(err);
  }
};

const getBatchSummary = async (req, res, next) => {
  try {

    const result =
      await getBatchSummaryService(
        req.body.batches || []
      );

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
    logActivity,
    getuserActivity,
    getStudentsInactivityReport,
    getSummary,
    getLogs,
    countActivitiesByUsers,
    queryActivities,
    getBatchSummary
}