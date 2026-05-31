const crypto = require('crypto');

const traceIdMiddleware = (req, res, next) => {
  const traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
};

module.exports = traceIdMiddleware;
