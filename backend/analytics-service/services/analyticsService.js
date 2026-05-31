const axios = require('axios');

// API Gateway URL - in a real scenario, this would be set in environment variables
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000/api';

/*
==================================================
ADMIN DASHBOARD
==================================================
*/

exports.getAdminAnalytics = async () => {
  try {
    // Analytics Service consumes data from other modules instead of using its own DB.
    // In a fully integrated environment, we would make axios requests to the API Gateway.
    // Example:
    // const usersRes = await axios.get(`${API_GATEWAY_URL}/users`);
    // const groupsRes = await axios.get(`${API_GATEWAY_URL}/groups`);
    // const statusRes = await axios.get(`${API_GATEWAY_URL}/status`);

    // Returning mocked aggregated data to satisfy the PDF contract
    return {
      total_users: 500,
      students_count: 480,
      managers_count: 15,
      admins_count: 5,

      total_groups: 70,
      active_students: 400,
      inactive_students: 80,
      engagement_rate: 83.33,
      total_messages: 15000,
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

exports.getGroupAnalytics = async (group_id) => {
  try {
    // Fetch group details, student statuses, and message counts from Modules 3, 4, 6.
    // Example:
    // const groupRes = await axios.get(`${API_GATEWAY_URL}/groups/${group_id}`);
    
    // Returning mocked data
    return {
      group_id,
      group_name: `Group ${group_id}`,
      manager_id: "mgr-123",
      total_students: 7,
      active_students: 5,
      inactive_students: 2,
      message_count: 350,
      students: [
        { user_id: "student-1", status: "ACTIVE" },
        { user_id: "student-2", status: "INACTIVE" },
        { user_id: "student-3", status: "ACTIVE" }
      ],
    };
  } catch (error) {
    throw new Error('Failed to fetch group analytics: ' + error.message);
  }
};