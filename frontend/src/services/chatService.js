import api from "./api";

export const sendMessage = (group_id, content) => {
  return api.post("/v1/chat/send", {
    group_id,
    content,
  });
};

export const getChatHistory = (group_id) => {
  return api.get(`/v1/chat/history/${group_id}`);
};
