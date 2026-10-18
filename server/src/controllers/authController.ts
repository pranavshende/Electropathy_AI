import { Request, Response } from 'express';
import { otpService } from '../services/otpService.js';
import { userService } from '../services/userService.js';
import { tokenService } from '../services/tokenService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export class AuthController {
  /**
   * Request OTP for mobile number
   * POST /api/auth/send-otp
   */
  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { mobileNumber } = req.body;

      if (!mobileNumber || typeof mobileNumber !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Mobile number is required.'
        });
        return;
      }

      const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);
      if (cleanNumber.length !== 10 || !/^[6-9]\d{9}$/.test(cleanNumber)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit Indian mobile number.'
        });
        return;
      }

      const result = await otpService.requestOtp(cleanNumber);

      if (!result.success) {
        res.status(429).json({
          success: false,
          message: result.message,
          cooldownSeconds: result.cooldownSeconds
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        mobileNumber: cleanNumber,
        devOtp: (result as any).devOtp
      });
    } catch (error: any) {
      console.error('[AUTH CONTROLLER sendOtp ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while dispatching OTP.'
      });
    }
  }

  /**
   * Verify OTP and Login / Register User
   * POST /api/auth/verify-otp
   */
  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { mobileNumber, otp } = req.body;

      if (!mobileNumber || !otp) {
        res.status(400).json({
          success: false,
          message: 'Mobile number and 6-digit OTP are required.'
        });
        return;
      }

      const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);
      const cleanOtp = String(otp).trim();

      if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
        res.status(400).json({
          success: false,
          message: 'OTP must be exactly 6 digits.'
        });
        return;
      }

      // Verify OTP
      const verificationResult = await otpService.verifyOtp(cleanNumber, cleanOtp);

      if (!verificationResult.valid) {
        res.status(400).json({
          success: false,
          message: verificationResult.message
        });
        return;
      }

      // Check if user already exists
      let user = await userService.findByMobile(cleanNumber);
      let isNewUser = false;

      if (!user) {
        user = await userService.createFromMobile(cleanNumber);
        isNewUser = true;
      } else if (!user.fullName) {
        isNewUser = true;
      }

      // Generate tokens
      const { accessToken, refreshToken } = await tokenService.generateTokens(user);

      res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        isNewUser,
        tokens: {
          accessToken,
          refreshToken
        },
        user: {
          id: user.id,
          mobileNumber: user.mobileNumber,
          fullName: user.fullName || null,
          email: user.email || null,
          userType: user.userType || null,
          preferredLang: user.preferredLang,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('[AUTH CONTROLLER verifyOtp ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error processing OTP verification.'
      });
    }
  }

  /**
   * Update Profile Details (Name, UserType, Preferred Language)
   * POST /api/auth/profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { fullName, email, userType, preferredLang } = req.body;

      if (userType && !['patient', 'practitioner', 'student', 'researcher'].includes(userType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid userType. Options: patient, practitioner, student, researcher.'
        });
        return;
      }

      if (preferredLang && !['en', 'hi', 'mr'].includes(preferredLang)) {
        res.status(400).json({
          success: false,
          message: 'Invalid preferredLang. Options: en (English), hi (Hindi), mr (Marathi).'
        });
        return;
      }

      const updatedUser = await userService.updateProfile(userId, {
        fullName: fullName?.trim(),
        email: email?.trim(),
        userType,
        preferredLang
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: updatedUser
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile.'
      });
    }
  }

  /**
   * Get Current Authenticated User Profile
   * GET /api/auth/me
   */
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      user: req.user
    });
  }

  /**
   * Refresh session tokens
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token is required' });
        return;
      }

      const result = await tokenService.verifyAndRotateRefreshToken(refreshToken);
      if (!result) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        return;
      }

      res.status(200).json({
        success: true,
        tokens: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        },
        user: result.user
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error refreshing token' });
    }
  }

  /**
   * Logout user and revoke tokens
   * POST /api/auth/logout
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user?.id) {
        await tokenService.revokeUserTokens(req.user.id);
      }
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Logout failed' });
    }
  }
}

export const authController = new AuthController();
