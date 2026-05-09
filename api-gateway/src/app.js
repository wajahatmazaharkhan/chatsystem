
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const { requestTracer, auditLogger, requestLogger } = require("./middleware/logger");
const authMiddleware = require("./middleware/authMiddleware");
const allowRoles = require("./middleware/rbac");
const errorHandler = require("./middleware/errorHandler");
const responseFormatter = require("./middleware/responseFormatter");

const healthRoutes = require("./routes/healthRoutes");
const gatewayRoutes = require("./routes/gatewayRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const chatRoutes = require("./routes/chatRoutes");
const activityRoutes = require("./routes/activityRoutes");
const statusRoutes = require("./routes/statusRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cors(config.cors));
app.use(helmet());
app.use(requestTracer);
app.use(requestLogger);
app.use(auditLogger);
app.use(limiter);
app.use(responseFormatter);

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.headers["content-type"] && !req.is("application/json")) {
    return res.error("Content-Type must be application/json", 415);
  }

  next();
});

app.use("/health", healthRoutes);
app.use("/gateway", gatewayRoutes);
app.use("/v1/auth", authRoutes);
app.use("/v1/users", authMiddleware, allowRoles("ADMIN"), userRoutes);
app.use("/v1/groups", authMiddleware, allowRoles("ADMIN", "MANAGER"), groupRoutes);
app.use("/v1/chat", authMiddleware, allowRoles("ADMIN", "MANAGER", "STUDENT"), chatRoutes);
app.use("/v1/activity", authMiddleware, activityRoutes);
app.use("/v1/status", authMiddleware, statusRoutes);
app.use("/v1/analytics", authMiddleware, allowRoles("ADMIN", "MANAGER"), analyticsRoutes);

app.get("/", (req, res) => {
  res.success({ gateway: "active" }, "API Gateway online");
});

app.use((req, res) => {
  res.error("Route not found", 404);
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.error("Malformed JSON body", 400, err.message);
  }

  next(err);
});

app.use(errorHandler);

module.exports = app;
