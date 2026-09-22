import { describe, it, expect } from 'vitest';
import { AuthService } from '../src/services/auth.service.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import { JWTPayload } from '../src/types/index.js';

describe('AuthService', () => {
  const authService = new AuthService();

  it('normalizes local Ethiopian phone numbers (09... to +2519...) accurately', () => {
    expect(authService.normalizePhoneNumber('0911223344')).toBe('+251911223344');
    expect(authService.normalizePhoneNumber('0711223344')).toBe('+251711223344');
    expect(authService.normalizePhoneNumber('251911223344')).toBe('+251911223344');
    expect(authService.normalizePhoneNumber('+251 911 22 33 44')).toBe('+251911223344');
    expect(authService.normalizePhoneNumber('09-11-22-33-44')).toBe('+251911223344');
  });

  it('verifies valid JWT token correctly', () => {
    const payload: JWTPayload = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      phoneNumber: '+251911223344',
      role: 'CLIENT',
      language: 'am'
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = authService.verifyToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.phoneNumber).toBe(payload.phoneNumber);
    expect(decoded.role).toBe('CLIENT');
    expect(decoded.language).toBe('am');
  });

  it('rejects tampered or invalid tokens', () => {
    expect(() => authService.verifyToken('invalid.token.here')).toThrow();
  });
});
