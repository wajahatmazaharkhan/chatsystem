// const Group = require('../models/Group');
// const User = require('../schema/User');
// const mongoose = require('mongoose');

// const getAllGroups = async (req, res) => {
//   try {
//     const { batch_id } = req.query;
//     const filter = batch_id ? { batch_id } : {};
//     const groups = await Group.find(filter).sort({ created_at: -1 }).lean();

//     const managerIdsRaw = [...new Set(groups.map(g => g.manager_id).filter(Boolean))];
//     const managerIds = managerIdsRaw.filter(id => mongoose.Types.ObjectId.isValid(id));
//     const managers = await User.find({ _id: { $in: managerIds } }, 'name').lean();
//     const managerMap = managers.reduce((acc, m) => {
//       acc[m._id.toString()] = m.name;
//       return acc;
//     }, {});

//     const groupsWithNames = groups.map(g => ({
//       ...g,
//       manager_name: g.manager_id ? managerMap[g.manager_id.toString()] || null : null
//     }));

//     return res.status(200).json({
//       total: groups.length,
//       groups: groupsWithNames,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: err.message });
//   }
// };

// const getGroupById = async (req, res) => {
//   try {
//     const group = await Group.findById(req.params.group_id).lean();
//     if (!group) return res.status(404).json({ error: 'Group not found' });

//     if (req.user.role === 'MANAGER' && group.manager_id !== req.user.user_id) {
//       return res.status(403).json({ error: 'Forbidden: not your group' });
//     }

//     let manager_name = null;
//     if (group.manager_id && mongoose.Types.ObjectId.isValid(group.manager_id)) {
//       const manager = await User.findById(group.manager_id, 'name').lean();
//       if (manager) manager_name = manager.name;
//     }

//     const validMemberIds = group.members.filter(id => mongoose.Types.ObjectId.isValid(id));
//     const membersData = await User.find({ _id: { $in: validMemberIds } }, 'name').lean();
//     const member_details = group.members.map(memberId => {
//        const found = membersData.find(u => u._id.toString() === memberId.toString());
//        return found ? { _id: memberId.toString(), name: found.name } : { _id: memberId.toString(), name: memberId.toString() };
//     });

//     return res.status(200).json({ ...group, manager_name, member_details });
//   } catch (err) {
//     if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const getGroupMembers = async (req, res) => {
//   try {
//     const group = await Group.findById(req.params.group_id).lean();
//     if (!group) return res.status(404).json({ error: 'Group not found' });

//     const { role, user_id } = req.user;

//     if (role === 'MANAGER' && group.manager_id !== user_id) {
//       return res.status(403).json({ error: 'Forbidden: not your group' });
//     }

//     if (role === 'STUDENT' && !group.members.includes(user_id)) {
//       return res.status(403).json({ error: 'Forbidden: not a member of this group' });
//     }

//     let manager_name = null;
//     if (group.manager_id && mongoose.Types.ObjectId.isValid(group.manager_id)) {
//       const manager = await User.findById(group.manager_id, 'name').lean();
//       if (manager) manager_name = manager.name;
//     }

//     const validMemberIds = group.members.filter(id => mongoose.Types.ObjectId.isValid(id));
//     const membersData = await User.find({ _id: { $in: validMemberIds } }, 'name').lean();
//     const member_details = group.members.map(memberId => {
//        const found = membersData.find(u => u._id.toString() === memberId.toString());
//        return found ? { _id: memberId.toString(), name: found.name } : { _id: memberId.toString(), name: memberId.toString() };
//     });

//     return res.status(200).json({
//       group_id: group._id,
//       batch_id: group.batch_id,
//       name: group.name,
//       manager_id: group.manager_id,
//       manager_name,
//       members: group.members,
//       member_details,
//       total_members: group.members.length,
//     });
//   } catch (err) {
//     if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const validateMembership = async (req, res) => {
//   try {
//     const { user_id } = req.query;
//     if (!user_id) return res.status(400).json({ error: 'user_id query param required' });

//     const group = await Group.findById(req.params.group_id);
//     if (!group) return res.status(404).json({ error: 'Group not found' });

//     const isMember = group.members.includes(user_id);
//     const isManager = group.manager_id === user_id;

//     return res.status(200).json({
//       group_id: group._id,
//       user_id,
//       is_member: isMember,
//       is_manager: isManager,
//       belongs_to_group: isMember || isManager,
//     });
//   } catch (err) {
//     if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const getMyGroup = async (req, res) => {
//   try {
//     const group = await Group.findOne({
//       members: req.user.user_id
//     });

//     if (!group) {
//       return res.status(404).json({
//         error: 'Group not found'
//       });
//     }

//     res.status(200).json(group);

//   } catch (err) {
//     res.status(500).json({
//       error: 'Internal server error'
//     });
//   }
// };

// module.exports = { getAllGroups, getGroupById, getGroupMembers, validateMembership, getMyGroup };


const Group = require('../models/Group');
const User = require('../schema/User');
const mongoose = require('mongoose');

const getAllGroups = async (req, res) => {
  try {
    const { batch_id } = req.query;
    const filter = batch_id ? { batch_id } : {};
    const groups = await Group.find(filter).sort({ created_at: -1 }).lean();

    const managerIdsRaw = [...new Set(groups.map(g => g.manager_id).filter(Boolean))];
    const managerIds = managerIdsRaw.filter(id => mongoose.Types.ObjectId.isValid(id));
    const managers = await User.find({ _id: { $in: managerIds } }, 'name').lean();
    const managerMap = managers.reduce((acc, m) => {
      acc[m._id.toString()] = m.name;
      return acc;
    }, {});

    const groupsWithNames = groups.map(g => ({
      ...g,
      manager_name: g.manager_id ? managerMap[g.manager_id.toString()] || null : null
    }));

    return res.status(200).json({
      total: groups.length,
      groups: groupsWithNames,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.group_id).lean();
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (req.user.role === 'MANAGER' && group.manager_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Forbidden: not your group' });
    }

    let manager_name = null;
    if (group.manager_id && mongoose.Types.ObjectId.isValid(group.manager_id)) {
      const manager = await User.findById(group.manager_id, 'name').lean();
      if (manager) manager_name = manager.name;
    }

    const validMemberIds = group.members.filter(id => mongoose.Types.ObjectId.isValid(id));
    const membersData = await User.find({ _id: { $in: validMemberIds } }, 'name').lean();
    const member_details = group.members.map(memberId => {
       const found = membersData.find(u => u._id.toString() === memberId.toString());
       return found ? { _id: memberId.toString(), name: found.name } : { _id: memberId.toString(), name: memberId.toString() };
    });

    return res.status(200).json({ ...group, manager_name, member_details });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.group_id).lean();
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const { role, user_id } = req.user;

    if (role === 'MANAGER' && group.manager_id !== user_id) {
      return res.status(403).json({ error: 'Forbidden: not your group' });
    }

    if (role === 'STUDENT' && !group.members.includes(user_id)) {
      return res.status(403).json({ error: 'Forbidden: not a member of this group' });
    }

    let manager_name = null;
    if (group.manager_id && mongoose.Types.ObjectId.isValid(group.manager_id)) {
      const manager = await User.findById(group.manager_id, 'name').lean();
      if (manager) manager_name = manager.name;
    }

    const validMemberIds = group.members.filter(id => mongoose.Types.ObjectId.isValid(id));
    const membersData = await User.find({ _id: { $in: validMemberIds } }, 'name').lean();
    const member_details = group.members.map(memberId => {
       const found = membersData.find(u => u._id.toString() === memberId.toString());
       return found ? { _id: memberId.toString(), name: found.name } : { _id: memberId.toString(), name: memberId.toString() };
    });

    return res.status(200).json({
      group_id: group._id,
      batch_id: group.batch_id,
      name: group.name,
      manager_id: group.manager_id,
      manager_name,
      members: group.members,
      member_details,
      total_members: group.members.length,
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const validateMembership = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id query param required' });

    const group = await Group.findById(req.params.group_id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isMember = group.members.includes(user_id);
    const isManager = group.manager_id === user_id;

    return res.status(200).json({
      group_id: group._id,
      user_id,
      is_member: isMember,
      is_manager: isManager,
      belongs_to_group: isMember || isManager,
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyGroup = async (req, res) => {
  try {
    const group = await Group.find({
      members: req.user.user_id
    });

    if (!group || group.length === 0) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    res.status(200).json(group);

  } catch (err) {
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = { getAllGroups, getGroupById, getGroupMembers, validateMembership, getMyGroup };