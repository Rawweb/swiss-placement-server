import express from 'express';
import { registerUser, loginUser, updateMyProfile, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.patch('/me', protect, updateMyProfile);
router.get('/me', protect, getMe);
export default router;
