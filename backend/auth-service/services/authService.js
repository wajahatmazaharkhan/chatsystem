// services/authService.js
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { findUserByEmail, validatePassword, User } = require('../models/userModel');
const TokenBlacklist = require('../models/TokenBlacklist')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const { getHierarchyLevel, getDefaultPermissions } = require('../utils/rbacHelpers');

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
      const { getHierarchyLevel, getDefaultPermissions } = require('../utils/rbacHelpers');
      const userRole = user.role || 'STUDENT';
      const userRoleType = user.roleType || null;
      const userPermissions = (user.permissions && user.permissions.length > 0)
        ? user.permissions
        : getDefaultPermissions(userRole, userRoleType);
      const userHierarchyLevel = (user.hierarchyLevel !== undefined && user.hierarchyLevel !== null)
        ? user.hierarchyLevel
        : getHierarchyLevel(userRole);

      const token = jwt.sign(
        {
          user_id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          roleType: userRoleType,
          permissions: userPermissions,
          hierarchyLevel: userHierarchyLevel,
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
          roleType: userRoleType,
          permissions: userPermissions,
          hierarchyLevel: userHierarchyLevel,
          name: user.name,
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

  // Register API
  async register(userData) {
    const { fullName, name, email, password, role, headHrType, roleType, phone, assignedGroups, managedGroups } = userData;
    const userName = (fullName || name || '').trim();
    const userEmail = (email || '').toLowerCase().trim();

    if (!userName || !userEmail || !password || !role) {
      const err = new Error('Full Name, email, password, and role are required');
      err.statusCode = 400;
      throw err;
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(userEmail);
    if (existingUser) {
      const err = new Error('Email is already registered');
      err.statusCode = 409;
      throw err;
    }

    // Normalize role string e.g. "group-manager" -> "GROUP_MANAGER"
    let normalizedRole = role.toUpperCase().replace(/-/g, '_');
    if (normalizedRole === 'MANAGER') normalizedRole = 'GROUP_MANAGER';

    // Normalize roleType / headHrType
    let normalizedRoleType = (roleType || headHrType || '').toUpperCase().replace(/-/g, '_');
    if (!['PUBLISHING', 'NON_PUBLISHING'].includes(normalizedRoleType)) {
      normalizedRoleType = null;
    }

    if (normalizedRole === 'HEAD_HR' && !normalizedRoleType) {
      const err = new Error('Head HR requires an operational division (Publishing or Non-Publishing)');
      err.statusCode = 400;
      throw err;
    }

    const groupsList = assignedGroups || managedGroups || [];

    const hierarchyLevel = getHierarchyLevel(normalizedRole);
    const permissions = getDefaultPermissions(normalizedRole, normalizedRoleType);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: userName,
      email: userEmail,
      password_hash: hashedPassword,
      role: normalizedRole,
      roleType: normalizedRoleType,
      permissions,
      hierarchyLevel,
      phone: phone || null,
      managedGroups: normalizedRole === 'GROUP_MANAGER' ? groupsList : [],
      is_active: true,
    });

    return {
      success: true,
      message: 'Registration successful',
      user: {
        user_id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        roleType: newUser.roleType,
        hierarchyLevel: newUser.hierarchyLevel,
        is_active: newUser.is_active,
      },
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
        name: decoded.name,
        role: decoded.role,
        roleType: decoded.roleType || null,
        permissions: decoded.permissions || [],
        hierarchyLevel: decoded.hierarchyLevel || 6,
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new AuthService();