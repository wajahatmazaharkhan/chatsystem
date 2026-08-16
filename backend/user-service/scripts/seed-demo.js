const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../schema/User');

async function seedDemo() {
  try {
    console.log('🌱 Starting demo seed...');

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

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Seed Managers
    const managers = [
      { name: 'Alice Manager', email: 'alice@system.com', role: 'MANAGER' },
      { name: 'Bob Manager', email: 'bob@system.com', role: 'MANAGER' }
    ];

    for (const m of managers) {
      const existing = await User.findOne({ email: m.email });
      if (!existing) {
        await User.create({
          ...m,
          password_hash: hashedPassword,
          is_active: true
        });
        console.log(`👤 Created Manager: ${m.name}`);
      }
    }

    // Seed Students
    const students = [
      { name: 'Charlie Student', email: 'charlie@system.com', role: 'STUDENT', marks: 85 },
      { name: 'Diana Student', email: 'diana@system.com', role: 'STUDENT', marks: 65 },
      { name: 'Eve Student', email: 'eve@system.com', role: 'STUDENT', marks: 45 },
      { name: 'Frank Student', email: 'frank@system.com', role: 'STUDENT', marks: 25 },
      { name: 'Grace Student', email: 'grace@system.com', role: 'STUDENT', marks: 15 },
      { name: 'Henry Student', email: 'henry@system.com', role: 'STUDENT', marks: null } // No marks yet
    ];

    for (const s of students) {
      const existing = await User.findOne({ email: s.email });
      if (!existing) {
        await User.create({
          name: s.name,
          email: s.email,
          role: s.role,
          password_hash: hashedPassword,
          is_active: true,
          performance: {
            marks: s.marks,
            is_visible_to_student: false
          }
        });
        console.log(`🎓 Created Student: ${s.name}`);
      }
    }

    console.log('✅ Demo seed completed successfully!');
    console.log('\n📋 Demo Credentials (password: password123):');
    console.log('   Manager: alice@system.com');
    console.log('   Student: charlie@system.com\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error during demo seed:', error.message);
    process.exit(1);
  }
}

seedDemo();
