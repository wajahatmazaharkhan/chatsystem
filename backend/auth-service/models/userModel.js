// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User Schema - same as user service
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
      enum: [
        'ADMIN',
        'SUB_ADMIN',
        'HEAD_HR',
        'HEAD_HR_PUBLISHING',
        'HEAD_HR_NON_PUBLISHING',
        'GROUP_MANAGER',
        'SUB_GROUP_MANAGER',
        'MANAGER',
        'STUDENT'
      ],
      required: true,
    },
    roleType: {
      type: String,
      validate: {
        validator: function(v) {
          if (v === null || v === undefined || v === '') return true;
          return ["PUBLISHING", "NON_PUBLISHING"].includes(v);
        },
        message: '{VALUE} is not a valid roleType'
      },
      default: null
    },
    permissions: {
      type: [String],
      default: []
    },
    phone: {
      type: String,
      default: null
    },
    contactDetails: {
      type: String,
      default: null
    },
    managedGroups: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
      default: []
    },
    parentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    hierarchyLevel: {
      type: Number,
      default: 6
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    deleted_at: {
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

// Soft-delete middleware
UserSchema.pre(/^find/, function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ deleted_at: null });
  }
});

UserSchema.index({ role: 1 });

const User = mongoose.model('User', UserSchema);

async function findUserByEmail(email) {
  if (!email) return null;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return user;
  } catch (err) {
    console.error('Error finding user:', err);
    return null;
  }
}

async function findUserById(userId) {
  try {
    return await User.findById(userId);
  } catch (err) {
    console.error('Error finding user by id:', err);
    return null;
  }
}

async function validatePassword(user, password) {
  if (!user || !user.password_hash) return false;
  try {
    return await bcrypt.compare(password, user.password_hash);
  } catch (err) {
    console.error('Error validating password:', err);
    return false;
  }
}

module.exports = { findUserByEmail, findUserById, validatePassword, User };