const express = require('express');
const router = express.Router();
const { logLogin, getLoginHistory } = require('../controllers/loginController');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/log', logLogin);
router.get('/user/:id', authenticate, requireRole('ADMIN', 'MANAGER'), getLoginHistory);

module.exports = router;