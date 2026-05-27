const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

const authMiddleware = require("../middleware/auth");
const validateGroupMember = require("../middleware/validateGroup");

// send message
router.post("/send", authMiddleware, validateGroupMember, chatController.sendMessage);

// get messages
router.get("/:groupId", authMiddleware, validateGroupMember, chatController.getMessages);

module.exports = router;