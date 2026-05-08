const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// List users with optional role and status filters.
router.get("/", userController.getUsers);

// Fetch a single user by MongoDB ObjectId.
router.get("/:id", userController.getUserById);

module.exports = router;
