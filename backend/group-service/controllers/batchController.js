const Batch = require('../models/Batch');
const Group = require('../models/Group');
const User = require('../schema/User');
const GroupManagerMapping = require('../models/GroupManagerMapping');
const GroupHRMapping = require('../models/GroupHRMapping');
// const { chunkIntoGroups, buildGroupDocuments } = require('../services/groupingService');

const createBatch = async (req, res) => {
  try {
    const { name, limit } = req.body;

    if (!name || !limit) {
      return res.status(400).json({
        error: 'name and limit are required',
      });
    }

    if (limit > 140) {
      return res.status(400).json({
        error: 'batch limit cannot exceed 140',
      });
    }

    const existingBatch = await Batch.findOne({ name });

    if (existingBatch) {
      return res.status(409).json({
        error: 'batch name already exists',
      });
    }

    const batch = await Batch.create({
      name,
      limit,
      created_by: req.user.user_id,
    });

    const groups = [];

  // 8 Publishing Groups
  for (let i = 1; i <= 8; i++) {
    groups.push({
      batch_id: batch._id,
      name: `${batch.name} - Publishing Group ${i}`,
      group_type: 'publishing',
      members: []
    });
  }

  // 12 Non Publishing Groups
  for (let i = 1; i <= 12; i++) {
    groups.push({
      batch_id: batch._id,
      name: `${batch.name} - Non Publishing Group ${i}`,
      group_type: 'non-publishing',
      members: []
    });
  }

  await Group.insertMany(groups);

    return res.status(201).json({
      batch_id: batch._id,
      name: batch.name,
      limit: batch.limit,
      enrolled_count: batch.enrolled_count,
      created_at: batch.created_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ created_at: -1 }).lean();
    const result = await Promise.all(
    batches.map(async (batch) => {
      const totalGroups = await Group.countDocuments({
        batch_id: batch._id,
      });

      return {
        ...batch,
        total_groups: totalGroups,
        slots_left: batch.limit - batch.enrolled_count,
      };
    })
  );
  return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batch_id).lean();
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const groups = await Group.find({ batch_id: batch._id }).lean();
    const students = await User.find({ _id: { $in: batch.student_ids } },'name email role').lean();
    const slotsLeft = batch.limit - batch.enrolled_count;

    const mongoose = require('mongoose');
    const managerMappings = await GroupManagerMapping.find({ group_id: { $in: groups.map(g => g._id) }, is_active: true }).lean();   
    const hrMappings = await GroupHRMapping.find({ group_id: { $in: groups.map(g => g._id) }, is_active: true}).lean();

    const managerMap = {};
    const hrMap = {};

    managerMappings.forEach(m => {
      managerMap[m.group_id.toString()] = m;
    });

    hrMappings.forEach(h => {
      hrMap[h.group_id.toString()] = h;
    });

    groups.sort((a, b) => {
      if (a.group_type !== b.group_type) {
        return a.group_type === 'publishing' ? -1 : 1;
      }

      const aNum = parseInt(a.name.match(/\d+$/)[0]);
      const bNum = parseInt(b.name.match(/\d+$/)[0]);

      return aNum - bNum;
    });

    const groupsData = groups.map(group => ({
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
      batch,
      students,
      groups: groupsData,
      total_groups: groups.length,
      slots_left: slotsLeft
    });

  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Batch not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const availableBatches = async (req, res) => {
  try {
    const studentId = req.user.user_id;

    const batches = await Batch.find({
      student_ids: { $ne: studentId },
      $expr: {
        $lt: ['$enrolled_count', '$limit'],
      },
    }).sort({ created_at: -1 });

    return res.status(200).json(batches);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};


const enrollBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;

    const studentId = req.user.user_id;

    const batch = await Batch.findById(batch_id);

    if (!batch) {
      return res.status(404).json({
        error: 'Batch not found',
      });
    }

    if (batch.enrolled_count >= batch.limit) {
      return res.status(400).json({
        error: 'Batch is full',
      });
    }

    const alreadyEnrolled = batch.student_ids.some(
      id => id.toString() === studentId.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        error: 'Already enrolled',
      });
    }

    let group = await Group.findOne({
      batch_id,
      $expr: {
        $lt: [{ $size: '$members' }, 7],
      },
    }).sort({ created_at: 1 });

    if (!group) {
      return res.status(400).json({
        error: 'All groups are full'
      });
    }

    group.members.push(studentId);

    await group.save();

    batch.student_ids.push(studentId);
    batch.enrolled_count += 1;

    await batch.save();

    return res.status(200).json({
      message: 'Successfully enrolled',
      batch_id: batch._id,
      group_id: group._id,
      group_name: group.name,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};


const enrolledBatches = async (req, res) => {
  try {
    const studentId = req.user.user_id;

    const batches = await Batch.find({
      student_ids: studentId,
    }).sort({
      created_at: -1,
    });

    return res.status(200).json(batches);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};



module.exports = { createBatch, getAllBatches, getBatchById, availableBatches, enrollBatch, enrolledBatches };
