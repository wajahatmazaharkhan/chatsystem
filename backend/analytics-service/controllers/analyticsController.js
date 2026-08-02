const analyticsService =
  require("../services/analyticsService");

/*
==================================================
ADMIN ANALYTICS
==================================================
*/

exports.getAdminAnalytics =
  async (req, res) => {

    try {
      const token = req.headers.authorization;
      const result =
        await analyticsService
          .getAdminAnalytics(token, req.query);

      res.status(200).json(result);

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });
    }
  };

/*
==================================================
GROUP ANALYTICS
==================================================
*/

exports.getGroupAnalytics =
  async (req, res) => {

    try {
      const token = req.headers.authorization;
      const result =
        await analyticsService
          .getGroupAnalytics(
            req.params.id,
            token
          );

      res.status(200).json(result);

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });
    }
  };

exports.getStudentAnalytics = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID header missing' });
    }
    
    const result = await analyticsService.getStudentAnalytics(userId, token);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getManagerAnalytics = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const managerId = req.headers['x-user-id'];

    if (!managerId) {
      return res.status(400).json({ error: 'Manager User ID header missing' });
    }

    const result = await analyticsService.getManagerAnalytics(managerId, token);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getActivityLogs = async (req, res, next) => {
  try {
    const data = await analyticsService.getActivityLogs(
      req.headers.authorization,
      req.query
    );

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.getBatchOverview = async (req, res, next) => {
  try {
    const result = await analyticsService.getBatchOverview(
      req.headers.authorization
    );

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching batch overview:', err);
    next(err);
  }
};