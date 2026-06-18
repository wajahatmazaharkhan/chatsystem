const express = require('express');
const router = express.Router();

const { assignHRGroupType, assignHeadHR, reassignHeadHR, assignGroupManager, reassignGroupManager, assignSubGroupManager, removeManager, getGroupHierarchy } = require('../controllers/groupStructureController');

const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/hr-type', authenticate, authorize('ADMIN'), assignHRGroupType);
router.post('/head-hr', authenticate, authorize('ADMIN'), assignHeadHR);
router.patch('/head-hr', authenticate, authorize('ADMIN'), reassignHeadHR);
router.post('/manager', authenticate, authorize('ADMIN'), assignGroupManager);
router.patch('/manager', authenticate, authorize('ADMIN'), reassignGroupManager);
router.post('/sub-manager', authenticate, authorize('ADMIN'), assignSubGroupManager);
router.delete('/manager', authenticate, authorize('ADMIN'), removeManager);

router.get(
  '/:group_id/hierarchy',
  authenticate,
  authorize('ADMIN', 'HEAD_HR', 'GROUP_MANAGER', 'SUB_GROUP_MANAGER'),
  getGroupHierarchy
);

module.exports = router;