import axios from 'axios';

const API_BASE = '/v1/status';

export const statusService = {
  fetchAllStatuses: async () => {
    const res = await axios.get(`${API_BASE}/all`);
    return res.data;
  },

  fetchUserStatus: async (userId) => {
    const res = await axios.get(`${API_BASE}/user/${userId}`);
    return res.data;
  },

  fetchGroupStatus: async (groupId) => {
    const res = await axios.get(`${API_BASE}/group/${groupId}`);
    return res.data;
  },

  classifyUsers: async (thresholdDays) => {
    const res = await axios.post(`${API_BASE}/classify`, { threshold_days: thresholdDays });
    return res.data;
  },

  updateThreshold: async (thresholdDays, updatedBy = 'admin') => {
    const res = await axios.patch(`${API_BASE}/threshold`, { threshold_days: thresholdDays, updated_by: updatedBy });
    return res.data;
  }
};
