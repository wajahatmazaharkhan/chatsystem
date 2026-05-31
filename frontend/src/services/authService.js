// authService.js
// Fetch user info (role) from backend
import axios from 'axios';

export async function fetchUserInfo() {
  try {
    // This endpoint should return user info from the backend (Module 1 - Auth Service)
    const res = await axios.get('/v1/auth/validate');
    return res.data;
  } catch (err) {
    console.error("Auth validation failed:", err);
    throw err;
  }
}
