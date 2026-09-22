import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { userRepository } from '../repositories/user.repository.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { successResponse, errorResponse } from '../utils/response.js';

const updateUserSchema = z.object({
  full_name: z.string().min(1).optional(),
  language_preference: z.enum(['am', 'om', 'en']).optional(),
  avatar_url: z.string().url().optional(),
  profile_audio_url: z.string().url().optional()
});

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/:id', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = (request.params as { id: string });
    const user = await userRepository.findById(id);
    if (!user) {
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'User not found'));
    }
    return reply.send(successResponse(user));
  });

  fastify.patch('/:id', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = (request.params as { id: string });
    if (request.user?.userId !== id && request.user?.role !== 'ADMIN') {
      return reply.status(403).send(errorResponse('FORBIDDEN', 'Cannot update profile of another user'));
    }

    const parse = updateUserSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Invalid update parameters', parse.error.format()));
    }

    const updated = await userRepository.updateUser(id, parse.data);
    return reply.send(successResponse(updated));
  });
}
