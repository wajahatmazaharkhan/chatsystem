import axios from "axios";

const url = import.meta.env.VITE_BE_URL;

const api = axios.create({
  baseURL: `${url}`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;