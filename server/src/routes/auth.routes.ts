import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/request-otp', authController.requestOTP.bind(authController));
  fastify.post('/verify-otp', authController.verifyOTP.bind(authController));
  fastify.get('/me', { preHandler: [authenticate] }, authController.getMe.bind(authController));
  fastify.post('/logout', { preHandler: [authenticate] }, authController.logout.bind(authController));
}
