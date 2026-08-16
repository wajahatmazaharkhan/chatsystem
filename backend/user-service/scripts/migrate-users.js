const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../schema/User');
const { getHierarchyLevel, getDefaultPermissions } = require('../services/user/utils/rbacHelpers');

async function runMigration() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not set in .env file.');
    process.exit(1);
  }

  console.log(`🔌 Connecting to MongoDB: ${uri}`);
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB.');

    // Fetch all users (including soft deleted)
    const users = await User.find({}).setOptions({ includeDeleted: true });
    console.log(`📊 Found ${users.length} users in database.`);

    let migratedCount = 0;
    for (const user of users) {
      let updated = false;

      // MANAGER -> GROUP_MANAGER migration
      if (user.role === 'MANAGER') {
        console.log(`🔄 Migrating role MANAGER -> GROUP_MANAGER for user: ${user.email}`);
        user.role = 'GROUP_MANAGER';
        updated = true;
      }

      // Default hierarchyLevel
      const expectedLevel = getHierarchyLevel(user.role);
      if (user.hierarchyLevel === undefined || user.hierarchyLevel === null || user.hierarchyLevel !== expectedLevel) {
        console.log(`📈 Setting hierarchyLevel to ${expectedLevel} for user: ${user.email} (current role: ${user.role})`);
        user.hierarchyLevel = expectedLevel;
        updated = true;
      }

      // Default permissions
      const expectedPermissions = getDefaultPermissions(user.role, user.roleType);
      if (!user.permissions || user.permissions.length === 0) {
        console.log(`🔑 Setting default permissions for user: ${user.email}`);
        user.permissions = expectedPermissions;
        updated = true;
      }

      // Ensure safe defaults for other new fields
      if (user.roleType === undefined) {
        user.roleType = null;
        updated = true;
      }
      if (user.contactDetails === undefined) {
        user.contactDetails = null;
        updated = true;
      }
      if (!user.managedGroups) {
        user.managedGroups = [];
        updated = true;
      }
      if (user.parentUser === undefined) {
        user.parentUser = null;
        updated = true;
      }
      if (user.createdBy === undefined) {
        user.createdBy = null;
        updated = true;
      }

      if (updated) {
        await user.save();
        migratedCount++;
      }
    }

    console.log(`🎉 Migration finished. Updated ${migratedCount} users.`);
  } catch (err) {
    console.error('❌ Error running migration:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

runMigration();
