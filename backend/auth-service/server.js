// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const { authenticate } = require('./middlewares/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chatsystem';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Auth service connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);

// Test protected route
app.get('/protected', authenticate, (req, res) => {
    res.json({
        message: 'Access granted!',
        user: req.user
    });
});

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Auth Core Running', status: 'OK' });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
    ════════════════════════════════════════
    ✅ Zaheen - Auth Core is running!
    ════════════════════════════════════════
    📍 URL: http://localhost:${PORT}
    
    📌 Endpoints:
    POST   /auth/login   - Login
    POST   /auth/logout  - Logout
    GET    /auth/validate - Validate Token
    GET    /protected    - Protected Route
    `);
    });
}

module.exports = app;