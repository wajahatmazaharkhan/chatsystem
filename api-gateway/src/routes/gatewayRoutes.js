const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/status", authMiddleware, (req, res) => {

  res.status(200).json({
    success: true,
    message: "Gateway running",
    user: req.user
  });

});

module.exports = router;