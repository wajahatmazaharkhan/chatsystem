const mongoose = require("mongoose");
const User = require("../schema/User");
const UserStatus = require("../schema/UserStatus");

const ALLOWED_ROLES = ["ADMIN", "MANAGER", "STUDENT"];
const ALLOWED_STATUSES = ["ACTIVE", "INACTIVE"];

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEnumValue = (value) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

const validateEnumFilter = (field, value, allowedValues) => {
  if (!value) {
    return undefined;
  }

  const normalizedValue = normalizeEnumValue(value);
  if (!allowedValues.includes(normalizedValue)) {
    throw buildError(
      `Invalid ${field}. Allowed values: ${allowedValues.join(", ")}`,
      400
    );
  }

  return normalizedValue;
};

const getStatusMap = async (userIds) => {
  const statuses = await UserStatus.find({ user_id: { $in: userIds } }).lean();

  return statuses.reduce((statusMap, currentStatus) => {
    statusMap[currentStatus.user_id.toString()] = currentStatus.status;
    return statusMap;
  }, {});
};

const toSafeUserResponse = (user, statusMap = {}) => {
  const userId = user._id.toString();

  // Status documents are the source of truth; fall back to is_active for older users.
  const status =
    statusMap[userId] || (user.is_active === false ? "INACTIVE" : "ACTIVE");

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

exports.getUsers = async (filters = {}) => {
  const role = validateEnumFilter("role", filters.role, ALLOWED_ROLES);
  const status = validateEnumFilter("status", filters.status, ALLOWED_STATUSES);

  const query = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    const matchingStatuses = await UserStatus.find({ status })
      .select("user_id")
      .lean();

    query._id = { $in: matchingStatuses.map((item) => item.user_id) };
  }

  const users = await User.find(query)
    .select("-password_hash -password")
    .sort({ created_at: -1 })
    .lean();

  const statusMap = await getStatusMap(users.map((user) => user._id));

  return users.map((user) => toSafeUserResponse(user, statusMap));
};

exports.getUserById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw buildError("Invalid user id", 400);
  }

  const user = await User.findById(userId)
    .select("-password_hash -password")
    .lean();

  if (!user) {
    throw buildError("User not found", 404);
  }

  const statusMap = await getStatusMap([user._id]);

  return toSafeUserResponse(user, statusMap);
};
