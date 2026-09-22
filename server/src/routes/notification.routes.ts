import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { notificationService } from '../services/notification.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const registerTokenSchema = z.object({
  token: z.string().min(5),
  platform: z.string().optional().default('expo')
});

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.post('/device-token', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    }

    const parse = registerTokenSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Valid device token is required'));
    }

    await notificationService.registerDeviceToken(
      request.user.userId,
      parse.data.token,
      parse.data.platform
    );

    return reply.send(successResponse({ message: 'Device token registered successfully' }));
  });
}
