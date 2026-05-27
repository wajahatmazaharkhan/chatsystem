const mongoose = require("mongoose");
const service = require("../services/statusService");

/*
==================================================
USER STATUS
==================================================
*/
exports.getStudentStatus = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }
  try {
    const result = await service.getStudentStatus(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/*
==================================================
GROUP STATUS
==================================================
*/
exports.getGroupStatus = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid group ID format" });
  }
  try {
    const result = await service.getGroupStatus(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Group not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

/*
==================================================
ALL STATUS
==================================================
*/
exports.getAllStatuses = async (req, res) => {
  try {
    const result = await service.getAllStatuses();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/*
==================================================
CLASSIFY
==================================================
*/
exports.classifyUsers = async (req, res) => {
  try {
    const result = await service.classifyAllUsers(req.body.threshold_days);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/*
==================================================
THRESHOLD
==================================================
*/
exports.updateThreshold = async (req, res) => {
  try {
    const result = await service.updateThreshold(
      req.body.threshold_days,
      req.body.updated_by
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};