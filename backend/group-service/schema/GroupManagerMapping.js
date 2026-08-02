const mongoose = require('mongoose');

const GroupManagerMappingSchema = new mongoose.Schema(
  {
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },

    group_manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    sub_group_manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    is_active: {
      type: Boolean,
      default: true, //indicates that the manager is currently managing the group
    },

    assigned_by: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true,
    },

    assigned_at: {
      type: Date,
      default: Date.now,
    },

    unassigned_at: {
      type: Date,
      default: null,
    },

  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Only one active mapping per group
GroupManagerMappingSchema.index(
  {
    group_id: 1,
    is_active: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      is_active: true,
    },
  }
);

// Fast manager lookups
GroupManagerMappingSchema.index({
  group_manager_id: 1,
  is_active: 1,
});


// Fast subgroup manager lookups
GroupManagerMappingSchema.index({
  sub_group_manager_id: 1,
  is_active: 1,
});

module.exports = mongoose.model('GroupManagerMapping', GroupManagerMappingSchema);
