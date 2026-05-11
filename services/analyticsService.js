const Group = require("../schema/Group");
const Message = require("../schema/Message");
const UserStatus = require("../schema/UserStatus");

const {
  calculateEngagementRate,
} = require("../utils/metricsHelper");

/*
==================================================
ADMIN DASHBOARD
==================================================
*/

exports.getAdminAnalytics = async () => {

  /*
  ----------------------------------------
  GROUPS
  ----------------------------------------
  */

  const groups = await Group.find();

  /*
  ----------------------------------------
  STATUS COUNTS
  ----------------------------------------
  */

  const totalStudents =
    await UserStatus.countDocuments();

  const activeStudents =
    await UserStatus.countDocuments({
      status: "ACTIVE",
    });

  const inactiveStudents =
    await UserStatus.countDocuments({
      status: "INACTIVE",
    });

  /*
  ----------------------------------------
  MESSAGE COUNTS
  ----------------------------------------
  */

  const totalMessages =
    await Message.countDocuments();

  return {
    total_students: totalStudents,

    total_groups: groups.length,

    active_students: activeStudents,

    inactive_students: inactiveStudents,

    engagement_rate:
      calculateEngagementRate(
        activeStudents,
        totalStudents
      ),

    total_messages: totalMessages,
  };
};

/*
==================================================
GROUP DASHBOARD
==================================================
*/

exports.getGroupAnalytics =
  async (group_id) => {

    /*
    ----------------------------------------
    GROUP DETAILS
    ----------------------------------------
    */

    const group =
      await Group.findById(group_id);

    if (!group) {
      throw new Error("Group not found");
    }

    /*
    ----------------------------------------
    STUDENT STATUS
    ----------------------------------------
    */

    const students =
      await UserStatus.find({
        group_id,
      });

    const activeStudents =
      students.filter(
        (s) => s.status === "ACTIVE"
      ).length;

    const inactiveStudents =
      students.filter(
        (s) => s.status === "INACTIVE"
      ).length;

    /*
    ----------------------------------------
    MESSAGE COUNT
    ----------------------------------------
    */

    const messageCount =
      await Message.countDocuments({
        group_id,
      });

    return {

      group_id,

      group_name: group.name,

      manager_id: group.manager_id,

      total_students:
        students.length,

      active_students:
        activeStudents,

      inactive_students:
        inactiveStudents,

      message_count:
        messageCount,

      students,
    };
  };