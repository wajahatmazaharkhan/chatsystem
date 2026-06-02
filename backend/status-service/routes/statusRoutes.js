const router = require("express").Router();

const controller =
  require("../controllers/statusController");
const {authMiddleware} = require("../middlewares/authMiddleware");
const {requireRole} = require("../middlewares/authMiddleware")

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
  "/classify", requireRole("ADMIN, MANAGER"),
  controller.classifyUsers);
router.patch(
  "/threshold", requireRole("ADMIN, MANAGER"),
  controller.updateThreshold);

module.exports = router;