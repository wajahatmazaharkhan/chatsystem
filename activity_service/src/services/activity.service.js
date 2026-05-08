const ActivityLog = require('../models/ActivityLog')
const { v4: uuidv4 } = require('uuid')

const createActivityLog = async (data) => {
    if(!data.user_id){
        const error = new Error('user_id is required')
        error.statusCode = 400
        throw error
    }

    if(!data.activity_type){
        const error = new Error('activity_type is required')
        error.statusCode = 400
        throw error
    }

    const activity = await ActivityLog.create({
        event_id: uuidv4(),
        user_id: data.user_id,
        activity_type: data.activity_type,
        activity_subtype: data.activity_subtype || null,
        group_id: data.group_id || null,
        metadata: data.metadata || {},
        source_timestamp: data.source_timestamp 
            ? new Date(data.source_timestamp) 
            : new Date(),
        timestamp: new Date()
    })

    return activity
}

const fetchUserActivityLogs = async (userId, query) => {
    const limit = parseInt(query.limit) || 50
    const offset = parseInt(query.offset) || 0

    return await ActivityLog.find({
        user_id: userId
    })
    .sort({ timestamp: -1 })
    .skip(offset)
    .limit(limit)   
}

module.exports = {
    createActivityLog,
    fetchUserActivityLogs
}