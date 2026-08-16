import api from './api';

export async function fetchAdminStats(batchId = null) {
  const res = await api.get('/v1/analytics/admin', {
    params: {
      batch_id: batchId
    }
  });
  return res.data;
}

export async function fetchUsers() {
  const res = await api.get('/v1/users');
  return res.data;
}

export async function fetchManagerStats() {
  const res = await api.get('/v1/analytics/group');
  return res.data;
}

export async function fetchStudentStats() {
  const res = await api.get('/v1/analytics/student');
  return res.data;
}

export const getActivityLogs = async (params = {}) => {
  const res = await api.get("/v1/analytics/activity-logs", {
    params,
  });

  return res.data;
};

export const getBatchOverview = async() => {
  const res = await api.get('/v1/analytics/batch-overview')
  return res.data
}