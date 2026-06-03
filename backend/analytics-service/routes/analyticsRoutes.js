const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/admin', analyticsController.getAdminAnalytics);
router.get('/group', analyticsController.getManagerAnalytics);
router.get('/group/:id', analyticsController.getGroupAnalytics);
router.get('/student', analyticsController.getStudentAnalytics);

module.exports = router;

