// services/authService.js
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { findUserByEmail, validatePassword } = require('../models/userModel');
const TokenBlacklist = require('../models/TokenBlacklist')
const crypto = require('crypto')

class AuthService {
  async login(email, password) {
    try {
      const user = await findUserByEmail(email);
      if (!user) {
        throw new Error("Invalid email or password");
      }
      if (user.is_active === false) {
        throw new Error("Account is inactive");
      }
      if (user.deleted_at) {
        throw new Error("Invalid email or password");
      }
      const isPasswordValid = await validatePassword(user, password);
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }
      const token = jwt.sign(
        {
          user_id: user._id.toString(),
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          jti: crypto.randomUUID(),
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
      );

      // Log login activity to Module 5
      try {
        await axios.post(
          `${process.env.ACTIVITY_SERVICE_URL}/v1/activity/log`,
          {
            user_id: user._id.toString(),
            activity_type: "LOGIN",
            source_timestamp: new Date(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log("✅ Activity logged successfully");
      } catch (activityError) {
        console.error("❌ Error logging activity:", activityError.message);
      }

      return {
        success: true,
        message: "Login successful",
        token,
        user: {
          user_id: user._id.toString(),
          email: user.email,
          role: user.role,
          is_active: user.is_active,
        },
      };
    } catch (err) {
      console.error("❌ Login error:", err.message);
      throw err;
    }
  }

  // ✅ TASK 4: LOGOUT API
  async logout(token) {
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await TokenBlacklist.create({
      jti: decoded.jti,

      user_id: decoded.user_id,

      expires_at: new Date(decoded.exp * 1000),
    });

    return {
      success: true,
      message: "Logged out successfully",
    };
  }

  // Validate token for other modules
  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const blacklisted = await TokenBlacklist.findOne({
        jti: decoded.jti,
      });

      if (blacklisted) {
        return {
          valid: false,
          error: "Token has been logged out",
        };
      }

      return {
        valid: true,
        user_id: decoded.user_id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new AuthService();