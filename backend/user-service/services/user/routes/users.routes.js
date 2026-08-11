const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// GET /users/ranking (available to all roles)
router.get('/ranking', auth, controller.getRanking);

// GET /users
router.get('/', auth, rbac('VIEW_USERS'), controller.listUsers);

// GET /users/:user_id
router.get('/:user_id', auth, rbac('VIEW_USERS'), controller.getUser);

// POST /users
router.post('/', auth, rbac('CREATE_USERS'), controller.createUser);

// PUT /users/:user_id
router.put('/:user_id', auth, rbac('EDIT_USERS'), controller.updateUser);

// PATCH /users/:user_id (toggles is_active)
router.patch('/:user_id', auth, rbac('EDIT_USERS'), controller.patchStatus);

// PATCH /users/:user_id/marks (ADMIN or MANAGER only)
router.patch('/:user_id/marks', auth, rbac(['ADMIN', 'MANAGER']), controller.patchMarks);

module.exports = router;