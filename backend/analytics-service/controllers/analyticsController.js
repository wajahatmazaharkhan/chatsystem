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
          .getAdminAnalytics(token);

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