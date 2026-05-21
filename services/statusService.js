const ActivityLog = require("../schema/ActivityLog");
const UserStatus = require("../schema/UserStatus");
const Group = require("../schema/Group");
const User = require("../schema/User");

/*
==================================================
RUNTIME THRESHOLD (DEFAULT)
==================================================
*/
let THRESHOLD_HOURS = 3 * 24; // default 3 days

/*
==================================================
HELPER
==================================================
*/
const classify = (lastActiveAt) => {
  const diffHours =
    (Date.now() - new Date(lastActiveAt)) /
    (1000 * 60 * 60);

  return diffHours > THRESHOLD_HOURS
    ? "INACTIVE"
    : "ACTIVE";
};

const daysInactive = (lastActiveAt) => {
  const diff =
    Date.now() - new Date(lastActiveAt).getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/*
==================================================
EVALUATE STUDENT
==================================================
*/
exports.evaluateStudent = async (user_id) => {
  const latest = await ActivityLog
    .findOne({ user_id })
    .sort({ timestamp: -1 });

  const lastActiveAt = latest?.timestamp || new Date(0);

  const status = classify(lastActiveAt);

  const existing = await UserStatus.findOne({ user_id });

  let transition_count = existing?.transition_count || 0;
  let status_changed_at = existing?.status_changed_at || null;

  if (existing && existing.status !== status) {
    transition_count++;
    status_changed_at = new Date();
  }

  return await UserStatus.findOneAndUpdate(
    { user_id },
    {
      user_id,
      group_id: latest?.group_id || null,
      status,
      last_active_at: lastActiveAt,
      evaluated_at: new Date(),
      threshold_hours: THRESHOLD_HOURS,
      status_changed_at,
      transition_count,
    },
    { upsert: true, new: true }
  );
};

/*
==================================================
FORMAT USER (UI CONTRACT FIX)
==================================================
*/
const formatUser = async (statusDoc) => {
  const user = await User.findById(statusDoc.user_id).lean();

  return {
    user_id: user?._id,
    name: user?.name || "Unknown",
    group_id: statusDoc.group_id,
    status: statusDoc.status,
    last_active: statusDoc.last_active_at,
    days_inactive: daysInactive(statusDoc.last_active_at),
    threshold_days: Math.floor(THRESHOLD_HOURS / 24),
  };
};

/*
==================================================
SINGLE USER
==================================================
*/
exports.getStudentStatus = async (user_id) => {
  const result = await exports.evaluateStudent(user_id);
  return await formatUser(result);
};

/*
==================================================
GROUP
==================================================
*/
exports.getGroupStatus = async (group_id) => {
  const group = await Group.findById(group_id);

  if (!group) throw new Error("Group not found");

  let active = 0;
  let inactive = 0;

  const students = [];

  for (const user_id of group.members) {
    const result = await exports.evaluateStudent(user_id);
    const formatted = await formatUser(result);

    if (result.status === "ACTIVE") active++;
    else inactive++;

    students.push(formatted);
  }

  const total = group.members.length;

  return {
    group_id,
    group_name: group.name,
    total_members: total,
    active_count: active,
    inactive_count: inactive,
    active_rate_pct: total ? Number(((active / total) * 100).toFixed(1)) : 0,
    group_status: active / total < 0.6 ? "AT RISK" : "HEALTHY",
    students,
  };
};

/*
==================================================
ALL USERS (IMPORTANT FOR UI DASHBOARD)
==================================================
*/
exports.getAllStatuses = async () => {
  const users = await User.find({});

  let active = 0;
  let inactive = 0;

  const results = [];

  for (const u of users) {
    const r = await exports.evaluateStudent(u._id);
    const formatted = await formatUser(r);

    if (r.status === "ACTIVE") active++;
    else inactive++;

    results.push(formatted);
  }

  return {
    generated_at: new Date(),
    threshold_days: Math.floor(THRESHOLD_HOURS / 24),
    total: users.length,
    active,
    inactive,
    users: results,
  };
};

/*
==================================================
CLASSIFY
==================================================
*/
exports.classifyAllUsers = async (threshold_days) => {
  if (threshold_days) {
    THRESHOLD_HOURS = Number(threshold_days) * 24;
  }

  const users = await User.find({});

  for (const u of users) {
    await exports.evaluateStudent(u._id);
  }

  return {
    message: "Classification triggered",
    threshold_days: Math.floor(THRESHOLD_HOURS / 24),
    classified_at: new Date(),
    total_classified: users.length,
  };
};

/*
==================================================
THRESHOLD UPDATE
==================================================
*/
exports.updateThreshold = async (threshold_days, updated_by) => {
  THRESHOLD_HOURS = Number(threshold_days) * 24;

  return {
    message: "Threshold updated",
    new_threshold_days: threshold_days,
    updated_by,
    updated_at: new Date(),
  };
};