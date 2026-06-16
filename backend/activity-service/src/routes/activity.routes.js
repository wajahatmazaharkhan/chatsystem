const express = require('express');
const router = express.Router();

const { logActivity, getuserActivity, getStudentsInactivityReport } = require('../controllers/activity.controller');

const { authenticate, requireRole } = require('../middleware/auth.middleware');

// post /v1/activity/log
router.post('/log', authenticate, logActivity)

const checkAccess = (req, res, next) => {
  const { role, user_id } = req.user;
  if (role === 'STUDENT' && user_id !== req.params.id) {
    return res.status(403).json({ error: "Access denied: cannot view other users' activity" });
  }
  next();
};

// get /v1/activity/user/:id
router.get('/user/:id', authenticate, requireRole('ADMIN', 'MANAGER', 'STUDENT'), checkAccess, getuserActivity);

// POST /v1/activity/students/inactivity-status
// Restricted to Admins and Sub-Admins (Managers)
router.post(
  '/students/inactivity-status', 
  authenticate, 
  requireRole('ADMIN', 'MANAGER'), 
  getStudentsInactivityReport
);

module.exports = router;