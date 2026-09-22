import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { env } from '../config/env.js';
import { User, UserRole, SupportedLanguage, JWTPayload } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface SMSProvider {
  sendOTP(phoneNumber: string, code: string): Promise<boolean>;
}

export class MockSMSProvider implements SMSProvider {
  async sendOTP(phoneNumber: string, code: string): Promise<boolean> {
    logger.info(`[DEV SMS] Sent OTP to ${phoneNumber}: [${code}]`);
    return true;
  }
}

export class AuthService {
  private smsProvider: SMSProvider;

  constructor() {
    this.smsProvider = new MockSMSProvider();
  }

  /**
   * Normalizes Ethiopian phone numbers into international +2519XXXXXXXX format
   */
  normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
      return `+251${cleaned.substring(1)}`;
    }
    if (cleaned.startsWith('251')) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith('+251')) {
      return cleaned;
    }
    return cleaned;
  }

  /**
   * Generate and send OTP for authentication
   */
  async requestOTP(phoneNumber: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    if (!/^\+251[79]\d{8}$/.test(normalizedPhone) && !/^\+\d{10,15}$/.test(normalizedPhone)) {
      throw new Error('Invalid phone number format. Please provide a valid Ethiopian number.');
    }

    // In development mode, use predictable OTP '123456' for instant developer testing
    const isDev = env.NODE_ENV !== 'production';
    const otpCode = isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in otp_verifications table
    await query(`
      INSERT INTO otp_verifications (phone_number, otp_code, expires_at, is_verified)
      VALUES ($1, $2, $3, FALSE);
    `, [normalizedPhone, otpCode, expiresAt]);

    await this.smsProvider.sendOTP(normalizedPhone, otpCode);

    return {
      success: true,
      message: 'OTP sent successfully',
      devOtp: isDev ? otpCode : undefined
    };
  }

  /**
   * Verify OTP and issue JWT token
   */
  async verifyOTP(
    phoneNumber: string,
    otpCode: string,
    role: UserRole = 'CLIENT',
    fullName?: string,
    language: SupportedLanguage = 'am'
  ): Promise<{ token: string; user: User }> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    const isDev = env.NODE_ENV !== 'production';
    let valid = false;

    // Fast-path for development default OTP
    if (isDev && otpCode === '123456') {
      valid = true;
    } else {
      const otpRes = await query(`
        SELECT * FROM otp_verifications
        WHERE phone_number = $1 AND otp_code = $2 AND is_verified = FALSE AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 1;
      `, [normalizedPhone, otpCode]);

      if (otpRes.rowCount && otpRes.rowCount > 0) {
        valid = true;
        await query(`
          UPDATE otp_verifications SET is_verified = TRUE WHERE id = $1;
        `, [otpRes.rows[0].id]);
      }
    }

    if (!valid) {
      throw new Error('Invalid or expired OTP code');
    }

    // Find or create user
    let userRes = await query(`
      SELECT * FROM users WHERE phone_number = $1;
    `, [normalizedPhone]);

    let user: User;

    if (userRes.rowCount === 0) {
      const insertRes = await query(`
        INSERT INTO users (phone_number, full_name, role, language_preference, is_verified, is_active)
        VALUES ($1, $2, $3, $4, TRUE, TRUE)
        RETURNING *;
      `, [normalizedPhone, fullName || null, role, language]);
      user = insertRes.rows[0];

      // If user role is WORKER, initialize empty worker_profile
      if (role === 'WORKER') {
        await query(`
          INSERT INTO worker_profiles (user_id, skill_category, experience_years)
          VALUES ($1, 'OTHER', 1)
          ON CONFLICT (user_id) DO NOTHING;
        `, [user.id]);
      }
    } else {
      user = userRes.rows[0];
      if (fullName && !user.full_name) {
        const updateRes = await query(`
          UPDATE users SET full_name = $1 WHERE id = $2 RETURNING *;
        `, [fullName, user.id]);
        user = updateRes.rows[0];
      }
    }

    const payload: JWTPayload = {
      userId: user.id,
      phoneNumber: user.phone_number,
      role: user.role,
      language: user.language_preference
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });

    return { token, user };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch {
      throw new Error('Invalid or expired authentication token');
    }
  }

  /**
   * Fetch current user profile
   */
  async getUserById(userId: string): Promise<User | null> {
    const res = await query('SELECT * FROM users WHERE id = $1 AND is_active = TRUE;', [userId]);
    return res.rows[0] || null;
  }
}

export const authService = new AuthService();
