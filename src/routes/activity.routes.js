const express = require('express');
const router = express.Router();
const { logActivity, getActivityByUser } = require('../controllers/activity.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.post('/log', authenticate, logActivity);
router.get('/user/:id', authenticate, requireRole('ADMIN', 'MANAGER'), getActivityByUser);

module.exports = router;