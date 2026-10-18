import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OtpRecord } from '../types/index.js';
import { smsService } from './smsService.js';

class OtpService {
  // Store: clean mobile number -> OtpRecord
  private otpStore: Map<string, OtpRecord> = new Map();
  private readonly OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
  private readonly RESEND_COOLDOWN_MS = 5 * 1000; // 5 seconds (relaxed for testing)
  private readonly MAX_ATTEMPTS = 10;

  /**
   * Generates and dispatches OTP to recipient mobile
   */
  async requestOtp(mobileNumber: string): Promise<{ success: boolean; message: string; cooldownSeconds?: number; devOtp?: string }> {
    const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);

    if (cleanNumber.length !== 10) {
      throw new Error('Please provide a valid 10-digit mobile number.');
    }

    const existingRecord = this.otpStore.get(cleanNumber);
    const now = new Date();

    // Enforce resend cooldown
    if (existingRecord) {
      const elapsed = now.getTime() - existingRecord.lastSentAt.getTime();
      if (elapsed < this.RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((this.RESEND_COOLDOWN_MS - elapsed) / 1000);
        return {
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
          cooldownSeconds: remainingSeconds
        };
      }
    }

    // Generate 6-digit random code (100000 - 999999)
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const record: OtpRecord = {
      mobileNumber: cleanNumber,
      otpHash,
      attempts: 0,
      expiresAt: new Date(now.getTime() + this.OTP_EXPIRY_MS),
      lastSentAt: now,
      isUsed: false
    };

    this.otpStore.set(cleanNumber, record);

    // Send OTP via SMS service
    const smsResult = await smsService.sendOtp(cleanNumber, otp);

    return {
      success: smsResult.success,
      message: smsResult.success 
        ? 'OTP sent successfully to your mobile number.' 
        : smsResult.message,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    };
  }

  /**
   * Verifies submitted OTP against stored hash
   */
  async verifyOtp(mobileNumber: string, enteredOtp: string): Promise<{ valid: boolean; message: string }> {
    const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);
    const record = this.otpStore.get(cleanNumber);

    if (!record) {
      return { valid: false, message: 'No active OTP request found. Please request a new OTP.' };
    }

    if (record.isUsed) {
      return { valid: false, message: 'This OTP has already been used. Please request a new OTP.' };
    }

    const now = new Date();
    if (now > record.expiresAt) {
      this.otpStore.delete(cleanNumber);
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(cleanNumber);
      return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
    }

    const isMatch = await bcrypt.compare(enteredOtp.trim(), record.otpHash);

    if (!isMatch) {
      record.attempts += 1;
      const remaining = this.MAX_ATTEMPTS - record.attempts;
      return {
        valid: false,
        message: remaining > 0 
          ? `Invalid OTP. ${remaining} attempt(s) remaining.` 
          : 'Invalid OTP. Maximum attempts reached. Please request a new OTP.'
      };
    }

    // Mark as used
    record.isUsed = true;
    this.otpStore.delete(cleanNumber);

    return { valid: true, message: 'OTP verified successfully.' };
  }
}

export const otpService = new OtpService();
