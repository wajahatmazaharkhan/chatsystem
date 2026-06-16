const { createActivityLog, fetchUserActivityLogs, fetchStudentsInactivityStatus } = require('../services/activity.services')

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

module.exports = {
    logActivity,
    getuserActivity,
    getStudentsInactivityReport
}