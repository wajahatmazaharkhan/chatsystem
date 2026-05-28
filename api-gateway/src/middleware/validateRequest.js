const validateRequest = (schema = {}) => {
  return (req, res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const errors = [];

      Object.entries(schema).forEach(([field, config]) => {
        const value = req.body[field];

        if (config.required && (value === undefined || value === null || value === "")) {
          errors.push(`${field} is required`);
          return;
        }

        if (config.type && value !== undefined && value !== null && typeof value !== config.type) {
          errors.push(`${field} must be a ${config.type}`);
        }

        if (config.validator && typeof config.validator === "function") {
          const valid = config.validator(value, req);
          if (valid !== true) {
            errors.push(valid || `${field} is invalid`);
          }
        }
      });

      if (errors.length) {
        return res.status(400).json({
          success: false,
          message: "Request validation failed",
          requestId: req.requestId,
          errors
        });
      }
    }

    next();
  };
};

module.exports = validateRequest;
