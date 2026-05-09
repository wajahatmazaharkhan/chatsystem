const router = require("express").Router();

const controller =
  require("../controllers/statusController");

router.get(
  "/user/:id",
  controller.getStudentStatus
);

router.get(
  "/group/:id",
  controller.getGroupStatus
);

module.exports = router;