const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] TraceID: ${req.traceId} - ${message}`, err.stack);

  res.status(status).json({
    status: 'error',
    message: message,
    traceId: req.traceId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
