import api from './api';

export async function fetchAdminStats() {
  const res = await api.get('/v1/analytics/admin');
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
