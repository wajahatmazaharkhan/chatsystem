const Group = require('../../schema/Group');

// NOTE: During development, group membership is checked directly from MongoDB.
// For integration with Module 3 (Group), swap this out with the axios call to /groups/:id/members.
const checkGroupAccess = async (req, res, next) => {
    const groupId = req.params.group_id || req.body.group_id;
    const { user_id, role } = req.user;

    // Admins have direct access to all groups
    if (role === 'ADMIN') return next();

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        const isMember = group.members.some(
            (memberId) => memberId.toString() === user_id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ error: "Access Denied: You are not a member of this group" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ error: "Failed to verify group membership" });
    }
};

module.exports = checkGroupAccess;
