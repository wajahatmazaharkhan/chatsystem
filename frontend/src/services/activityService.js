import api from "./api";

export const getUserActivity = async (userId) => {
  const res = await api.get(
    `/v1/activity/user/${userId}`
  );
  return res.data;
};