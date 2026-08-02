const ActivityLog = require("../models/ActivityLog");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const createActivityLog = async (data) => {
  if (!data.user_id) {
    const error = new Error("user_id is required");
    error.statusCode = 400;
    throw error;
  }

  if (!data.activity_type) {
    const error = new Error("activity_type is required");
    error.statusCode = 400;
    throw error;
  }

  const activity = await ActivityLog.create({
    event_id: uuidv4(),
    user_id: data.user_id,
    activity_type: data.activity_type,
    activity_subtype: data.activity_subtype || null,
    group_id: data.group_id || null,
    metadata: data.metadata || {},

    source_timestamp: data.source_timestamp // source_timestamp = actual event time from source module
      ? new Date(data.source_timestamp)
      : new Date(),

    timestamp: new Date(), // timestamp = ingestion time when saved in Activity Service DB
  });

  return activity;
};

const fetchUserActivityLogs = async (userId, query) => {
  const limit = parseInt(query.limit) || 50;
  const offset = parseInt(query.offset) || 0;

  return await ActivityLog.find({
    user_id: userId,
  })
    .sort({ timestamp: -1 })
    .skip(offset)
    .limit(limit);
};

const fetchStudentsInactivityStatus = async (studentIds) => {
  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return [];
  }

  // Convert string IDs to Mongoose ObjectIds for aggregation filtering
  const mongoose = require("mongoose");
  const objectIds = studentIds.map((id) => new mongoose.Types.ObjectId(id));

  // Aggregate to get the latest LOGIN timestamp for each student ID
  const latestLogins = await ActivityLog.aggregate([
    {
      $match: {
        user_id: { $in: objectIds },
        activity_type: "LOGIN",
      },
    },
    {
      $sort: { timestamp: -1 },
    },
    {
      $group: {
        _id: "$user_id",
        last_login: { $first: "$timestamp" },
      },
    },
  ]);

  const latestLoginMap = new Map(
    latestLogins.map((log) => [log._id.toString(), log.last_login]),
  );
  const now = new Date();
  const thresholdMs = 96 * 60 * 60 * 1000;

  return studentIds.map((id) => {
    const lastLogin = latestLoginMap.get(id);
    let status = "inactive"; // Default to inactive if no login log exists

    if (lastLogin) {
      const timeElapsed = now - new Date(lastLogin);
      status = timeElapsed >= thresholdMs ? "inactive" : "active";
    }

    return {
      user_id: id,
      last_login: lastLogin || null,
      status: status,
    };
  });
};

const getActivitySummary = async () => {
  const totalActivities = await ActivityLog.countDocuments();

  return {
    total_activities: totalActivities,
  };
};

const getActivityLogs = async ({
  page = 1,
  limit = 20,
  user_id,
  group_id,
  activity_type,
  activity_subtype,
  from,
  to,
}) => {
  const query = {};

  if (user_id) {
    query.user_id = user_id;
  }

  if (group_id) {
    query.group_id = group_id;
  }

  if (activity_type) {
    query.activity_type = activity_type;
  }

  if (activity_subtype) {
    query.activity_subtype = activity_subtype;
  }

  if (from || to) {
    query.timestamp = {};

    if (from) {
      query.timestamp.$gte = new Date(from);
    }

    if (to) {
      query.timestamp.$lte = new Date(to);
    }
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    ActivityLog.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const countActivitiesByUsersService = async (userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return {
      count: 0,
      activity_breakdown: {
        LOGIN: 0,
        MESSAGE: 0,
        INTERACTION: 0,
      },
    };
  }

  const mongoose = require("mongoose");

  const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));

  const activities = await ActivityLog.aggregate([
    {
      $match: {
        user_id: {
          $in: objectIds,
        },
      },
    },
    {
      $group: {
        _id: "$activity_type",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const breakdown = {
    LOGIN: 0,
    MESSAGE: 0,
    INTERACTION: 0,
  };

  let total = 0;

  activities.forEach((item) => {
    breakdown[item._id] = item.count;
    total += item.count;
  });

  return {
    count: total,
    activity_breakdown: breakdown,
  };
};

const queryActivitiesService = async ({
  user_ids = [],
  group_ids = [],
  activity_type,
  from,
  to,
  page = 1,
  limit = 15,
}) => {
  const query = {};

  // -------------------------
  // User / Group Filter
  // -------------------------

  const userObjectIds = user_ids.map((id) => new mongoose.Types.ObjectId(id));

  const groupObjectIds = group_ids.map((id) => new mongoose.Types.ObjectId(id));

  if (user_ids.length && group_ids.length) {
    query.$or = [
      // LOGIN belongs to batch students
      {
        activity_type: "LOGIN",
        user_id: {
          $in: userObjectIds,
        },
      },

      // MESSAGE belongs to batch groups
      {
        activity_type: "MESSAGE",
        group_id: {
          $in: groupObjectIds,
        },
      },

      // INTERACTION belongs to batch groups
      {
        activity_type: "INTERACTION",
        group_id: {
          $in: groupObjectIds,
        },
      },
    ];
  } else if (user_ids.length) {
    query.user_id = {
      $in: userObjectIds,
    };
  } else if (group_ids.length) {
    query.group_id = {
      $in: groupObjectIds,
    };
  }

  // -------------------------
  // Activity Type
  // -------------------------

  if (activity_type) {
    if (query.$or) {
      query.$or = query.$or.filter(
        (condition) => condition.activity_type === activity_type,
      );
    } else {
      query.activity_type = activity_type;
    }
  }

  // -------------------------
  // Date Filter
  // -------------------------

  if (from || to) {
    query.timestamp = {};

    if (from) {
      query.timestamp.$gte = new Date(from);
    }

    if (to) {
      const end = new Date(to);

      end.setHours(23, 59, 59, 999);

      query.timestamp.$lte = end;
    }
  }

  // -------------------------
  // Pagination
  // -------------------------

  const skip = (page - 1) * limit;

  // -------------------------
  // Mongo Query
  // -------------------------

  const [activities, total] = await Promise.all([
    ActivityLog.find(query)
      .sort({
        timestamp: -1,
      })
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    ActivityLog.countDocuments(query),
  ]);

  return {
    data: activities,

    pagination: {
      page: Number(page),

      limit: Number(limit),

      total,

      pages: Math.ceil(total / limit),
    },
  };
};

const getBatchSummaryService = async (batches = []) => {
  if (!Array.isArray(batches) || batches.length === 0) {
    return [];
  }

  const result = await Promise.all(
    batches.map(async (batch) => {
      const userIds = batch.student_ids.map(
        (id) => new mongoose.Types.ObjectId(id),
      );

      const summary = await ActivityLog.aggregate([
        {
          $match: {
            user_id: {
              $in: userIds,
            },
          },
        },

        {
          $group: {
            _id: "$activity_type",

            count: {
              $sum: 1,
            },
          },
        },
      ]);

      const breakdown = {
        LOGIN: 0,
        MESSAGE: 0,
        INTERACTION: 0,
      };

      let total = 0;

      summary.forEach((item) => {
        breakdown[item._id] = item.count;

        total += item.count;
      });

      return {
        batch_id: batch._id,

        total_activities: total,

        activity_breakdown: breakdown,
      };
    }),
  );

  return result;
};

module.exports = {
  createActivityLog,
  fetchUserActivityLogs,
  fetchStudentsInactivityStatus,
  getActivitySummary,
  getActivityLogs,
  countActivitiesByUsersService,
  queryActivitiesService,
  getBatchSummaryService,
};
