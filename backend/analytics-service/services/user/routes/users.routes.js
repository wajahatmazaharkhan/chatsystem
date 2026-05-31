const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// GET /users
router.get('/', auth, controller.listUsers);

// GET /users/:user_id
router.get('/:user_id', auth, controller.getUser);

// POST /users (ADMIN only)
router.post('/', auth, rbac('ADMIN'), controller.createUser);

// PATCH /users/:user_id (ADMIN only, toggles is_active)
router.patch('/:user_id', auth, rbac('ADMIN'), controller.patchStatus);

module.exports = router;
