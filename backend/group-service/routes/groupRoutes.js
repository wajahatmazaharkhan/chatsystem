const express = require('express');
const router = express.Router();
const { getAllGroups, getGroupById, getGroupMembers, validateMembership, getMyGroup } = require('../controllers/groupController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get("/my-group", authenticate, authorize('GROUP_MANAGER', 'SUB_GROUP_MANAGER', 'STUDENT'), getMyGroup);
router.get('/', authenticate, authorize('ADMIN'), getAllGroups);
router.get('/:group_id', authenticate, authorize('ADMIN', 'GROUP_MANAGER', 'SUB_GROUP_MANAGER'), getGroupById);
router.get('/:group_id/members', authenticate, authorize('ADMIN', 'GROUP_MANAGER', 'SUB_GROUP_MANAGER', 'STUDENT'), getGroupMembers);
router.get('/:group_id/members/validate', authenticate, validateMembership);

module.exports = router;
