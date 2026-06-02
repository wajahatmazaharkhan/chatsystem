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