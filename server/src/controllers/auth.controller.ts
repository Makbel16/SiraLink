import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { workerRepository } from '../repositories/worker.repository.js';
import { successResponse, errorResponse } from '../utils/response.js';

const requestOtpSchema = z.object({
  phoneNumber: z.string().min(9, 'Phone number is required')
});

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(9),
  otpCode: z.string().min(4, 'OTP must be at least 4 digits'),
  role: z.enum(['CLIENT', 'WORKER', 'ADMIN']).optional().default('CLIENT'),
  fullName: z.string().optional(),
  language: z.enum(['am', 'om', 'en']).optional().default('am')
});

export class AuthController {
  async requestOTP(request: FastifyRequest, reply: FastifyReply) {
    const parse = requestOtpSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', parse.error.errors[0]?.message || 'Invalid input'));
    }

    try {
      const result = await authService.requestOTP(parse.data.phoneNumber);
      return reply.send(successResponse(result));
    } catch (err: any) {
      return reply.status(400).send(errorResponse('OTP_REQUEST_FAILED', err.message));
    }
  }

  async verifyOTP(request: FastifyRequest, reply: FastifyReply) {
    const parse = verifyOtpSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', parse.error.errors[0]?.message || 'Invalid input'));
    }

    try {
      const { phoneNumber, otpCode, role, fullName, language } = parse.data;
      const { token, user } = await authService.verifyOTP(phoneNumber, otpCode, role, fullName, language);

      let workerProfile = null;
      if (user.role === 'WORKER') {
        workerProfile = await workerRepository.findByUserId(user.id);
      }

      return reply.send(
        successResponse({
          token,
          user,
          workerProfile
        })
      );
    } catch (err: any) {
      return reply.status(400).send(errorResponse('OTP_VERIFICATION_FAILED', err.message));
    }
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    }

    const user = await authService.getUserById(request.user.userId);
    if (!user) {
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'User profile not found'));
    }

    let workerProfile = null;
    if (user.role === 'WORKER') {
      workerProfile = await workerRepository.findByUserId(user.id);
    }

    return reply.send(
      successResponse({
        user,
        workerProfile
      })
    );
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send(successResponse({ message: 'Logged out successfully' }));
  }
}

export const authController = new AuthController();
