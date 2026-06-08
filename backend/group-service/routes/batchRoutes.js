const express = require('express');
const router = express.Router();
const { createBatch, getAllBatches, getBatchById, assignManager, availableBatches, enrollBatch, enrolledBatches } = require('../controllers/batchController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', authenticate, authorize('ADMIN'), createBatch);
router.get('/', authenticate, authorize('ADMIN'), getAllBatches);
router.get('/available', authenticate, authorize('STUDENT'), availableBatches);
router.get('/enrolled', authenticate, authorize('STUDENT'), enrolledBatches)
router.post('/:batch_id/enroll', authenticate, authorize('STUDENT'), enrollBatch);
router.get('/:batch_id', authenticate, authorize('ADMIN'), getBatchById);
router.patch('/groups/:group_id/manager', authenticate, authorize('ADMIN'), assignManager);

module.exports = router;
