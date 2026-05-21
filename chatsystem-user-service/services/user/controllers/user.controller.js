
const mongoose = require('mongoose');
const User = require('../../../schema/User');
const UserStatus = require('../../../schema/UserStatus');
const bcrypt = require("bcrypt");

const ALLOWED_ROLES = ['ADMIN', 'MANAGER', 'STUDENT'];
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
    map[item.user_id.toString()] = item.status;
    return map;
  }, {});
}

// Helper to remove sensitive/internal fields and normalize output
// Accepts either a Mongoose document or a plain object (lean results).
function sanitizeUser(doc, statusMap = {}) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const userId = obj._id ? obj._id.toString() : obj.user_id;

  obj.status = statusMap[userId] || (obj.is_active === false ? 'INACTIVE' : 'ACTIVE');

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
  return obj;
}


exports.createUser = async function createUser(req, res, next) {
  try {

    console.log("CREATING USER...");
console.log("REQUEST BODY:", req.body);
    const { name, email, password, role } = req.body;

     // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        code: "ERR_VALIDATION",
        message: "All fields are required"
      });
    }

    // Normalize and validate email and role
    const emailNorm = String(email).trim().toLowerCase();
    const roleNorm = validateEnum(role, ALLOWED_ROLES, 'role');

    // Hash password before storing to avoid plain-text storage
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: emailNorm,
      password_hash: hashedPassword,
      role: roleNorm
    });

    // Return only public user_id per contract (do not return password_hash or other fields)
    res.status(201).json({ user_id: user._id.toString() });

  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(409).json({
        code: "ERR_DUPLICATE",
        message: "Email already exists"
      });
    }

    console.error('createUser error:', err && err.stack ? err.stack : err);
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

    const obj = sanitizeUser(user);

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
    if (typeof is_active !== 'undefined') {
      // accept query strings 'true'/'false' or boolean
      q.is_active = is_active === 'true' || is_active === true;
    }
    if (normalizedStatus) {
      const matchingStatuses = await UserStatus.find({ status: normalizedStatus }).select('user_id').lean();
      q._id = { $in: matchingStatuses.map((item) => item.user_id) };
    }

    // Soft-delete: exclude deleted rows unless explicitly requested
    const includeDeletedBool = includeDeleted === 'true' || includeDeleted === true;
    if (!includeDeletedBool) q.deleted_at = null;

    // Pagination bounds and calculation
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);
    const skip = (pageNum - 1) * perPage;

    // Projection handling: default hides sensitive fields
    let projection = { password_hash: 0, __v: 0 };
    if (fields) {
      // Build a projection from requested fields (e.g. 'name,email')
      const blockedFields = new Set(['password', 'password_hash', '__v']);
      const allowed = fields
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f && !blockedFields.has(f));

      projection = allowed.length ? allowed.join(' ') : { password_hash: 0, __v: 0 };
    }

    // Execute query + total count in parallel for efficiency
    const [items, total] = await Promise.all([
      User.find(q).select(projection).skip(skip).limit(perPage).lean(),
      User.countDocuments(q),
    ]);

    // Sanitize each item using helper to keep output consistent
    const statusMap = await getStatusMap(items.map((item) => item._id));
    const mapped = items.map((it) => sanitizeUser(it, statusMap));

    res.json({ items: mapped, page: pageNum, limit: perPage, total });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ code: 'ERR_VALIDATION', message: err.message });
    }

    // Delegate unexpected errors to the central error handler (adds 500 responses etc.)
    next(err);
  }
};


exports.getUser = async function getUser(req, res, next) {
  try {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ code: 'ERR_INVALID_ID', message: 'user_id required' });

    // Validate id format
    if (!mongoose.isValidObjectId(user_id)) return res.status(400).json({ code: 'ERR_INVALID_ID', message: 'Invalid user_id format' });

    const user = await User.findById(user_id).lean();

    // Treat soft-deleted users as not found for standard GET
    if (!user || user.deleted_at) return res.status(404).json({ code: 'ERR_NOT_FOUND', message: 'User not found' });

    const statusMap = await getStatusMap([user._id]);

    // Sanitize and return
    const obj = sanitizeUser(user, statusMap);
    res.json(obj);
  } catch (err) {
    next(err);
  }
};


// Export sanitize helper for tests if needed
exports._sanitizeUser = sanitizeUser;
