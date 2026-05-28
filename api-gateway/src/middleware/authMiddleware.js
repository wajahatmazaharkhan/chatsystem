const axios = require("axios");
const config = require("../config");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required"
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    const response = await axios.post(
      `${config.authService}/auth/validate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 7000
      }
    );

    const user = response.data?.user || response.data;

    if (!user || !user.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication payload"
      });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    const status = error.response?.status || 401;
    const message = error.response?.data?.message || "Unauthorized";

    return res.status(status).json({
      success: false,
      message
    });
  }
};

module.exports = authMiddleware;
