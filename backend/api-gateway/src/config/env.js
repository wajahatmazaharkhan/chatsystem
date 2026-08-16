const dotenv = require('dotenv');

dotenv.config();

const config = {

  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  modules: {
    auth: process.env.MODULE_1_AUTH_URL || 'http://localhost:3001',
    users: process.env.MODULE_2_USERS_URL || 'http://localhost:3002',
    groups: process.env.MODULE_3_GROUPS_URL || 'http://localhost:3003',
    chat: process.env.MODULE_4_CHAT_URL || 'http://localhost:3004',
    activity: process.env.MODULE_5_ACTIVITY_URL || 'http://localhost:3005',
    status: process.env.MODULE_6_STATUS_URL || 'http://localhost:3006',
    analytics: process.env.MODULE_7_ANALYTICS_URL || 'http://localhost:3007',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes by default
    max: process.env.NODE_ENV === "development"
      ? 1000
      : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  }
};
console.log('Auth proxy target:', config.modules.auth);

module.exports = config;
