const { createActivityLog, fetchUserActivityLogs } = require('../services/activity.service')

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

module.exports = {
    logActivity,
    getuserActivity
}