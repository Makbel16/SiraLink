import { FastifyInstance } from 'fastify';
import { workerController } from '../controllers/worker.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function workerRoutes(fastify: FastifyInstance) {
  // Public nearby search & profile viewing
  fastify.get('/nearby', workerController.getNearbyWorkers.bind(workerController));
  fastify.get('/:id', workerController.getProfile.bind(workerController));

  // Authenticated worker profile & status management
  fastify.post('/profile', { preHandler: [authenticate] }, workerController.upsertProfile.bind(workerController));
  fastify.patch('/profile', { preHandler: [authenticate] }, workerController.upsertProfile.bind(workerController));
  fastify.post('/location', { preHandler: [authenticate] }, workerController.updateLocation.bind(workerController));
  fastify.patch('/availability', { preHandler: [authenticate] }, workerController.updateAvailability.bind(workerController));
}
