const userService = require("../services/userService");

const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message || "Internal server error" });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers(req.query);
    res.status(200).json(users);
  } catch (err) {
    handleError(res, err);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    handleError(res, err);
  }
};
