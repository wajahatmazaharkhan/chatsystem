/**
 * User controllers
 *
 * Responsible for read operations against the `User` model.
 * - Always hide `password_hash` and internal fields (`__v`, `_id`) from API output.
 * - Convert Mongo `_id` to `user_id` (string) for public APIs.
 * - Return timestamps as ISO 8601 UTC strings where applicable.
 *
 * Note: write operations (create/update/delete) are implemented elsewhere and must
 * enforce RBAC, hashing, and event publishing.
 */
const mongoose = require('mongoose');
const User = require('../../../schema/User');

// Helper to remove sensitive/internal fields and normalize output
// Accepts either a Mongoose document or a plain object (lean results).
function sanitizeUser(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  // Map MongoDB `_id` to public `user_id` and remove internal fields
  obj.user_id = obj._id ? obj._id.toString() : obj.user_id;
  delete obj._id;
  delete obj.password_hash;
  delete obj.__v;
  return obj;
}

/**
 * GET /users
 * Query params supported: role, is_active, page, limit, includeDeleted, fields
 * - role/is_active: filtering
 * - pagination: page (1-based), limit (max 100)
 * - includeDeleted: boolean (default false) — controls soft-deleted rows
 * - fields: comma-separated projection (returns only requested fields + user_id)
 *
 * Response: { items: [User], page, limit, total }
 */
exports.listUsers = async function listUsers(req, res, next) {
  try {
    const { role, is_active, page = 1, limit = 25, includeDeleted = 'false', fields } = req.query;

    const q = {};
    if (role) q.role = role;
    if (typeof is_active !== 'undefined') {
      // accept query strings 'true'/'false' or boolean
      q.is_active = is_active === 'true' || is_active === true;
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
      const allowed = fields.split(',').map((f) => f.trim()).filter(Boolean);
      projection = {};
      for (const f of allowed) projection[f] = 1;
      // Ensure sensitive/internal fields remain hidden
      projection.password_hash = 0;
      projection.__v = 0;
    }

    // Execute query + total count in parallel for efficiency
    const [items, total] = await Promise.all([
      User.find(q).select(projection).skip(skip).limit(perPage).lean(),
      User.countDocuments(q),
    ]);

    // Normalize results: map _id to user_id and format dates to ISO strings
    const mapped = items.map((it) => {
      const obj = { ...it };
      obj.user_id = obj._id ? obj._id.toString() : obj.user_id;
      delete obj._id;
      delete obj.password_hash;
      delete obj.__v;
      if (obj.created_at instanceof Date) obj.created_at = obj.created_at.toISOString();
      if (obj.updated_at instanceof Date) obj.updated_at = obj.updated_at.toISOString();
      if (obj.deleted_at instanceof Date) obj.deleted_at = obj.deleted_at.toISOString();
      return obj;
    });

    res.json({ items: mapped, page: pageNum, limit: perPage, total });
  } catch (err) {
    // Delegate unexpected errors to the central error handler (adds 500 responses etc.)
    next(err);
  }
};

/**
 * GET /users/:user_id
 * - Finds a user by the provided `user_id` (accepts Mongo ObjectId strings).
 * - Returns 400 when `user_id` missing, 404 when not found or soft-deleted.
 * - Sanitizes output (hides password_hash) and formats timestamps.
 */
exports.getUser = async function getUser(req, res, next) {
  try {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ code: 'ERR_INVALID_ID', message: 'user_id required' });

    // Prefer direct _id lookup for Mongo ObjectId strings
    let user = null;
    if (mongoose.isValidObjectId(user_id)) {
      user = await User.findById(user_id).lean();
    }
    if (!user) {
      // Fallback: attempt to find a document where _id equals the provided string
      user = await User.findOne({ _id: user_id }).lean();
    }

    // Treat soft-deleted users as not found for standard GET
    if (!user || user.deleted_at) return res.status(404).json({ code: 'ERR_NOT_FOUND', message: 'User not found' });

    // Sanitize and format response
    const obj = { ...user };
    obj.user_id = obj._id ? obj._id.toString() : obj.user_id;
    delete obj._id;
    delete obj.password_hash;
    delete obj.__v;
    if (obj.created_at instanceof Date) obj.created_at = obj.created_at.toISOString();
    if (obj.updated_at instanceof Date) obj.updated_at = obj.updated_at.toISOString();
    if (obj.deleted_at instanceof Date) obj.deleted_at = obj.deleted_at.toISOString();

    res.json(obj);
  } catch (err) {
    next(err);
  }
};

// Export sanitize helper for tests if needed
exports._sanitizeUser = sanitizeUser;
