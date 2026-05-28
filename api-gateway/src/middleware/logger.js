const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");

const requestTracer = (req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader("X-Request-ID", req.requestId);
  next();
};

const auditLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    const entry = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: durationMs.toFixed(2),
      ip: req.ip,
      user: req.user ? { id: req.user.id || null, role: req.user.role || null } : null
    };

    console.log(JSON.stringify(entry));
  });

  next();
};

const requestLogger = morgan("combined");

module.exports = {
  requestTracer,
  auditLogger,
  requestLogger
};
