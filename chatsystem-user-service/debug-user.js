const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

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

const User = mongoose.model('User', UserSchema);

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'admin@system.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      deleted_at: user.deleted_at,
      password_hash: user.password_hash ? `${user.password_hash.substring(0, 20)}...` : null,
    });

    // Test password
    const isPasswordValid = await bcrypt.compare('admin123', user.password_hash);
    console.log('Password validation:', isPasswordValid ? '✅ VALID' : '❌ INVALID');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
