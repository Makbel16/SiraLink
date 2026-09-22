import { FastifyInstance } from 'fastify';
import { jobController } from '../controllers/job.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function jobRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: [authenticate] }, jobController.createJob.bind(jobController));
  fastify.get('/', { preHandler: [authenticate] }, jobController.getJobs.bind(jobController));
  fastify.get('/:id', { preHandler: [authenticate] }, jobController.getJobById.bind(jobController));
  fastify.patch('/:id/status', { preHandler: [authenticate] }, jobController.updateStatus.bind(jobController));
  fastify.post('/:id/assign', { preHandler: [authenticate] }, jobController.assignWorker.bind(jobController));
  fastify.post('/:id/complete', { preHandler: [authenticate] }, jobController.completeJob.bind(jobController));
}
