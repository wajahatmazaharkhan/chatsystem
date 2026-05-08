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
      enum: ['ADMIN', 'MANAGER', 'STUDENT'],
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

// Indexes: enforce uniqueness at DB level and add common query indexes
// Use collation for case-insensitive uniqueness on email
UserSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
UserSchema.index({ role: 1 });
UserSchema.index({ is_active: 1 });

module.exports = mongoose.model('User', UserSchema);
