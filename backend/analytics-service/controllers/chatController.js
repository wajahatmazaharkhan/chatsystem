const chatService = require("../services/chatService");

exports.sendMessage = async (req, res, next) => {
  try {
    const message = await chatService.sendMessage(req.body);
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;

    const messages = await chatService.getMessages(groupId);

    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};