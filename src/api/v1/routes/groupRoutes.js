const express = require('express');
const router = express.Router();
const validateAuth = require('../../../middleware/authMiddleware');
const {
    create,
    get,
    update,
    remove,
    addGroupMember,
    removeGroupMember
} = require('../controllers/groupController');

// Apply authentication to all group routes
router.use(validateAuth);

// Admin: Create a group
router.post('/', create);

// Members/Admin: Get group details
router.get('/:group_id', get);

// Admin: Update group (e.g. name, manager)
router.put('/:group_id', update);

// Admin: Delete/Archive group
router.delete('/:group_id', remove);

// Admin: Add a member
router.post('/:group_id/members', addGroupMember);

// Admin: Remove a member
router.delete('/:group_id/members/:member_id', removeGroupMember);

module.exports = router;
