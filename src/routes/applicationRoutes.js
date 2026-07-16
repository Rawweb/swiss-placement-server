import express from 'express';
import {
  applyToOpportunity,
  getMyApplications,
  getApplicationsForMyOpportunities,
  decideApplication,
  getAllApplications,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('student'), applyToOpportunity);
router.get('/mine', protect, authorize('student'), getMyApplications);
router.get('/received', protect, authorize('employer'), getApplicationsForMyOpportunities);
router.patch('/:id/decide', protect, authorize('employer'), decideApplication);
router.get('/all', protect, authorize('coordinator'), getAllApplications);

export default router;
