const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Default validate URL if not provided
process.env.AUTH_VALIDATE_URL = process.env.AUTH_VALIDATE_URL || 'http://localhost:3001/auth/validate';

console.log("SERVER STARTING...");
console.log("Mounting /users route...");

// Mount user routes
const userRoutes = require('./services/user/routes/users.routes');
app.use('/users', userRoutes);
 console.log("➡️ HIT /users base route");
//Mount auth routes
const authRoutes = require('./student-cohort-auth-module/routes/authRoutes');
app.use('/auth', authRoutes);

// Health
app.get('/', (req, res) => res.json({ service: 'user-service', status: 'ok' }));

async function start() {
  const PORT = process.env.PORT || 3002;

  // Connect to MongoDB if MONGO_URI provided, otherwise attempt to start an in-memory server
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', mongoUri);
  } else {
    // Attempt to start an in-memory MongoDB for local/manual testing when no MONGO_URI is provided.
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      console.log('No MONGO_URI provided — starting in-memory MongoDB for testing...');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to in-memory MongoDB');
    } catch (e) {
      console.warn('No MONGO_URI provided and failed to start in-memory MongoDB. Some routes may fail without a database.');
    }
  }

  app.listen(PORT, () => {
    console.log(`user-service listening on http://localhost:${PORT}`);
  });
}

if (require.main === module) start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});

module.exports = app;
