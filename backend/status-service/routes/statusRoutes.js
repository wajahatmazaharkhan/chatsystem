const router = require("express").Router();

const controller =
  require("../controllers/statusController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);
// router.use(allowRoles("ADMIN", "MANAGER"));
router.get(
  "/user/:id",
   controller.getStudentStatus);
router.get(
  "/group/:id", 
  controller.getGroupStatus);
router.get(
  "/all",
  controller.getAllStatuses);
router.post(
  "/classify",
  controller.classifyUsers);
router.patch(
  "/threshold",
  controller.updateThreshold);

module.exports = router;