const Group = require('../models/Group');
const User = require('../schema/User');
const GroupManagerMapping = require('../models/GroupManagerMapping');
const GroupHRMapping = require('../models/GroupHRMapping');
const mongoose = require('mongoose');

const getAllGroups = async (req, res) => {
  try {
    const { batch_id } = req.query;
    const filter = batch_id ? { batch_id } : {};
    const groups = await Group.find(filter).sort({ created_at: -1 }).lean();

    const managerMappings = await GroupManagerMapping.find({ group_id: { $in: groups.map(g => g._id) }, is_active: true }).lean();
    const hrMappings = await GroupHRMapping.find({ group_id: { $in: groups.map(g => g._id) }, is_active: true }).lean();

    const managerMap = {};
    const hrMap = {};
    
    managerMappings.forEach(m => {
      managerMap[m.group_id.toString()] = m;
    });

    hrMappings.forEach(h => {
      hrMap[h.group_id.toString()] = h;
    });

    const result = groups.map(group => ({
      ...group,

      head_hr_id:
        hrMap[group._id.toString()]
          ?.head_hr_id || null,

      group_manager_id:
        managerMap[group._id.toString()]
          ?.group_manager_id || null,

      sub_group_manager_id:
        managerMap[group._id.toString()]
          ?.sub_group_manager_id || null
    }));

    return res.status(200).json({
      total: result.length,
      groups: result
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

    const mapping = await GroupManagerMapping.findOne({
      group_id: group._id,
      is_active: true
    });

    if (
      req.user.role === 'GROUP_MANAGER' &&
      mapping?.group_manager_id !== req.user.user_id
    ) {
      return res.status(403).json({
        error: 'Forbidden'
      });
    }

    const hrMapping =
      await GroupHRMapping.findOne({
        group_id: group._id,
        is_active: true
      });

    const managerMapping =
      await GroupManagerMapping.findOne({
        group_id: group._id,
        is_active: true
      });

    const validMemberIds = group.members.filter(id => mongoose.Types.ObjectId.isValid(id));
    const membersData = await User.find({ _id: { $in: validMemberIds } }, 'name').lean();
    const member_details = group.members.map(memberId => {
       const found = membersData.find(u => u._id.toString() === memberId.toString());
       return found ? { _id: memberId.toString(), name: found.name } : { _id: memberId.toString(), name: memberId.toString() };
    });

    return res.status(200).json({
      ...group,
      head_hr_id: hrMapping?.head_hr_id || null,
      group_manager_id: managerMapping?.group_manager_id || null,
      sub_group_manager_id: managerMapping?.sub_group_manager_id || null,
      member_details
    });
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

    const managerMapping = await GroupManagerMapping.findOne({
        group_id: group._id,
        is_active: true
      });

    if ( role === 'GROUP_MANAGER' && managerMapping?.group_manager_id !== user_id ) {
      return res.status(403).json({
        error: 'Forbidden: not assigned to this group'
      });
    }

    if ( role === 'SUB_GROUP_MANAGER' && managerMapping?.sub_group_manager_id !== user_id ) {
      return res.status(403).json({
        error: 'Forbidden: not assigned to this group'
      });
    }
    if (role === 'STUDENT' && !group.members.includes(user_id)) {
      return res.status(403).json({ error: 'Forbidden: not a member of this group' });
    }

    //get manager details
    let group_manager_name = null;
    let sub_group_manager_name = null;
    
     if (managerMapping) {

      const managerIds = [ managerMapping.group_manager_id, managerMapping.sub_group_manager_id ].filter(Boolean);
      const managers = await User.find({ _id: { $in: managerIds } },'name').lean();
      const managerMap = managers.reduce((acc, user) => {
        acc[user._id.toString()] = user.name;
        return acc;
      }, {});

      group_manager_name = managerMapping.group_manager_id ? managerMap[managerMapping.group_manager_id] || null : null;
      sub_group_manager_name = managerMapping.sub_group_manager_id ? managerMap[managerMapping.sub_group_manager_id] || null : null;
    }

    //get member details
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
      group_type: group.group_type,
      group_manager_id: managerMapping?.group_manager_id || null,
      group_manager_name,
      sub_group_manager_id: managerMapping?.sub_group_manager_id || null,
      sub_group_manager_name,
      members: group.members,
      member_details,
      total_members: group.members.length

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
    const mapping = await GroupManagerMapping.findOne({
        group_id: group._id,
        is_active: true
      });

    const isGroupManager = mapping?.group_manager_id === user_id;

    const isSubGroupManager = mapping?.sub_group_manager_id === user_id;

    return res.status(200).json({
      group_id: group._id,
      user_id,
      is_member: isMember,
      is_group_manager: isGroupManager,

      is_sub_group_manager: isSubGroupManager,

      belongs_to_group: isMember || isGroupManager || isSubGroupManager
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyGroup = async (req, res) => {
  try {
    let groups;
    const role = req.user.role;
    const userId = req.user.user_id;

    if (role === 'STUDENT') {
      groups = await Group.find({ members: userId });
    }

    else if (role === 'GROUP_MANAGER') {
      const mappings = await GroupManagerMapping.find({
          group_manager_id: userId,
          is_active: true
        });
      groups = await Group.find({ _id: { $in: mappings.map( m => m.group_id )}});
    }

    else if (role === 'SUB_GROUP_MANAGER') {
      const mappings = await GroupManagerMapping.find({
          sub_group_manager_id: userId,
          is_active: true
        });
      groups = await Group.find({ _id: { $in: mappings.map( m => m.group_id )}});
    }

    else if (role === 'HEAD_HR') {
      const hrMappings = await GroupHRMapping.find({
          head_hr_id: userId,
          is_active: true
        });
      groups = await Group.find({ _id: { $in: hrMappings.map( h => h.group_id )}});
    }

    if (!groups || groups.length === 0) {
      return res.status(404).json({
        error: "Group not found",
      });
    }

    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getGroupsByBatch = async (req, res, next) => {
  try {
    const { batch_id } = req.params;

    const groups = await Group.find({
      batch_id: new mongoose.Types.ObjectId(batch_id),
      deleted_at: null,
    }).lean();

    res.status(200).json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllGroups, getGroupById, getGroupMembers, validateMembership, getMyGroup, getGroupsByBatch };