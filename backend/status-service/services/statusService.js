const axios = require("axios");
const UserStatus = require("../schema/UserStatus");

/*
==================================================
RUNTIME THRESHOLD (DEFAULT)
==================================================
*/
let THRESHOLD_HOURS = 4 * 24; // default 4 days

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
AUTH SERVICE INTEGRATION
==================================================
*/
let cachedToken = null;
let tokenExpiresAt = null;

const getServiceToken = async () => {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  try {
    const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:3002';
    const response = await axios.post(`${AUTH_SERVICE}/auth/login`, {
      email: "admin@cohort.com",
      password: "admin123"
    });
    if (response.data && response.data.token) {
      cachedToken = response.data.token;
      tokenExpiresAt = Date.now() + 50 * 60 * 1000; // cache for 50 minutes
      return cachedToken;
    }
  } catch (err) {
    console.error("Failed to authenticate with Auth Service:", err.message);
  }
  return null;
};

/*
==================================================
EVALUATE STUDENT
==================================================
*/
exports.evaluateStudent = async (user_id) => {
  let latest = null;
  try {
    const ACTIVITY_SERVICE = process.env.ACTIVITY_SERVICE || 'http://localhost:3005';
    const token = await getServiceToken();
    
    const response = await axios.get(`${ACTIVITY_SERVICE}/v1/activity/user/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // activity-service returns { success: true, data: [ logs... ] }
    if (response.data && response.data.data && response.data.data.length > 0) {
      latest = response.data.data[0];
    }
  } catch (err) {
    console.error(`Failed to fetch activity for user ${user_id} from Module 5:`, err.message);
  }

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
  let user = null;
  try {
    const USER_SERVICE = process.env.USER_SERVICE || 'http://localhost:3004';
    const token = await getServiceToken();
    const res = await axios.get(`${USER_SERVICE}/users/${statusDoc.user_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    user = res.data;
  } catch (err) {
    console.error(`Failed to fetch user ${statusDoc.user_id} from User Service:`, err.message);
  }

  return {
    user_id: user?.user_id || statusDoc.user_id,
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
  let group = null;
  try {
    const GROUP_SERVICE = process.env.GROUP_SERVICE || 'http://localhost:3006';
    const token = await getServiceToken();
    const res = await axios.get(`${GROUP_SERVICE}/groups/${group_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    group = res.data;
  } catch (err) {
    console.error(`Failed to fetch group ${group_id} from Group Service:`, err.message);
  }

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
  let users = [];
  try {
    const USER_SERVICE = process.env.USER_SERVICE || 'http://localhost:3004';
    const token = await getServiceToken();
    const res = await axios.get(`${USER_SERVICE}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    users = res.data.items || res.data || [];
  } catch (err) {
    console.error(`Failed to fetch users from User Service:`, err.message);
  }

  let active = 0;
  let inactive = 0;

  const results = [];

  for (const u of users) {
    const r = await exports.evaluateStudent(u.user_id || u._id);
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

  const USER_SERVICE = process.env.USER_SERVICE || 'http://localhost:3004';
  const token = await getServiceToken();
  let users = [];
  try {
    const res = await axios.get(`${USER_SERVICE}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    users = res.data.items || res.data || [];
  } catch (err) {
    console.error(`Failed to fetch users for classification:`, err.message);
  }

  for (const u of users) {
    await exports.evaluateStudent(u.user_id || u._id);
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