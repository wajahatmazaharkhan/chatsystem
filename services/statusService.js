const ActivityLog = require("../schema/ActivityLog");
const UserStatus  = require("../schema/UserStatus");
const Group       = require("../schema/Group");

const THRESHOLD_HOURS =
  process.env.THRESHOLD_HOURS || 96;

const classify = (lastActiveAt) => {

  const diffHours =
    (Date.now() - new Date(lastActiveAt)) /
    (1000 * 60 * 60);

  return diffHours > THRESHOLD_HOURS
    ? "INACTIVE"
    : "ACTIVE";
};

/*
==================================================
CORE: SINGLE STUDENT EVALUATION
==================================================
*/
exports.evaluateStudent = async (user_id) => {

  const latest = await ActivityLog
    .findOne({ user_id })
    .sort({ timestamp: -1 });

  /*
  ------------------------------------------
  FIX: NEVER NULL (schema requirement)
  ------------------------------------------
  */
  const lastActiveAt =
    latest?.timestamp || new Date(0);

  const status =
    classify(lastActiveAt);

  const existing =
    await UserStatus.findOne({ user_id });

  let transition_count =
    existing?.transition_count || 0;

  let status_changed_at =
    existing?.status_changed_at || null;

  if (existing && existing.status !== status) {
    transition_count += 1;
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
GET SINGLE STATUS
==================================================
*/
exports.getStudentStatus = async (user_id) => {
  return await exports.evaluateStudent(user_id);
};

/*
==================================================
GROUP STATUS
==================================================
*/
exports.getGroupStatus = async (group_id) => {

  const group = await Group.findById(group_id);

  if (!group) throw new Error("Group not found");

  let active = 0;
  let inactive = 0;

  const students = [];

  for (const user_id of group.members) {

    const result =
      await exports.evaluateStudent(user_id);

    if (result.status === "ACTIVE") active++;
    else inactive++;

    students.push(result);
  }

  return {
    group_id,
    total_students: group.members.length,
    active_students: active,
    inactive_students: inactive,
    students,
  };
};