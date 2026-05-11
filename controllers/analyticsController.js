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

      const result =
        await analyticsService
          .getAdminAnalytics();

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

      const result =
        await analyticsService
          .getGroupAnalytics(
            req.params.id
          );

      res.status(200).json(result);

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });
    }
  };