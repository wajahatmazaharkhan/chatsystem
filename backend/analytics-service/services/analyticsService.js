const axios = require('axios');

// API Gateway URL - in a real scenario, this would be set in environment variables
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

/*
==================================================
ADMIN DASHBOARD
==================================================
*/

exports.getAdminAnalytics = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: token
      }
    };

    // Analytics Service consumes data from other modules instead of using its own DB.
    const [usersRes, groupsRes, statusRes] = await Promise.all([
      axios.get(`${API_GATEWAY_URL}/users`, config).catch(() => ({ data: { items: [] } })),
      axios.get(`${API_GATEWAY_URL}/groups`, config).catch(() => ({ data: { data: [] } })),
      axios.get(`${API_GATEWAY_URL}/status/all`, config).catch(() => ({ data: [] }))
    ]);

    const users = usersRes.data.items || [];
    const groups = groupsRes.data.data || groupsRes.data.groups || groupsRes.data || [];
    const statuses = statusRes.data.users || statusRes.data || [];

    const total_users = users.length;
    let students_count = 0;
    let managers_count = 0;
    let admins_count = 0;

    users.forEach(user => {
      if (user.role === 'STUDENT') students_count++;
      else if (user.role === 'MANAGER') managers_count++;
      else if (user.role === 'ADMIN') admins_count++;
    });

    const total_groups = Array.isArray(groups) ? groups.length : 0;

    const userRoleMap = new Map();
    users.forEach(user => {
      const uId = user.user_id || (user._id ? user._id.toString() : '');
      if (uId) {
        userRoleMap.set(uId, user.role);
      }
    });

    let active_students = 0;
    let inactive_students = 0;

    if (Array.isArray(statuses)) {
      statuses.forEach(statusObj => {
        const uId = statusObj.user_id ? statusObj.user_id.toString() : '';
        const role = userRoleMap.get(uId);
        if (role === 'STUDENT') {
          if (statusObj.status === 'ACTIVE') active_students++;
          else inactive_students++;
        }
      });
    }

    const engagement_rate = students_count > 0 ? parseFloat(((active_students / students_count) * 100).toFixed(2)) || 0 : 0;

    return {
      total_users,
      students_count,
      managers_count,
      admins_count,
      total_groups,
      active_students,
      inactive_students,
      engagement_rate,
      total_messages: 0 // No global message count API available yet
    };
  } catch (error) {
    throw new Error('Failed to fetch admin analytics: ' + error.message);
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
        Authorization: token
      }
    };

    // Fetch group details, student statuses, and message history
    const [groupRes, statusRes, chatRes] = await Promise.all([
      axios.get(`${API_GATEWAY_URL}/groups/${group_id}`, config).catch(() => ({ data: { data: {} } })),
      axios.get(`${API_GATEWAY_URL}/status/group/${group_id}`, config).catch(() => ({ data: { students: [], active_students: 0, inactive_students: 0 } })),
      axios.get(`${API_GATEWAY_URL}/chat/history/${group_id}`, config).catch(() => ({ data: { data: [] } }))
    ]);

    const group = groupRes.data.data || groupRes.data || {};
    const groupStatus = statusRes.data || { students: [], active_students: 0, inactive_students: 0 };
    const chatHistory = chatRes.data.data || chatRes.data || [];

    return {
      group_id,
      group_name: group.name || `Group ${group_id}`,
      manager_id: group.manager_id || 'Unknown',
      total_students: Array.isArray(group.members) ? group.members.length : 0,
      active_students: groupStatus.active_count || groupStatus.active_students || 0,
      inactive_students: groupStatus.inactive_count || groupStatus.inactive_students || 0,
      message_count: chatHistory.length || 0,
      students: groupStatus.students || []
    };
  } catch (error) {
    throw new Error('Failed to fetch group analytics: ' + error.message);
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
        Authorization: token
      }
    };

    // 1. Fetch user's activity logs
    const activityRes = await axios.get(`${API_GATEWAY_URL}/activity/user/${userId}`, config);
    const logs = activityRes.data.data || [];

    // 2. Fetch user's status for the ACTIVE/INACTIVE state & group ID
    let statusObj = { status: 'INACTIVE', group_id: null };
    try {
      const statusRes = await axios.get(`${API_GATEWAY_URL}/status/user/${userId}`, config);
      if (statusRes.data) {
        statusObj = statusRes.data;
      }
    } catch (statusErr) {
      console.error('Failed to fetch status in analytics service:', statusErr.message);
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

    const loginActivities = logs.filter(activity => {
      if (activity.activity_type !== 'LOGIN') return false;
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startOfWeek && activityDate <= endOfWeek;
    });

    const uniqueLoginDaysSet = new Set(
      loginActivities.map(activity => new Date(activity.timestamp).toISOString().split('T')[0])
    );
    const loginDays = uniqueLoginDaysSet.size;

    let loginStatus = 'Inactive';
    if (loginDays > 0) {
      if (loginDays <= 2) loginStatus = 'Low';
      else if (loginDays <= 5) loginStatus = 'Medium';
      else loginStatus = 'Highly Active';
    }

    // B. Message Volume (all-time or in retrieved logs)
    const messageActivities = logs.filter(activity => activity.activity_type === 'MESSAGE');
    const messageCount = messageActivities.length;

    let messageStatus = 'No Engagement';
    if (messageCount > 0) {
      if (messageCount <= 3) messageStatus = 'Low';
      else if (messageCount <= 10) messageStatus = 'Medium';
      else messageStatus = 'High';
    }

    // C. Engagement Score
    const engagementScore = Number((loginDays * 0.4 + messageCount * 0.4).toFixed(1));

    // D. Streak & Badge
    const uniqueDays = [
      ...new Set(
        logs.map(activity => new Date(activity.timestamp).toISOString().split('T')[0])
      )
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

    let badge = 'Bronze';
    if (maxStreak > 5) {
      if (maxStreak <= 10) badge = 'Silver';
      else badge = 'Gold';
    }

    const stats = [
      {
        title: 'Login Frequency',
        value: `${loginDays} Days`,
        sub: `Status: ${loginStatus}`
      },
      {
        title: 'Message Volume',
        value: `${messageCount} Messages`,
        sub: `Status: ${messageStatus}`
      },
      {
        title: 'Engagement Score',
        value: engagementScore,
        sub: 'Based on activity & logins'
      },
      {
        title: 'Activity Streak',
        value: `${maxStreak} Days`,
        sub: `Badge: ${badge}`
      }
    ];

    // --- Compute weeklyActivity chart data ---
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentWeekActivities = logs.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startOfWeek && activityDate <= endOfWeek;
    });

    const countsByDay = {};
    daysOfWeek.forEach(d => { countsByDay[d] = 0; });

    currentWeekActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (countsByDay[day] !== undefined) {
        countsByDay[day]++;
      }
    });

    const maxCount = Math.max(...Object.values(countsByDay), 1);
    const weeklyActivity = daysOfWeek.map(day => ({
      day,
      value: Math.round((countsByDay[day] / maxCount) * 100)
    }));

    // --- Compute achievements ---
    const achievements = [];
    if (statusObj.status === 'ACTIVE') {
      achievements.push('Consistent Participant');
    }
    if (maxStreak >= 5) {
      achievements.push('Streak Master: Active 5+ days in a row!');
    }
    if (messageCount >= 10) {
      achievements.push('Super Chatter: Sent over 10 messages!');
    }
    if (loginDays >= 3) {
      achievements.push('Weekly Regular: Logged in 3+ times this week!');
    }
    if (achievements.length === 0) {
      achievements.push('First Steps: Getting started on your learning journey');
    }

    return {
      stats,
      weeklyActivity,
      achievements
    };
  } catch (error) {
    throw new Error('Failed to fetch student analytics: ' + error.message);
  }
};