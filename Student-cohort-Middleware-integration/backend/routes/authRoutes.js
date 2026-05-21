const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { validateUser } = require("../controllers/authController");

router.get("/validate", authMiddleware, validateUser);

module.exports = router;