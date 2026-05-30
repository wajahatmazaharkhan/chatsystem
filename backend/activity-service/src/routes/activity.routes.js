const express = require('express');
const router = express.Router();

const { logActivity, getuserActivity } = require('../controllers/activity.controller');

const { authenticate, requireRole } = require('../middleware/auth.middleware');

// post /v1/activity/log
router.post('/log', authenticate, logActivity)

// get /v1/activity/user/:id
router.get('/user/:id', authenticate, requireRole('ADMIN'), getuserActivity)

module.exports = router;