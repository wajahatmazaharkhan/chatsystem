const axios = require('axios');
const mongoose = require('mongoose');
const Group = require('../schema/Group');

module.exports = async function validateGroupMember(req, res, next) {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;

    // Admins bypass group membership validation
    if (role === 'ADMIN') {
      return next();
    }

    const groupId = (req.body && (req.body.group_id || req.body.groupId)) || req.params.groupId || req.params.group_id;

    if (!groupId) {
      return res.status(400).json({ error: 'group_id is required' });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid group_id format' });
    }

    const groupServiceUrl = process.env.GROUP_SERVICE_URL || (process.env.GROUP_SERVICE ? `${process.env.GROUP_SERVICE}/groups/${groupId}/members` : null);

    if (groupServiceUrl) {
      try {
        const response = await axios.get(
          groupServiceUrl.includes('{id}') ? groupServiceUrl.replace('{id}', groupId) : groupServiceUrl,
          {
            headers: {
              Authorization: req.headers.authorization || req.headers.Authorization,
            },
          }
        );

        const data = response.data;
        let members = [];
        let managerId = null;

        if (Array.isArray(data)) {
          members = data;
        } else if (data && typeof data === 'object') {
          members = data.members || [];
          managerId = data.manager_id || data.managerId || null;
        }

        // Normalize members to string IDs
        const memberIds = members.map(m => {
          if (typeof m === 'string') return m;
          if (m && typeof m === 'object') return (m.user_id || m.id || m._id || '').toString();
          return '';
        }).filter(Boolean);

        const isMember = memberIds.includes(userId.toString());
        const isManager = managerId && managerId.toString() === userId.toString();

        if (isMember || isManager) {
          return next();
        }

        return res.status(403).json({ error: 'Access denied: User does not belong to this group' });
      } catch (err) {
        console.error('Group service validation failed, trying database fallback:', err.message);
        // Fall back to local DB if Group service call fails
      }
    }

    // Fallback: Query local MongoDB database using Group schema
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const members = group.members || [];
    const managerId = group.manager_id;

    const isMember = members.some(memberId => memberId.toString() === userId.toString());
    const isManager = managerId && managerId.toString() === userId.toString();

    if (isMember || isManager) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied: User does not belong to this group' });
  } catch (err) {
    next(err);
  }
};
