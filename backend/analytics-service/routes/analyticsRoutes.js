const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/admin', analyticsController.getAdminAnalytics);
router.get('/group/:id', analyticsController.getGroupAnalytics);

module.exports = router;
