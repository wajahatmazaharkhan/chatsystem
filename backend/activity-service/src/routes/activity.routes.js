const express = require('express');
const router = express.Router();

const { logActivity, getuserActivity, getStudentsInactivityReport, getSummary, getLogs, countActivitiesByUsers, queryActivities, getBatchSummary } = require('../controllers/activity.controller');

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

router.get(
  "/summary",
  authenticate,
  requireRole("ADMIN", "SUB_ADMIN", "MANAGER"),
  getSummary,
);

router.get('/logs', authenticate, requireRole("ADMIN", "SUB_ADMIN", "MANAGER"), getLogs)
router.post("/count-by-users", authenticate, requireRole("  ADMIN", "SUB_ADMIN", "MANAGER"), countActivitiesByUsers);
router.post(
  "/query",
  authenticate,
  requireRole("ADMIN", "SUB_ADMIN", "MANAGER"),
  queryActivities
);

router.post(
  "/batch-summary",
  authenticate,
  requireRole("ADMIN", "SUB_ADMIN", "MANAGER"),
  getBatchSummary
);

module.exports = router;