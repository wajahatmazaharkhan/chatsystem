const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// GET /users/ranking (available to all roles)
router.get('/ranking', auth, controller.getRanking);

// GET /users
router.get('/', auth, controller.listUsers);

// GET /users/:user_id
router.get('/:user_id', auth, controller.getUser);

// POST /users (ADMIN only - only admins can create users)
router.post('/', auth, rbac('ADMIN'), controller.createUser);

// PATCH /users/:user_id (ADMIN only, toggles is_active)
router.patch('/:user_id', auth, rbac('ADMIN'), controller.patchStatus);

// PATCH /users/:user_id/marks (ADMIN or MANAGER only)
router.patch('/:user_id/marks', auth, rbac(['ADMIN', 'MANAGER']), controller.patchMarks);

module.exports = router;