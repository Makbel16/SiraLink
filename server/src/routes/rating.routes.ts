import { FastifyInstance } from 'fastify';
import { ratingController } from '../controllers/rating.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function ratingRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: [authenticate] }, ratingController.createRating.bind(ratingController));
  fastify.get('/workers/:id', ratingController.getWorkerRatings.bind(ratingController));
}
