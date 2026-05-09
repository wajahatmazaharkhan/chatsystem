require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const http = require('http');
const initSocket = require('./src/socket');

const PORT = process.env.PORT || 3004;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
}

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        server.listen(PORT, () => {
            console.log(`🚀 Chat service running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });