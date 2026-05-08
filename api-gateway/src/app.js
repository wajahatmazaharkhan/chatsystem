
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authMiddleware = require("./middleware/authMiddleware");
const allowRoles = require("./middleware/rbac");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const chatRoutes = require("./routes/chatRoutes");
const activityRoutes = require("./routes/activityRoutes");
const statusRoutes = require("./routes/statusRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

/*
  Global Middleware
*/
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

/*
  Health Check Route
*/
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Gateway running successfully"
  });
});

/*
  Gateway Status Route
*/
app.get("/gateway/status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gateway active",
    services: {
      auth: process.env.AUTH_SERVICE,
      users: process.env.USER_SERVICE,
      groups: process.env.GROUP_SERVICE,
      chat: process.env.CHAT_SERVICE,
      activity: process.env.ACTIVITY_SERVICE,
      status: process.env.STATUS_SERVICE,
      analytics: process.env.ANALYTICS_SERVICE
    }
  });
});

/*
  Auth Routes
*/
app.use("/v1/auth", authRoutes);

/*
  User Routes
  ADMIN only
*/
app.use(
  "/v1/users",
  authMiddleware,
  allowRoles("ADMIN"),
  userRoutes
);

/*
  Group Routes
  ADMIN and MANAGER
*/
app.use(
  "/v1/groups",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  groupRoutes
);

/*
  Chat Routes
  All authenticated users
*/
app.use(
  "/v1/chat",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER", "STUDENT"),
  chatRoutes
);

/*
  Activity Routes
*/
app.use(
  "/v1/activity",
  authMiddleware,
  activityRoutes
);

/*
  Status Routes
*/
app.use(
  "/v1/status",
  authMiddleware,
  statusRoutes
);

/*
  Analytics Routes
  ADMIN and MANAGER only
*/
app.use(
  "/v1/analytics",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  analyticsRoutes
);

/*
  Default Route
*/
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Student Cohort API Gateway"
  });
});

/*
  404 Route Handler
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/*
  Global Error Handler
*/
app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });

});

module.exports = app;
