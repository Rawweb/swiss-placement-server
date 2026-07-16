import express from 'express';
import {
  createOpportunity,
  getMyOpportunities,
  browseOpportunities,
} from '../controllers/opportunityController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('employer'), createOpportunity);
router.get('/mine', protect, authorize('employer'), getMyOpportunities);
router.get('/', protect, authorize('student'), browseOpportunities);

export default router;
