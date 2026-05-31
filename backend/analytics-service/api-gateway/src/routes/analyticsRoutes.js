const router =
  require("express").Router();

const controller =
  require("../controllers/analyticsController");

/*
==================================================
ADMIN DASHBOARD
==================================================
*/

router.get(
  "/admin",
  controller.getAdminAnalytics
);

/*
==================================================
GROUP DASHBOARD
==================================================
*/

router.get(
  "/group/:id",
  controller.getGroupAnalytics
);

module.exports = router;