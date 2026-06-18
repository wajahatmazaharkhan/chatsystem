const mongoose = require('mongoose');

const GroupHRMappingSchema = new mongoose.Schema(
  {
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },

    head_hr_id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true,
      index:true
    },

    is_active: {
      type: Boolean,
      default: true,
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


// One active HR assignment per group
GroupHRMappingSchema.index(
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


module.exports = mongoose.model('GroupHRMapping', GroupHRMappingSchema);