const errorHandler = (err, req, res, next) => {
  console.error(err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    requestId: req.requestId,
    details: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

module.exports = errorHandler;
