const Group = require('../models/Group');
const User = require('../schema/User');
const GroupManagerMapping = require('../models/GroupManagerMapping');
const GroupHRMapping = require('../models/GroupHRMapping');
const HRGroupType = require('../models/HRGroupType');
const mongoose = require('mongoose');

//assignHeadHRType
assignHRGroupType = async(req,res)=>{
  try{
    const { head_hr_id, group_type } = req.body;

    const hr = await User.findById(head_hr_id);
    if(!hr || hr.role !== "HEAD_HR"){
      return res.status(400).json({
        message:"User is not a Head HR"
      });
    }


    if( !['publishing','non-publishing'].includes(group_type)){
      return res.status(400).json({
        message:"Invalid group type"
      });
    }

    const existing = await HRGroupType.findOne({
        head_hr_id,
        group_type
      });
    if(existing){
      return res.status(400).json({
        message:"HR already assigned to this group type"
      });
    }


    const mapping = await HRGroupType.create({
        head_hr_id,
        group_type,
        assigned_by:req.user.user_id
      });


    return res.status(201).json({
      message:"HR group type assigned",
      data:mapping
    });

  }catch(err){

    return res.status(500).json({
      error:err.message
    });

  }
};

// assignHeadHR
const assignHeadHR = async (req, res) => {
  try {
    const { group_id, head_hr_id } = req.body;

    const group = await Group.findById(group_id);

    if (!group) {
      return res.status(404).json({
        message: 'Group not found'
      });
    }

    const hrTypeConfig = await HRGroupType.findOne({
      group_type: group.group_type,
      head_hr_id,
      is_active: true
    });

    if (!hrTypeConfig) {
      return res.status(400).json({
        message: `HR is not assigned for ${group.group_type} groups`
      });
    }

    const existingMapping = await GroupHRMapping.findOne({
      group_id,
      is_active: true
    });

    if (existingMapping) {
      return res.status(400).json({
        message: 'Group already has an active Head HR'
      });
    }

    const mapping = await GroupHRMapping.create({
      group_id,
      head_hr_id,
      assigned_by: req.user.user_id
    });

    return res.status(201).json({
      message: 'Head HR assigned successfully',
      data: mapping
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// reassignHeadHR
const reassignHeadHR = async (req, res) => {
  try {
    const { group_id, new_head_hr_id } = req.body;

    const group = await Group.findById(group_id);

    if (!group) {
      return res.status(404).json({
        message: 'Group not found'
      });
    }

    const hrTypeConfig = await HRGroupType.findOne({
      group_type: group.group_type,
      head_hr_id: new_head_hr_id,
      is_active: true
    });

    if (!hrTypeConfig) {
      return res.status(400).json({
        message: `HR is not assigned for ${group.group_type} groups`
      });
    }

    await GroupHRMapping.findOneAndUpdate(
      {
        group_id,
        is_active: true
      },
      {
        is_active: false,
        unassigned_at: new Date()
      }
    );

    const mapping = await GroupHRMapping.create({
      group_id,
      head_hr_id: new_head_hr_id,
      assigned_by: req.user.user_id
    });

    return res.json({
      message: 'Head HR reassigned successfully',
      data: mapping
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// assignGroupManager
const assignGroupManager = async (req, res) => {
  try {
    const { group_id, manager_id } = req.body;

    const manager = await User.findById(manager_id);

    if(!manager || manager.role !== "GROUP_MANAGER"){
      return res.status(400).json({
        message:"Invalid Group Manager"
      });
    }

    const group = await Group.findById(group_id);

    if (!group) {
      return res.status(404).json({
        message: 'Group not found'
      });
    }

    const activeCount = await GroupManagerMapping.countDocuments({
      group_manager_id: manager_id,
      is_active: true
    });

    if (activeCount >= 3) {
      return res.status(400).json({
        message: 'Manager cannot manage more than 3 groups'
      });
    }

    const existing = await GroupManagerMapping.findOne({
      group_id,
      is_active: true
    });

    if (existing) {
      return res.status(400).json({
        message: 'Group already has an active manager'
      });
    }

    const mapping = await GroupManagerMapping.create({
      group_id,
      group_manager_id: manager_id,
      assigned_by: req.user.user_id
    });

    return res.status(201).json({
      message: 'Group Manager assigned successfully',
      data: mapping
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// reassignGroupManager
const reassignGroupManager = async (req, res) => {
  try {
    const { group_id, new_manager_id } = req.body;

    const activeCount = await GroupManagerMapping.countDocuments({
      group_manager_id: new_manager_id,
      is_active: true
    });

    if (activeCount >= 3) {
      return res.status(400).json({
        message: 'Manager cannot manage more than 3 groups'
      });
    }

    const currentMapping = await GroupManagerMapping.findOne({
      group_id,
      is_active: true
    });

    if (!currentMapping) {
      return res.status(404).json({
        message: 'No active manager found'
      });
    }

    await GroupManagerMapping.findByIdAndUpdate(
      currentMapping._id,
      {
        is_active: false,
        unassigned_at: new Date()
      }
    );

    const newMapping = await GroupManagerMapping.create({
      group_id,
      group_manager_id: new_manager_id,
      sub_group_manager_id: currentMapping.sub_group_manager_id,
      assigned_by: req.user.user_id
    });

    return res.json({
      message: 'Manager reassigned successfully',
      data: newMapping
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// assignSubGroupManager
const assignSubGroupManager = async (req, res) => {
  try {
    const { group_id, sub_group_manager_id } = req.body;

    const subManager = await User.findById(sub_group_manager_id);

    if( !subManager || subManager.role !== "SUB_GROUP_MANAGER" ){
      return res.status(400).json({
        message:"Invalid Sub Group Manager"
      });
    }

    const mapping = await GroupManagerMapping.findOne({
      group_id,
      is_active: true
    });

    if (!mapping) {
      return res.status(404).json({
        message: 'Group Manager must be assigned first'
      });
    }

    mapping.sub_group_manager_id = sub_group_manager_id;

    await mapping.save();

    return res.json({
      message: 'Sub Group Manager assigned successfully',
      data: mapping
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// removeManager
const removeManager = async (req, res) => {
  try {
    const { group_id } = req.body;

    const mapping = await GroupManagerMapping.findOne({
      group_id,
      is_active: true
    });

    if (!mapping) {
      return res.status(404).json({
        message: 'No active manager found'
      });
    }

    mapping.is_active = false;
    mapping.unassigned_at = new Date();

    await mapping.save();

    return res.json({
      message: 'Manager removed successfully'
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// getGroupHierarchy
const getGroupHierarchy = async (req, res) => {
  try {
    const { group_id } = req.params;

    const group = await Group.findById(group_id);

    const hrMapping = await GroupHRMapping.findOne({
      group_id,
      is_active: true
    });

    const managerMapping = await GroupManagerMapping.findOne({
      group_id,
      is_active: true
    });

    return res.json({
      group,
      head_hr_id: hrMapping?.head_hr_id || null,
      group_manager_id: managerMapping?.group_manager_id || null,
      sub_group_manager_id: managerMapping?.sub_group_manager_id || null
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  assignHRGroupType,
  assignHeadHR,
  reassignHeadHR,
  assignGroupManager,
  reassignGroupManager,
  assignSubGroupManager,
  removeManager,
  getGroupHierarchy
};