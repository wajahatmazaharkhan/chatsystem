const axios = require("axios");

// API Gateway URL - in a real scenario, this would be set in environment variables
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:5000";

/*
==================================================
ADMIN DASHBOARD
==================================================
*/

exports.getAdminAnalytics = async (token, query = {}) => {
  try {
    const config = {
      headers: {
        Authorization: token,
      },
    };

    const { batch_id } = query;

    // Analytics Service consumes data from other modules instead of using its own DB.
    const [usersRes, groupsRes, batchesRes, statusRes, activityRes] =
      await Promise.all([
        axios
          .get(`${API_GATEWAY_URL}/users`, config)
          .catch(() => ({ data: { items: [] } })),
        axios
          .get(`${API_GATEWAY_URL}/groups`, config)
          .catch(() => ({ data: { data: [] } })),
        axios
          .get(`${API_GATEWAY_URL}/batches`, config)
          .catch(() => ({ data: { data: [] } })),
        axios
          .get(`${API_GATEWAY_URL}/status/all`, config)
          .catch(() => ({ data: [] })),
        axios.get(`${API_GATEWAY_URL}/activity/summary`, config),
      ]);

    const users = usersRes.data.items || [];
    const groups =
      groupsRes.data.data || groupsRes.data.groups || groupsRes.data || [];
    const batches =
      batchesRes.data.data || batchesRes.data.items || batchesRes.data || [];
    const statuses = statusRes.data.users || statusRes.data || [];

    // ==================================================
    // Batch Filter
    // ==================================================

    if (batch_id) {
      const batch = batches.find((b) => String(b._id) === String(batch_id));

      if (!batch) {
        throw new Error("Batch not found");
      }

      const studentIds = (batch.student_ids || []).map(String);

      const studentSet = new Set(studentIds);

      const students = users.filter(
        (u) =>
          u.role === "STUDENT" && studentSet.has(String(u.user_id || u._id)),
      );

      const total_students = students.length;

      let active_students = 0;
      let inactive_students = 0;

      statuses.forEach((status) => {
        if (studentSet.has(String(status.user_id))) {
          if (status.status === "ACTIVE") {
            active_students++;
          } else {
            inactive_students++;
          }
        }
      });

      const activityResponse = await axios.post(
        `${API_GATEWAY_URL}/activity/count-by-users`,

        {
          user_ids: studentIds,
        },

        config,
      );

      const activity = activityResponse.data;

      return {
        batch_id: batch._id,

        batch_name: batch.name,

        total_students,

        active_students,

        inactive_students,

        engagement_rate: total_students
          ? Number(((active_students / total_students) * 100).toFixed(2))
          : 0,

        total_activities: activity.count || 0,

        login_count: activity.activity_breakdown?.LOGIN || 0,

        message_count: activity.activity_breakdown?.MESSAGE || 0,

        interaction_count: activity.activity_breakdown?.INTERACTION || 0,
      };
    }

    const total_users = users.length;
    let students_count = 0;
    let managers_count = 0;
    let admins_count = 0;

    users.forEach((user) => {
      if (user.role === "STUDENT") students_count++;
      else if (user.role === "MANAGER") managers_count++;
      else if (user.role === "ADMIN") admins_count++;
    });

    const total_groups = Array.isArray(groups) ? groups.length : 0;
    const total_batches = Array.isArray(batches) ? batches.length : 0;
    const activitySummary = activityRes.data.data || {};

    const userRoleMap = new Map();
    users.forEach((user) => {
      const uId = user.user_id || (user._id ? user._id.toString() : "");
      if (uId) {
        userRoleMap.set(uId, user.role);
      }
    });

    let active_students = 0;
    let inactive_students = 0;

    if (Array.isArray(statuses)) {
      statuses.forEach((statusObj) => {
        const uId = statusObj.user_id ? statusObj.user_id.toString() : "";
        const role = userRoleMap.get(uId);
        if (role === "STUDENT") {
          if (statusObj.status === "ACTIVE") active_students++;
          else inactive_students++;
        }
      });
    }

    const engagement_rate =
      students_count > 0
        ? parseFloat(((active_students / students_count) * 100).toFixed(2)) || 0
        : 0;

    return {
      total_users,
      students_count,
      managers_count,
      admins_count,
      total_groups,
      total_batches,
      active_students,
      inactive_students,
      engagement_rate,
      total_activities: activitySummary.total_activities || 0,
      total_messages: 0, // No global message count API available yet
    };
  } catch (error) {
    throw new Error("Failed to fetch admin analytics: " + error.message);
  }
};

/*
==================================================
GROUP DASHBOARD
==================================================
*/

exports.getGroupAnalytics = async (group_id, token) => {
  try {
    const config = {
      headers: {
        Authorization: token,
      },
    };

    // Fetch group details, student statuses, and message history
    const [groupRes, statusRes, chatRes] = await Promise.all([
      axios
        .get(`${API_GATEWAY_URL}/groups/${group_id}`, config)
        .catch(() => ({ data: { data: {} } })),
      axios
        .get(`${API_GATEWAY_URL}/status/group/${group_id}`, config)
        .catch(() => ({
          data: { students: [], active_students: 0, inactive_students: 0 },
        })),
      axios
        .get(`${API_GATEWAY_URL}/chat/history/${group_id}`, config)
        .catch(() => ({ data: { data: [] } })),
    ]);

    const group = groupRes.data.data || groupRes.data || {};
    const groupStatus = statusRes.data || {
      students: [],
      active_students: 0,
      inactive_students: 0,
    };
    const chatHistory = chatRes.data.data || chatRes.data || [];

    return {
      group_id,
      group_name: group.name || `Group ${group_id}`,
      manager_id: group.manager_id || "Unknown",
      total_students: Array.isArray(group.members) ? group.members.length : 0,
      active_students:
        groupStatus.active_count || groupStatus.active_students || 0,
      inactive_students:
        groupStatus.inactive_count || groupStatus.inactive_students || 0,
      message_count: chatHistory.length || 0,
      students: groupStatus.students || [],
    };
  } catch (error) {
    throw new Error("Failed to fetch group analytics: " + error.message);
  }
};

/*
==================================================
STUDENT DASHBOARD
==================================================
*/
exports.getStudentAnalytics = async (userId, token) => {
  try {
    const config = {
      headers: {
        Authorization: token,
      },
    };

    // 1. Fetch user's activity logs
    let logs = [];
    try {
      const activityRes = await axios.get(
        `${API_GATEWAY_URL}/activity/user/${userId}`,
        config,
      );
      logs = activityRes.data.data || [];
    } catch (activityErr) {
      console.error(
        "Failed to fetch activity logs in analytics service:",
        activityErr.message,
      );
    }

    // 2. Fetch user's status for the ACTIVE/INACTIVE state & group ID
    let statusObj = { status: "INACTIVE", group_id: null };
    try {
      const statusRes = await axios.get(
        `${API_GATEWAY_URL}/status/user/${userId}`,
        config,
      );
      if (statusRes.data) {
        statusObj = statusRes.data;
      }
    } catch (statusErr) {
      console.error(
        "Failed to fetch status in analytics service:",
        statusErr.message,
      );
    }

    // --- Compute stats ---
    // A. Login Frequency
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const loginActivities = logs.filter((activity) => {
      if (activity.activity_type !== "LOGIN") return false;
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startOfWeek && activityDate <= endOfWeek;
    });

    const uniqueLoginDaysSet = new Set(
      loginActivities.map(
        (activity) => new Date(activity.timestamp).toISOString().split("T")[0],
      ),
    );
    const loginDays = uniqueLoginDaysSet.size;

    let loginStatus = "Inactive";
    if (loginDays > 0) {
      if (loginDays <= 2) loginStatus = "Low";
      else if (loginDays <= 5) loginStatus = "Medium";
      else loginStatus = "Highly Active";
    }

    // B. Message Volume (all-time or in retrieved logs)
    const messageActivities = logs.filter(
      (activity) => activity.activity_type === "MESSAGE",
    );
    const messageCount = messageActivities.length;

    let messageStatus = "No Engagement";
    if (messageCount > 0) {
      if (messageCount <= 3) messageStatus = "Low";
      else if (messageCount <= 10) messageStatus = "Medium";
      else messageStatus = "High";
    }

    // C. Engagement Score
    const engagementScore = Number(
      (loginDays * 0.4 + messageCount * 0.4).toFixed(1),
    );

    // D. Streak & Badge
    const uniqueDays = [
      ...new Set(
        logs.map(
          (activity) =>
            new Date(activity.timestamp).toISOString().split("T")[0],
        ),
      ),
    ];
    uniqueDays.sort((a, b) => new Date(a) - new Date(b));

    let streak = uniqueDays.length > 0 ? 1 : 0;
    let maxStreak = streak;

    for (let i = 1; i < uniqueDays.length; i++) {
      const previousDay = new Date(uniqueDays[i - 1]);
      const currentDay = new Date(uniqueDays[i]);
      const diff = (currentDay - previousDay) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }

    let badge = "Bronze";
    if (maxStreak > 5) {
      if (maxStreak <= 10) badge = "Silver";
      else badge = "Gold";
    }

    const stats = [
      {
        title: "Login Frequency",
        value: `${loginDays} Days`,
        sub: `Status: ${loginStatus}`,
      },
      {
        title: "Message Volume",
        value: `${messageCount} Messages`,
        sub: `Status: ${messageStatus}`,
      },
      {
        title: "Engagement Score",
        value: engagementScore,
        sub: "Based on activity & logins",
      },
      {
        title: "Activity Streak",
        value: `${maxStreak} Days`,
        sub: `Badge: ${badge}`,
      },
    ];

    // --- Compute weeklyActivity chart data ---
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentWeekActivities = logs.filter((activity) => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startOfWeek && activityDate <= endOfWeek;
    });

    const countsByDay = {};
    daysOfWeek.forEach((d) => {
      countsByDay[d] = 0;
    });

    currentWeekActivities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      if (countsByDay[day] !== undefined) {
        countsByDay[day]++;
      }
    });

    const maxCount = Math.max(...Object.values(countsByDay), 1);
    const weeklyActivity = daysOfWeek.map((day) => ({
      day,
      value: Math.round((countsByDay[day] / maxCount) * 100),
    }));

    // --- Compute achievements ---
    const achievements = [];
    if (statusObj.status === "ACTIVE") {
      achievements.push("Consistent Participant");
    }
    if (maxStreak >= 5) {
      achievements.push("Streak Master: Active 5+ days in a row!");
    }
    if (messageCount >= 10) {
      achievements.push("Super Chatter: Sent over 10 messages!");
    }
    if (loginDays >= 3) {
      achievements.push("Weekly Regular: Logged in 3+ times this week!");
    }
    if (achievements.length === 0) {
      achievements.push(
        "First Steps: Getting started on your learning journey",
      );
    }

    return {
      stats,
      weeklyActivity,
      achievements,
    };
  } catch (error) {
    throw new Error("Failed to fetch student analytics: " + error.message);
  }
};

exports.getManagerAnalytics = async (managerId, token) => {
  try {
    const config = {
      headers: {
        Authorization: token,
      },
    };

    // 1. Fetch all groups
    const groupsRes = await axios.get(`${API_GATEWAY_URL}/groups`, config);
    const allGroups = groupsRes.data.groups || groupsRes.data.data || [];

    // 2. Filter groups managed by this manager
    const managedGroups = allGroups.filter((g) => g.manager_id === managerId);

    // 3. For each managed group, fetch details and status
    const groupDataPromises = managedGroups.map(async (group) => {
      const groupId = group._id || group.id;

      // Fetch status for this group
      let activeCount = 0;
      let inactiveCount = 0;
      try {
        const statusRes = await axios.get(
          `${API_GATEWAY_URL}/status/group/${groupId}`,
          config,
        );
        const groupStatus = statusRes.data || {};
        activeCount =
          groupStatus.active_count || groupStatus.active_students || 0;
        inactiveCount =
          groupStatus.inactive_count || groupStatus.inactive_students || 0;
      } catch (err) {
        console.error(
          `Failed to fetch status for group ${groupId}:`,
          err.message,
        );
      }

      const totalStudents = Array.isArray(group.members)
        ? group.members.length
        : 0;
      const rate =
        totalStudents > 0
          ? parseFloat(((activeCount / totalStudents) * 100).toFixed(1))
          : 0;

      return {
        name: group.name || `Group ${groupId}`,
        active: activeCount,
        inactive: inactiveCount,
        total: totalStudents,
        rate,
      };
    });

    const groupsWithStatus = await Promise.all(groupDataPromises);

    // Compute stats
    const totalGroups = managedGroups.length;
    const totalStudents = groupsWithStatus.reduce((acc, g) => acc + g.total, 0);
    const totalActiveStudents = groupsWithStatus.reduce(
      (acc, g) => acc + g.active,
      0,
    );
    const avgEngagement =
      totalGroups > 0
        ? parseFloat(
            (
              groupsWithStatus.reduce((acc, g) => acc + g.rate, 0) / totalGroups
            ).toFixed(1),
          )
        : 0;

    const stats = [
      {
        title: "Total Groups",
        value: totalGroups.toString(),
        sub: "Managed by you",
      },
      {
        title: "Total Students",
        value: totalStudents.toString(),
        sub: "Across all groups",
      },
      {
        title: "Active Students",
        value: totalActiveStudents.toString(),
        sub: "Currently active",
      },
      {
        title: "Avg Engagement",
        value: `${avgEngagement}%`,
        sub: "Average rate",
      },
    ];

    return {
      stats,
      groups: groupsWithStatus,
    };
  } catch (error) {
    throw new Error("Failed to fetch manager analytics: " + error.message);
  }
};

exports.getActivityLogs = async (authHeader, query = {}) => {
  const { batch_id } = query;

  const config = {
    headers: {
      Authorization: authHeader,
    },
  };

  const userConfig = {
    headers: {
      Authorization: authHeader,
    },
    params: {
      page: 1,
      limit: 1000,
    },
  };

  // ---------------------------------------
  // Get student ids if batch selected
  // ---------------------------------------

  let candidateUserIds = [];
  let groupIds = [];

  if (batch_id) {
    const batchRes = await axios.get(
      `${API_GATEWAY_URL}/batches/${batch_id}`,
      config,
    );

    const batch = batchRes.data;

    candidateUserIds = batch.batch.student_ids || [];

    const batchGroupsRes = await axios.get(
      `${API_GATEWAY_URL}/groups/batch/${batch_id}`,
      config,
    );

    groupIds = batchGroupsRes.data.groups.map((group) => group._id);
  }

  // ---------------------------------------
  // Fetch Remaining Services
  // ---------------------------------------

  const [usersRes, groupsRes, batchesRes, statusRes] = await Promise.all([
    axios.get(`${API_GATEWAY_URL}/users?limit=10000`, userConfig),

    axios.get(`${API_GATEWAY_URL}/groups`, config).catch(() => ({
      data: { groups: [] },
    })),

    axios.get(`${API_GATEWAY_URL}/batches`, config).catch(() => ({
      data: [],
    })),

    axios.get(`${API_GATEWAY_URL}/status/all`, config).catch(() => ({
      data: { users: [] },
    })),
  ]);

  // ---------------------------------------
  // Normalize Responses
  // ---------------------------------------

  const users = usersRes.data.items || [];

  const groups = groupsRes.data.groups || [];

  const batches = Array.isArray(batchesRes.data)
    ? batchesRes.data
    : batchesRes.data.batches || [];

  const statuses = statusRes.data.users || [];

  // ---------------------------------------
  // Build Candidate Users
  // ---------------------------------------

  if (!batch_id) {
    candidateUserIds = users.map((user) => String(user.user_id));
  }

  // Status Filter

  if (query.status) {
    const statusUserIds = statuses
      .filter((status) => status.status === query.status)
      .map((status) => String(status.user_id));

    candidateUserIds = candidateUserIds.filter((id) =>
      statusUserIds.includes(id),
    );
  }

  // ---------------------------------------
  // Search Filter
  // ---------------------------------------

  if (query.search?.trim()) {
    const keyword = query.search.trim().toLowerCase();

    const searchUserIds = users
      .filter((user) => {
        return (
          user.name?.toLowerCase().includes(keyword) ||
          user.email?.toLowerCase().includes(keyword)
        );
      })
      .map((user) => String(user.user_id));

    candidateUserIds = candidateUserIds.filter((id) =>
      searchUserIds.includes(id),
    );
  }

  // ---------------------------------------
  // Lookup Maps
  // ---------------------------------------

  const userMap = {};

  users.forEach((user) => {
    if (!user.user_id) return;

    userMap[String(user.user_id)] = user;
  });

  const groupMap = {};

  groups.forEach((group) => {
    if (!group._id) return;

    groupMap[String(group._id)] = group;
  });

  const batchMap = {};

  batches.forEach((batch) => {
    if (!batch._id) return;

    batchMap[String(batch._id)] = batch;
  });

  const statusMap = {};

  statuses.forEach((status) => {
    if (!status.user_id) return;

    statusMap[String(status.user_id)] = status;
  });

  // ---------------------------------------
  // Fetch Activities
  // ---------------------------------------

  const activityRes = await axios.post(
    `${API_GATEWAY_URL}/activity/query`,

    {
      user_ids: candidateUserIds,

      group_ids: groupIds,

      activity_type: query.activity_type || "",

      from: query.from || "",

      to: query.to || "",

      page: query.page || 1,

      limit: query.limit || 15,
    },

    config,
  );

  const activities = activityRes.data.data || [];

  const pagination = activityRes.data.pagination || {};

  // ---------------------------------------
  // Merge Data
  // ---------------------------------------

  const items = activities.map((activity) => {
    const user = userMap[String(activity.user_id)];

    const group = activity.group_id
      ? groupMap[String(activity.group_id)]
      : null;

    let batch = null;

    // MESSAGE / INTERACTION
    if (group && group.batch_id) {
      batch = batchMap[String(group.batch_id)];
    }

    // LOGIN
    else if (batch_id) {
      batch = batchMap[String(batch_id)];
    }

    const status = statusMap[String(activity.user_id)];

    return {
      id: activity._id,

      user_id: activity.user_id,

      user_name: user?.name || "Unknown",

      email: user?.email || "-",

      role: user?.role || "-",

      group_id: group?._id || null,

      group_name: group?.name || "-",

      batch_id: batch?._id || null,

      batch_name: batch?.name || "-",

      activity_type: activity.activity_type,

      activity_subtype: activity.activity_subtype,

      timestamp: activity.timestamp,

      status: status?.status || "UNKNOWN",

      last_active: status?.last_active || null,
    };
  });

  return {
    success: true,

    data: items,

    pagination,
  };
};

exports.getBatchOverview = async (authHeader) => {
  const authConfig = {
    headers: {
      Authorization: authHeader,
    },
  };

  // Fetch all batches and user statuses in parallel
  const [batchRes, statusRes] = await Promise.all([
    axios.get(`${API_GATEWAY_URL}/batches`, authConfig),
    axios.get(`${API_GATEWAY_URL}/status/all`, authConfig),
  ]);

  // Normalize responses
  const batches = Array.isArray(batchRes.data)
    ? batchRes.data
    : batchRes.data.batches || [];

  const statuses = statusRes.data.users || [];

  // Create lookup map for status
  const statusMap = {};

  statuses.forEach((user) => {
    statusMap[String(user.user_id)] = user;
  });

  const batchSummaryRes = await axios.post(
    `${API_GATEWAY_URL}/activity/batch-summary`,
    {
      batches: batches.map((batch) => ({
        _id: batch._id,
        student_ids: batch.student_ids || [],
      })),
    },
    authConfig,
  );

  const batchSummaryMap = {};

  batchSummaryRes.data.data.forEach((summary) => {
    batchSummaryMap[String(summary.batch_id)] = summary;
  });

  const result = batches.map((batch) => {
    const studentIds = (batch.student_ids || []).map(String);

    let activeStudents = 0;
    let inactiveStudents = 0;

    studentIds.forEach((id) => {
      const student = statusMap[id];

      if (!student) return;

      if (student.status === "ACTIVE") {
        activeStudents++;
      } else {
        inactiveStudents++;
      }
    });

    const totalStudents = studentIds.length;

    const summary = batchSummaryMap[String(batch._id)] || {};

    return {
      batch_id: batch._id,

      batch_name: batch.name,

      total_students: totalStudents,

      active_students: activeStudents,

      inactive_students: inactiveStudents,

      active_percentage:
        totalStudents === 0
          ? 0
          : Number(((activeStudents / totalStudents) * 100).toFixed(1)),

      inactive_percentage:
        totalStudents === 0
          ? 0
          : Number(((inactiveStudents / totalStudents) * 100).toFixed(1)),

      total_activities: summary.total_activities || 0,

      login_count: summary.activity_breakdown?.LOGIN || 0,

      message_count: summary.activity_breakdown?.MESSAGE || 0,

      interaction_count: summary.activity_breakdown?.INTERACTION || 0,
    };
  });

  // Sort batches alphabetically
  result.sort((a, b) => a.batch_name.localeCompare(b.batch_name));

  return {
    success: true,
    total_batches: result.length,
    data: result,
  };
};
