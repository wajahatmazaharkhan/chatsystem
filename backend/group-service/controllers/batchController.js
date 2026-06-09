const Batch = require('../models/Batch');
const Group = require('../models/Group');
const User = require('../schema/User');
// const { chunkIntoGroups, buildGroupDocuments } = require('../services/groupingService');

const createBatch = async (req, res) => {
  try {
    const { name, limit } = req.body;

    if (!name || !limit) {
      return res.status(400).json({
        error: 'name and limit are required',
      });
    }

    if (limit > 300) {
      return res.status(400).json({
        error: 'batch limit cannot exceed 300',
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
    const students = await User.find({ _id: { $in: batch.student_ids } },'name email').lean();
    const slotsLeft = batch.limit - batch.enrolled_count;

    const mongoose = require('mongoose');
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
      batch,
      students,
      groups: groupsWithNames,
      total_groups: groups.length,
      slotsLeft
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Batch not found' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const assignManager = async (req, res) => {
  try {
    const { manager_id } = req.body;

    if (!manager_id) {
      return res.status(400).json({ error: 'manager_id is required' });
    }

    const group = await Group.findByIdAndUpdate(
      req.params.group_id,
      { manager_id },
      { new: true }
    );

    if (!group) return res.status(404).json({ error: 'Group not found' });

    return res.status(200).json({
      group_id: group._id,
      manager_id: group.manager_id,
      message: 'Manager assigned successfully',
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Group not found' });
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

    if (group) {
      group.members.push(studentId);

      await group.save();
    } else {
      const groupCount = await Group.countDocuments({
        batch_id,
      });

      group = await Group.create({
        batch_id,
        name: `${batch.name} - Group ${groupCount + 1}`,
        members: [studentId],
      });
    }

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



module.exports = { createBatch, getAllBatches, getBatchById, assignManager, availableBatches, enrollBatch, enrolledBatches };
