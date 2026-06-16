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

        source_timestamp: data.source_timestamp  // source_timestamp = actual event time from source module
            ? new Date(data.source_timestamp) 
            : new Date(),
            
        timestamp: new Date()  // timestamp = ingestion time when saved in Activity Service DB
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

const fetchStudentsInactivityStatus = async (studentIds) => {
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return [];
    }

    // Convert string IDs to Mongoose ObjectIds for aggregation filtering
    const mongoose = require('mongoose');
    const objectIds = studentIds.map(id => new mongoose.Types.ObjectId(id));

    // Aggregate to get the latest LOGIN timestamp for each student ID
    const latestLogins = await ActivityLog.aggregate([
        { 
            $match: { 
                user_id: { $in: objectIds }, 
                activity_type: 'LOGIN' 
            } 
        },
        { 
            $sort: { timestamp: -1 } 
        },
        { 
            $group: { 
                _id: '$user_id', 
                last_login: { $first: '$timestamp' } 
            } 
        }
    ]);

    const latestLoginMap = new Map(latestLogins.map(log => [log._id.toString(), log.last_login]));
    const now = new Date();
    const thresholdMs = 96 * 60 * 60 * 1000; 

    return studentIds.map(id => {
        const lastLogin = latestLoginMap.get(id);
        let status = 'inactive'; // Default to inactive if no login log exists
        
        if (lastLogin) {
            const timeElapsed = now - new Date(lastLogin);
            status = timeElapsed >= thresholdMs ? 'inactive' : 'active';
        }

        return {
            user_id: id,
            last_login: lastLogin || null,
            status: status
        };
    });
};

module.exports = {
    createActivityLog,
    fetchUserActivityLogs,
    fetchStudentsInactivityStatus
}