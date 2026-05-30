const express = require('express');
const router = express.Router();

const config = require('../../config/env');
const authMiddleware = require('../../middlewares/auth.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');
const createServiceProxy = require('../../middlewares/proxy');

// --- Proxies ---
const authProxy = createServiceProxy(config.modules.auth);
const usersProxy = createServiceProxy(config.modules.users);
const groupsProxy = createServiceProxy(config.modules.groups);
const chatProxy = createServiceProxy(config.modules.chat);
const activityProxy = createServiceProxy(config.modules.activity);
const statusProxy = createServiceProxy(config.modules.status);
const analyticsProxy = createServiceProxy(config.modules.analytics);

// ==========================================
// Module 1: Auth
// Typically public endpoints like /login or /validate don't need auth checking
// here, as Module 1 itself handles them.
// ==========================================
router.use('/auth', authProxy);

// ==========================================
// Module 2: Users
// Assuming general user profile routes need at least STUDENT access,
// but user creation might need ADMIN. For now, we apply basic Auth globally to /users,
// and you could define more granular routing if needed.
// ==========================================
router.use('/users', authMiddleware, usersProxy);

// ==========================================
// Module 3: Groups & Batches
// ==========================================
router.use('/batches', authMiddleware, rbacMiddleware(['ADMIN', 'MANAGER']), groupsProxy);
router.use('/groups', authMiddleware, groupsProxy);

// ==========================================
// Module 4: Chat
// ==========================================
router.use('/chat', authMiddleware, chatProxy);

// ==========================================
// Module 5: Activity
// Gateway logs message activities automatically by hitting Module 5? Or clients hit /activity directly?
// Assuming clients or other modules hit this via gateway.
// ==========================================
router.use('/activity', authMiddleware, activityProxy);

// ==========================================
// Module 6: Status
// ==========================================
router.use('/status', authMiddleware, statusProxy);

// ==========================================
// Module 7: Analytics
// Restricted to ADMIN and MANAGER
// ==========================================
router.use('/analytics', authMiddleware, rbacMiddleware(['ADMIN', 'MANAGER']), analyticsProxy);

module.exports = router;
