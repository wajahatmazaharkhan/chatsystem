
const mongoose = require('mongoose');
const User = require('../../../schema/User');
const Group = require('../../../schema/Group');
const UserStatus = require('../../../schema/UserStatus');
const bcrypt = require("bcrypt");
const {
  canViewContact
} = require('../utils/contactVisibility');
const { getHierarchyLevel, getDefaultPermissions } = require('../utils/rbacHelpers');

const ALLOWED_ROLES = [
  'ADMIN',
  'SUB_ADMIN',
  'HEAD_HR',
  'HEAD_HR_PUBLISHING',
  'HEAD_HR_NON_PUBLISHING',
  'GROUP_MANAGER',
  'MANAGER',
  'SUB_GROUP_MANAGER',
  'STUDENT'
];
const ALLOWED_STATUSES = ['ACTIVE', 'INACTIVE'];

function normalizeEnum(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

function validateEnum(value, allowedValues, fieldName) {
  if (!value) return undefined;

  const normalized = normalizeEnum(value);
  if (!allowedValues.includes(normalized)) {
    const err = new Error(`Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  return normalized;
}

async function getStatusMap(userIds) {
  const statuses = await UserStatus.find({ user_id: { $in: userIds } }).lean();

  return statuses.reduce((map, item) => {
    map[item.user_id.toString()] = {
      status: item.status,
      last_active_at: item.last_active_at
    };
    return map;
  }, {});
}

function getStars(marks) {
  if (marks == null) return 0;
  if (marks >= 81) return 5;
  if (marks >= 61) return 4;
  if (marks >= 41) return 3;
  if (marks >= 21) return 2;
  return 1;
}

// Helper to remove sensitive/internal fields and normalize output
// Accepts either a Mongoose document or a plain object (lean results).
<<<<<<< HEAD
function sanitizeUser(doc, statusMap = {}, requesterRole = 'STUDENT') {
=======
function sanitizeUser(doc, statusMap = {}, requestingUser = null) {
>>>>>>> b073c12 (feat(user-mgmt): implement RBAC authentication, user management UI/services, and migration utilities)
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const userId = obj._id ? obj._id.toString() : obj.user_id;

  const statusInfo = statusMap[userId] || {};
  obj.status = statusInfo.status || (obj.is_active === false ? 'INACTIVE' : 'ACTIVE');
  if (statusInfo.last_active_at) {
    obj.last_login = statusInfo.last_active_at;
  }

  // Handle stars and marks
  if (obj.performance) {
    obj.stars = getStars(obj.performance.marks);
    if (requesterRole === 'STUDENT') {
      delete obj.performance.marks;
      delete obj.performance.updatedBy;
      delete obj.performance.updatedAt;
    }
  } else {
    obj.stars = 0;
  }

  // Map MongoDB `_id` to public `user_id` and remove internal fields
  obj.user_id = userId;
  delete obj._id;
  delete obj.password_hash;
  delete obj.password;
  delete obj.__v;
  // Ensure dates are ISO strings for API consumers
  if (obj.created_at instanceof Date) obj.created_at = obj.created_at.toISOString();
  if (obj.updated_at instanceof Date) obj.updated_at = obj.updated_at.toISOString();
  if (obj.deleted_at instanceof Date) obj.deleted_at = obj.deleted_at.toISOString();
  if (obj.last_login instanceof Date) obj.last_login = obj.last_login.toISOString();

  // Contact visibility rules (requires VIEW_CONTACTS permission or is in old allowed list)
  const canViewContacts = requestingUser && (
    requestingUser.role === 'ADMIN' ||
    (requestingUser.permissions && requestingUser.permissions.includes('VIEW_CONTACTS')) ||
    canViewContact(requestingUser.role)
  );

  if (!canViewContacts) {
    delete obj.phone;
    delete obj.contactDetails;
  }

  // Format populated references for frontend consumption
  if (obj.parentUser && typeof obj.parentUser === 'object') {
    obj.parentUser = {
      name: obj.parentUser.name,
      email: obj.parentUser.email,
      user_id: obj.parentUser._id ? obj.parentUser._id.toString() : obj.parentUser.user_id
    };
  }
  if (obj.createdBy && typeof obj.createdBy === 'object') {
    obj.createdBy = {
      name: obj.createdBy.name,
      email: obj.createdBy.email,
      user_id: obj.createdBy._id ? obj.createdBy._id.toString() : obj.createdBy.user_id
    };
  }
  if (obj.managedGroups && Array.isArray(obj.managedGroups)) {
    obj.managedGroups = obj.managedGroups.map(g => {
      if (g && typeof g === 'object') {
        return {
          name: g.name,
          group_id: g._id ? g._id.toString() : g.group_id
        };
      }
      return g;
    });
  }

  return obj;
}


exports.createUser = async function createUser(req, res, next) {
  try {
    console.log("CREATING USER...");
    console.log("REQUEST BODY:", req.body);
    const {
      name,
      email,
      password,
      role,
      roleType,
      phone,
      designation,
      contactDetails,
      managedGroups,
      parentUser,
      permissions
    } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        code: "ERR_VALIDATION",
        message: "All fields are required"
      });
    }

    // Normalize role
    let roleNorm = validateEnum(role, ALLOWED_ROLES, 'role');
    let roleTypeNorm = roleType ? roleType.trim().toUpperCase() : null;

    // Normalize backward compatibility for Head HR
    if (roleNorm === 'HEAD_HR_PUBLISHING') {
      roleNorm = 'HEAD_HR';
      roleTypeNorm = 'PUBLISHING';
    } else if (roleNorm === 'HEAD_HR_NON_PUBLISHING') {
      roleNorm = 'HEAD_HR';
      roleTypeNorm = 'NON_PUBLISHING';
    } else if (roleNorm === 'HEAD_HR' && !roleTypeNorm) {
      return res.status(400).json({
        code: "ERR_VALIDATION",
        message: "Head HR requires roleType (Publishing or Non-Publishing)."
      });
    }

    // Normalize GROUP_MANAGER
    if (roleNorm === 'MANAGER') {
      roleNorm = 'GROUP_MANAGER';
    }

    // Validation: Group Manager limits (1 to 3 groups)
    if (roleNorm === 'GROUP_MANAGER') {
      if (!managedGroups || !Array.isArray(managedGroups) || managedGroups.length < 1 || managedGroups.length > 3) {
        return res.status(400).json({
          code: "ERR_VALIDATION",
          message: "Group Manager must manage between 1 and 3 groups."
        });
      }
    }

    // Hierarchy Level & Permissions computation
    const hierarchyLevel = getHierarchyLevel(roleNorm);
    const targetPermissions = permissions && permissions.length > 0
      ? permissions
      : getDefaultPermissions(roleNorm, roleTypeNorm);

    // Privilege Escalation Prevention checks
    if (req.user) {
      const creatorLevel = req.user.hierarchyLevel || getHierarchyLevel(req.user.role);
      if (req.user.role !== 'ADMIN' && creatorLevel > hierarchyLevel) {
        return res.status(403).json({
          code: "ERR_FORBIDDEN",
          message: "Cannot create a user with a higher role than your own."
        });
      }

      if (req.user.role !== 'ADMIN') {
        const missing = targetPermissions.filter(p => !req.user.permissions.includes(p));
        if (missing.length > 0) {
          return res.status(403).json({
            code: "ERR_FORBIDDEN",
            message: "Cannot assign permissions you do not possess."
          });
        }
      }
    }

    // Parent User validation
    let parentUserId = null;
    if (parentUser) {
      if (!mongoose.isValidObjectId(parentUser)) {
        return res.status(400).json({
          code: "ERR_VALIDATION",
          message: "Invalid parentUser ID format."
        });
      }
      const parent = await User.findById(parentUser);
      if (!parent) {
        return res.status(400).json({
          code: "ERR_VALIDATION",
          message: "Parent user not found."
        });
      }
      const parentLevel = parent.hierarchyLevel || getHierarchyLevel(parent.role);
      if (parentLevel >= hierarchyLevel) {
        return res.status(400).json({
          code: "ERR_VALIDATION",
          message: "Parent user must have a higher position in the hierarchy."
        });
      }
      parentUserId = parent._id;
    }

    const createdByUserId = req.user ? req.user.user_id : null;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: String(email).trim().toLowerCase(),
      password_hash: hashedPassword,
      role: roleNorm,
      roleType: roleTypeNorm,
      permissions: targetPermissions,
      phone,
      designation,
      contactDetails,
      managedGroups: roleNorm === 'GROUP_MANAGER' ? managedGroups : [],
      parentUser: parentUserId,
      createdBy: createdByUserId,
      hierarchyLevel
    });

    // Update managed groups in database
    if (roleNorm === 'GROUP_MANAGER' && managedGroups) {
      const Group = require('../../../schema/Group');
      await Group.updateMany({ _id: { $in: managedGroups } }, { manager_id: user._id });
    }

    res.status(201).json({ user_id: user._id.toString() });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        code: "ERR_DUPLICATE",
        message: "Email already exists"
      });
    }
    console.error('createUser error:', err);
    next(err);
  }
};

exports.patchStatus = async function patchStatus(req, res, next) {
  try {
    const { user_id } = req.params;
    const { is_active } = req.body;

     // Validate presence of user_id 
     if (!user_id) {
  return res.status(400).json({
    code: "ERR_INVALID_ID",
    message: "user_id required"
  });
}
    // Strict boolean validation (same style consistency)
    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        code: "ERR_VALIDATION",
        message: "is_active must be boolean"
      });
    }

    // Single query (no redundant fallback)
    const user = await User.findByIdAndUpdate(
      user_id,
      { is_active },
      { new: true }
    ).lean();

    
    if (!user) {
      return res.status(404).json({
        code: "ERR_NOT_FOUND",
        message: "User not found"
      });
    }

    const obj = sanitizeUser(user, {}, req.user ? req.user.role : 'STUDENT');

    return res.json(obj);

  } catch (err) {
    next(err);
  }
};


exports.listUsers = async function listUsers(req, res, next) {
  try {
    const { role, status, is_active, page = 1, limit = 25, includeDeleted = 'false', fields } = req.query;

    const q = {};
    const normalizedRole = validateEnum(role, ALLOWED_ROLES, 'role');
    const normalizedStatus = validateEnum(status, ALLOWED_STATUSES, 'status');

    if (normalizedRole) q.role = normalizedRole;
    if (typeof is_active !== "undefined" && is_active !== "") {
      q.is_active = is_active === "true" || is_active === true;
    }
    if (normalizedStatus) {
      const matchingStatuses = await UserStatus.find({ status: normalizedStatus }).select('user_id').lean();
      q._id = { $in: matchingStatuses.map((item) => item.user_id) };
    }

    // Soft-delete: exclude deleted rows unless explicitly requested
    const includeDeletedBool = includeDeleted === 'true' || includeDeleted === true;
    if (!includeDeletedBool) q.deleted_at = null;

    // Hierarchy and boundary filtering
    if (req.user) {
      const reqLevel = req.user.hierarchyLevel || getHierarchyLevel(req.user.role);

      // ADMIN bypasses hierarchy filter
      if (req.user.role !== 'ADMIN') {
        q.hierarchyLevel = { $gte: reqLevel };

        // Group Manager boundary
        if (req.user.role === 'GROUP_MANAGER' || req.user.role === 'MANAGER') {
          const Group = require('../../../schema/Group');
          const managedGroupsList = await Group.find({ manager_id: req.user.user_id }).select('_id members').lean();
          const memberIds = managedGroupsList.flatMap(g => g.members.map(m => m.toString()));
          q._id = { $in: [...memberIds, req.user.user_id] };
        }

        // Sub Group Manager boundary
        if (req.user.role === 'SUB_GROUP_MANAGER') {
          q.$or = [
            { parentUser: req.user.user_id },
            { createdBy: req.user.user_id },
            { _id: req.user.user_id }
          ];
        }
      }
    }

    // Pagination bounds and calculation
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);
    const skip = (pageNum - 1) * perPage;

    // Projection handling
    let projection = { password_hash: 0, __v: 0 };
    if (fields) {
      const blockedFields = new Set(['password', 'password_hash', '__v']);
      const allowed = fields
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f && !blockedFields.has(f));

      projection = allowed.length ? allowed.join(' ') : { password_hash: 0, __v: 0 };
    }

    // Execute query + total count in parallel for efficiency
    const [items, total] = await Promise.all([
      User.find(q)
        .select(projection)
        .populate('parentUser', 'name email')
        .populate('createdBy', 'name email')
        .populate('managedGroups', 'name')
        .skip(skip)
        .limit(perPage)
        .lean(),
      User.countDocuments(q),
    ]);

    // Sanitize each item using helper to keep output consistent
    const statusMap = await getStatusMap(items.map((item) => item._id));
<<<<<<< HEAD
    const requesterRole = req.user ? req.user.role : 'STUDENT';
    const mapped = items.map((it) => sanitizeUser(it, statusMap, requesterRole));
=======
    const mapped = items.map((it) => sanitizeUser(it, statusMap, req.user));
>>>>>>> b073c12 (feat(user-mgmt): implement RBAC authentication, user management UI/services, and migration utilities)

    res.json({ items: mapped, page: pageNum, limit: perPage, total });
  } catch (err) {
    console.log(err)
    if (err.statusCode) {
      return res.status(err.statusCode).json({ code: 'ERR_VALIDATION', message: err.message });
    }
    next(err);
  }
};


exports.getUser = async function getUser(req, res, next) {
  try {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ code: 'ERR_INVALID_ID', message: 'user_id required' });

    // Validate id format
    if (!mongoose.isValidObjectId(user_id)) return res.status(400).json({ code: 'ERR_INVALID_ID', message: 'Invalid user_id format' });

    const user = await User.findById(user_id)
      .populate('parentUser', 'name email')
      .populate('createdBy', 'name email')
      .populate('managedGroups', 'name')
      .lean();

    // Treat soft-deleted users as not found for standard GET
    if (!user || user.deleted_at) return res.status(404).json({ code: 'ERR_NOT_FOUND', message: 'User not found' });

    // Hierarchy/Boundary checking
    if (req.user && req.user.role !== 'ADMIN') {
      const reqLevel = req.user.hierarchyLevel || getHierarchyLevel(req.user.role);
      const targetLevel = user.hierarchyLevel || getHierarchyLevel(user.role);

      if (reqLevel > targetLevel) {
        return res.status(403).json({ code: 'ERR_FORBIDDEN', message: 'Access denied: User is higher in hierarchy.' });
      }

      // Group Manager check
      if ((req.user.role === 'GROUP_MANAGER' || req.user.role === 'MANAGER') && String(user._id) !== String(req.user.user_id)) {
        const Group = require('../../../schema/Group');
        const isMember = await Group.findOne({ manager_id: req.user.user_id, members: user._id });
        if (!isMember) {
          return res.status(403).json({ code: 'ERR_FORBIDDEN', message: 'Access denied: User is not in your managed groups.' });
        }
      }

      // Sub Group Manager check
      if (req.user.role === 'SUB_GROUP_MANAGER' && String(user._id) !== String(req.user.user_id)) {
        const targetCreatedBy = user.createdBy || user.created_by;
        const targetParentUser = user.parentUser || user.parent_user;
        const targetCreatedById = targetCreatedBy && (targetCreatedBy._id || targetCreatedBy);
        const targetParentUserId = targetParentUser && (targetParentUser._id || targetParentUser);

        const isSubordinate = String(targetParentUserId) === String(req.user.user_id) || String(targetCreatedById) === String(req.user.user_id);
        if (!isSubordinate) {
          return res.status(403).json({ code: 'ERR_FORBIDDEN', message: 'Access denied: User is not your subordinate.' });
        }
      }
    }

    const statusMap = await getStatusMap([user._id]);

    // Sanitize and return
    const obj = sanitizeUser(user, statusMap, req.user);
    res.json(obj);
  } catch (err) {
    next(err);
  }
};


exports.patchMarks = async function patchMarks(req, res, next) {
  try {
    const { user_id } = req.params;
    const { marks } = req.body;
    const manager_id = req.user ? req.user.user_id : null;

    if (!user_id) {
      return res.status(400).json({ code: "ERR_INVALID_ID", message: "user_id required" });
    }
    if (typeof marks !== 'number' || marks < 0 || marks > 100) {
      return res.status(400).json({ code: "ERR_VALIDATION", message: "marks must be a number between 0 and 100" });
    }

    const user = await User.findById(user_id);
    if (!user || user.deleted_at) {
      return res.status(404).json({ code: "ERR_NOT_FOUND", message: "User not found" });
    }
    if (user.role !== 'STUDENT') {
      return res.status(400).json({ code: "ERR_VALIDATION", message: "Can only assign marks to a STUDENT" });
    }

    user.performance = user.performance || {};
    user.performance.marks = marks;
    user.performance.updatedBy = manager_id;
    user.performance.updatedAt = new Date();

    await user.save();

    const obj = sanitizeUser(user, {}, req.user);
    return res.json(obj);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async function updateUser(req, res, next) {
  try {
    const { user_id } = req.params;
    if (!user_id || !mongoose.isValidObjectId(user_id)) {
      return res.status(400).json({ code: 'ERR_INVALID_ID', message: 'Invalid user_id format' });
    }

    const user = await User.findById(user_id);
    if (!user || user.deleted_at) {
      return res.status(404).json({ code: 'ERR_NOT_FOUND', message: 'User not found' });
    }

    // Hierarchy Check
    const reqLevel = req.user.hierarchyLevel || getHierarchyLevel(req.user.role);
    const userLevel = user.hierarchyLevel || getHierarchyLevel(user.role);
    if (req.user.role !== 'ADMIN' && reqLevel > userLevel) {
      return res.status(403).json({ code: 'ERR_FORBIDDEN', message: 'Cannot edit a user with a higher role than your own.' });
    }

    const {
      name,
      email,
      role,
      roleType,
      phone,
      contactDetails,
      managedGroups,
      parentUser,
      permissions,
      is_active,
      designation
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = String(email).trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone;
    if (designation !== undefined) updates.designation = designation;
    if (contactDetails !== undefined) updates.contactDetails = contactDetails;
    if (is_active !== undefined) updates.is_active = is_active;

    let targetRole = user.role;
    if (role !== undefined) {
      targetRole = role.toUpperCase();
      updates.role = targetRole;
    }
    let targetRoleType = user.roleType;
    if (roleType !== undefined) {
      targetRoleType = roleType ? roleType.toUpperCase() : null;
      updates.roleType = targetRoleType;
    }

    // Head HR validation
    if (targetRole === 'HEAD_HR_PUBLISHING') {
      targetRole = 'HEAD_HR';
      targetRoleType = 'PUBLISHING';
      updates.role = targetRole;
      updates.roleType = targetRoleType;
    } else if (targetRole === 'HEAD_HR_NON_PUBLISHING') {
      targetRole = 'HEAD_HR';
      targetRoleType = 'NON_PUBLISHING';
      updates.role = targetRole;
      updates.roleType = targetRoleType;
    } else if (targetRole === 'HEAD_HR' && !targetRoleType) {
      return res.status(400).json({ code: 'ERR_VALIDATION', message: 'Head HR requires roleType (Publishing or Non-Publishing).' });
    }

    // Normalize GROUP_MANAGER
    if (targetRole === 'MANAGER') {
      targetRole = 'GROUP_MANAGER';
      updates.role = targetRole;
    }

    // Compute and validate hierarchy level
    const targetHierarchyLevel = getHierarchyLevel(targetRole);
    updates.hierarchyLevel = targetHierarchyLevel;

    // Privilege escalation on role/level
    if (req.user.role !== 'ADMIN' && reqLevel > targetHierarchyLevel) {
      return res.status(403).json({ code: 'ERR_FORBIDDEN', message: 'Cannot assign a role higher than your own.' });
    }

    // Permissions update and escalation check
    let targetPermissions = user.permissions;
    if (permissions !== undefined) {
      targetPermissions = permissions || [];
      updates.permissions = targetPermissions;
    } else if (role !== undefined || roleType !== undefined) {
      targetPermissions = getDefaultPermissions(targetRole, targetRoleType);
      updates.permissions = targetPermissions;
    }
    if (req.user.role !== 'ADMIN' && permissions !== undefined) {
      const missing = targetPermissions.filter(p => !req.user.permissions.includes(p));
      if (missing.length > 0) {
        return res.status(403).json({ code: 'ERR_FORBIDDEN', message: 'Cannot assign permissions you do not possess.' });
      }
    }

    // Managed groups validation
    if (targetRole === 'GROUP_MANAGER') {
      const groups = managedGroups !== undefined ? managedGroups : user.managedGroups;
      if (!groups || groups.length < 1 || groups.length > 3) {
        return res.status(400).json({ code: 'ERR_VALIDATION', message: 'Group Manager must manage between 1 and 3 groups.' });
      }
      updates.managedGroups = groups;
    } else {
      updates.managedGroups = [];
    }

    // Parent User validation
    if (parentUser !== undefined) {
      if (parentUser) {
        if (!mongoose.isValidObjectId(parentUser)) {
          return res.status(400).json({ code: 'ERR_VALIDATION', message: 'Invalid parentUser ID format.' });
        }
        const parent = await User.findById(parentUser);
        if (!parent) {
          return res.status(400).json({ code: 'ERR_VALIDATION', message: 'Parent user not found.' });
        }
        const parentLevel = parent.hierarchyLevel || getHierarchyLevel(parent.role);
        if (parentLevel >= targetHierarchyLevel) {
          return res.status(400).json({ code: 'ERR_VALIDATION', message: 'Parent user must have a higher position in the hierarchy.' });
        }
        updates.parentUser = parent._id;
      } else {
        updates.parentUser = null;
      }
    }

    // Perform database update
    const updatedUser = await User.findByIdAndUpdate(user_id, updates, { new: true });

    // Sync group managers relations
    const Group = require('../../../schema/Group');
    if (targetRole === 'GROUP_MANAGER') {
      const currentManagedGroups = updates.managedGroups || [];
      // Remove manager_id from groups no longer managed
      await Group.updateMany({ manager_id: updatedUser._id, _id: { $nin: currentManagedGroups } }, { manager_id: null });
      // Add manager_id to newly managed groups
      await Group.updateMany({ _id: { $in: currentManagedGroups } }, { manager_id: updatedUser._id });
    } else {
      await Group.updateMany({ manager_id: updatedUser._id }, { manager_id: null });
    }

    const obj = sanitizeUser(updatedUser, {}, req.user);
    res.json(obj);

  } catch (err) {
    next(err);
  }
};

exports.getRanking = async function getRanking(req, res, next) {
  try {
    const students = await User.find({ role: 'STUDENT', deleted_at: null }).lean();
    
    // Compute stars
    const studentsWithStars = students.map(student => {
      const marks = student.performance && student.performance.marks != null ? student.performance.marks : 0;
      return {
        ...student,
        computed_stars: getStars(marks),
        computed_marks: marks
      };
    });

    // Sort by stars (DESC), then marks (DESC), then name (ASC)
    studentsWithStars.sort((a, b) => {
      if (b.computed_stars !== a.computed_stars) {
        return b.computed_stars - a.computed_stars;
      }
      if (b.computed_marks !== a.computed_marks) {
        return b.computed_marks - a.computed_marks;
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    // Generate response and hide marks if STUDENT
    const requesterRole = req.user ? req.user.role : 'STUDENT';
    const rankingResponse = studentsWithStars.map((student, index) => {
      const resp = {
        rank: index + 1,
        user_id: student._id.toString(),
        name: student.name,
        stars: student.computed_stars
      };
      
      if (requesterRole === 'ADMIN' || requesterRole === 'MANAGER') {
        resp.marks = student.computed_marks;
      }
      return resp;
    });

    return res.json({
      ranking: rankingResponse,
      total: rankingResponse.length
    });
  } catch (err) {
    next(err);
  }
};

// Export sanitize helper for tests if needed
exports._sanitizeUser = sanitizeUser;
