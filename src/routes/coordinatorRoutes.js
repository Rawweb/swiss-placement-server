import express from 'express';
import {
  getUnverifiedEmployers,
  verifyEmployer,
  getOverviewStats,
  getPlacementRecords,
} from '../controllers/coordinatorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/employers/unverified', protect, authorize('coordinator'), getUnverifiedEmployers);
router.patch('/employers/:id/verify', protect, authorize('coordinator'), verifyEmployer);
router.get('/stats', protect, authorize('coordinator'), getOverviewStats);
router.get('/placements', protect, authorize('coordinator'), getPlacementRecords);

export default router;
