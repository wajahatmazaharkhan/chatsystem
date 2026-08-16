const mongoose = require('mongoose');

const HRGroupTypeSchema = new mongoose.Schema(
  {
    head_hr_id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true,
      index:true
    },

    group_type: {
      type: String,
      enum: ['publishing', 'non-publishing'],
      required: true,
      index: true
    },

    is_active: {
      type: Boolean,
      default: true
    },

    assigned_by: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

HRGroupTypeSchema.index(
  {
    group_type:1,
    is_active:1
  },
  {
    unique:true,
    partialFilterExpression:{
      is_active:true
    }
  }
);


module.exports = mongoose.model(
  'HRGroupType',
  HRGroupTypeSchema
);