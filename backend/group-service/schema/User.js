const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'STUDENT', 'GROUP_MANAGER', 'SUB_GROUP_MANAGER', 'HEAD_HR'],
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    deleted_at: {
      type: Date,
      default: null, // soft-delete
    },
    performance: {
      marks: {
        type: Number,
        default: null
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      updatedAt: {
        type: Date
      },
      internshipPerformance: {
        type: mongoose.Schema.Types.Mixed
      }
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Soft-delete middleware
UserSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
