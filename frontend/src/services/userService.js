import api from "./api";

export const getUsers = async (params) => {
  const res = await api.get("/users", { params });
  return res.data;
};

export const createUser = async (data) => {
  const res = await api.post("/users", data);
  return res.data;
};

export const updateUserStatus = async (id, is_active) => {
  const res = await api.patch(`/users/${id}`, { is_active });
  return res.data;
};

export const getRanking = async () => {
  const res = await api.get("/users/ranking");
  return res.data;
};

export const updateUserMarks = async (id, marks) => {
  const res = await api.patch(`/users/${id}/marks`, { marks });
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};