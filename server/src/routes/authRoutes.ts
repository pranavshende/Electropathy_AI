import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { otpRequestLimiter, otpVerifyLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public routes for OTP
router.post('/send-otp', otpRequestLimiter, (req, res) => authController.sendOtp(req, res));
router.post('/verify-otp', otpVerifyLimiter, (req, res) => authController.verifyOtp(req, res));

// Protected routes (require JWT)
router.post('/profile', authenticate, (req, res) => authController.updateProfile(req, res));
router.get('/me', authenticate, (req, res) => authController.getMe(req, res));

export default router;
