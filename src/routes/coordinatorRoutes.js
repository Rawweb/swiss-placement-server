import express from 'express';
import { getUnverifiedEmployers, verifyEmployer } from '../controllers/coordinatorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/employers/unverified', protect, authorize('coordinator'), getUnverifiedEmployers);
router.patch('/employers/:id/verify', protect, authorize('coordinator'), verifyEmployer);

export default router;
