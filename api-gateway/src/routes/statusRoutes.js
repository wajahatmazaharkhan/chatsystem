const router = require("express").Router();
const controller = require("../controllers/statusController");

router.get("/user/:id", controller.getStudentStatus);

router.get("/group/:id", controller.getGroupStatus);

router.get("/all", controller.getAllStatuses);

router.post("/classify", controller.classifyUsers);

router.patch("/threshold", controller.updateThreshold);

module.exports = router;