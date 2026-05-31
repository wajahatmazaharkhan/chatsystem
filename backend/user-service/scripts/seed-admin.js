/**
 * Seed Script: Create Initial ADMIN User
 * 
 * This script creates the first ADMIN user in the system.
 * Run this ONCE during initial setup.
 * 
 * Usage: node scripts/seed-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../schema/User');

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seed...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not configured in .env');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@system.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists at admin@system.com');
      console.log(`   User ID: ${existingAdmin._id}`);
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@system.com',
      password_hash: hashedPassword,
      role: 'ADMIN',
      is_active: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@system.com');
    console.log('   Password: admin123');
    console.log(`   User ID: ${adminUser._id}`);
    console.log('\n⚠️  IMPORTANT: Change this password in production!');
    console.log('⚠️  Keep these credentials secure!\n');

    await mongoose.connection.close();
    console.log('✅ Seed completed');

  } catch (error) {
    console.error('❌ Error during seed:', error.message);
    process.exit(1);
  }
}

seedAdmin();
