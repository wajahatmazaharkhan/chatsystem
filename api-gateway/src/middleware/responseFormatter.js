const responseFormatter = (req, res, next) => {
  res.success = (data, message = "Success", status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      requestId: req.requestId,
      data
    });
  };

  res.error = (message = "Unexpected error", status = 500, details = null) => {
    const payload = {
      success: false,
      message,
      requestId: req.requestId
    };

    if (details) {
      payload.details = details;
    }

    return res.status(status).json(payload);
  };

  next();
};
