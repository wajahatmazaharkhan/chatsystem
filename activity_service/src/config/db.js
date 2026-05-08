const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const connec = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 20,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.info(`MongoDB connected: ${connec.connection.host}`);
    } catch(err) {
        logger.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected — attempting reconnect...');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error:', err.message);
});

module.exports = connectDB