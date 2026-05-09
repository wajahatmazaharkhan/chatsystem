const express = require("express");
const axios = require("axios");

const createProxyRouter = (serviceUrl, serviceName) => {
  const router = express.Router();

  router.use(async (req, res) => {
    try {
      const response = await axios({
        method: req.method,
        url: `${serviceUrl}${req.originalUrl}`,
        data: req.body,
        headers: {
          Authorization: req.headers.authorization,
          "Content-Type": req.headers["content-type"] || "application/json"
        },
        timeout: 8000
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status || 502;
      const message = error.response?.data?.message || `${serviceName} service unavailable`;

      res.status(status).json({
        success: false,
        message
      });
    }
  });

  return router;
};

module.exports = { createProxyRouter };
