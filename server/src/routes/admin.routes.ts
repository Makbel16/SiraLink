import { FastifyInstance } from 'fastify';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate, authorizeRole } from '../middleware/auth.middleware.js';

export async function adminRoutes(fastify: FastifyInstance) {
  // Admin guard on all routes in this prefix
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', authorizeRole('ADMIN'));

  fastify.get('/users', adminController.getUsers.bind(adminController));
  fastify.get('/workers', adminController.getWorkers.bind(adminController));
  fastify.get('/jobs', adminController.getJobs.bind(adminController));
  fastify.patch('/users/:id/status', adminController.updateUserStatus.bind(adminController));
  fastify.patch('/workers/:id/verify', adminController.verifyWorker.bind(adminController));
  fastify.get('/statistics', adminController.getStatistics.bind(adminController));
}
