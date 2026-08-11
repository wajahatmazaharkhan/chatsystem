import api from "./api";

export const handleLogin = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed", { cause: error });
  }
};

export const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");

    if (token) {
      await api.post("/auth/logout");
    }
  } catch (error) {
    console.error(error);
  } finally {
    localStorage.removeItem("token");
  }
};

export const handleRegister = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.response?.data?.message || "Registration failed",
      { cause: error }
    );
  }
};

