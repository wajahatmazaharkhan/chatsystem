const mongoose = require("mongoose");
const service = require("../services/statusService");

/*
==================================================
USER STATUS
==================================================
*/
exports.getStudentStatus = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "Missing user ID" });
  }
  try {
    const result = await service.getStudentStatus(req.params.id,  req.headers.authorization);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || err });
  }
};

/*
==================================================
GROUP STATUS
==================================================
*/
exports.getGroupStatus = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "Missing group ID" });
  }
  try {
    const result = await service.getGroupStatus(req.params.id,  req.headers.authorization);
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
    const result = await service.getAllStatuses( req.headers.authorization);
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
    const result = await service.classifyAllUsers(req.body.threshold_days,  req.headers.authorization);
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
      req.user?.email
    );
    res.status(200).json(result);
  } catch (err) {
      return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error"
  });
  }
};