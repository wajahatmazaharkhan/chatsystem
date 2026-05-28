const env = process.env;

module.exports = {
  port: Number(env.PORT) || 4000,
  authService: env.AUTH_SERVICE || "http://localhost:5000",
  userService: env.USER_SERVICE || "http://localhost:5001",
  groupService: env.GROUP_SERVICE || "http://localhost:5002",
  chatService: env.CHAT_SERVICE || "http://localhost:5003",
  activityService: env.ACTIVITY_SERVICE || "http://localhost:5004",
  statusService: env.STATUS_SERVICE || "http://localhost:5005",
  analyticsService: env.ANALYTICS_SERVICE || "http://localhost:5006",
  cors: {
    origin: env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: Number(env.RATE_LIMIT_MAX) || 100
  }
};
