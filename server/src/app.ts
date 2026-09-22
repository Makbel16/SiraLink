import path from 'path';
import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { workerRoutes } from './routes/worker.routes.js';
import { voiceRoutes } from './routes/voice.routes.js';
import { jobRoutes } from './routes/job.routes.js';
import { ratingRoutes } from './routes/rating.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { query } from './db/index.js';
import { logger } from './utils/logger.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: false // Using structured custom logger
  });

  // Security Headers
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  });

  // CORS Configuration
  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  });

  // Rate Limiting
  await app.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute'
  });

  // Multipart uploads (for voice audio up to 30MB)
  await app.register(multipart, {
    limits: {
      fileSize: 30 * 1024 * 1024,
      files: 1
    }
  });

  // Static files for local uploads in development
  if (env.UPLOAD_PROVIDER === 'local') {
    await app.register(fastifyStatic, {
      root: path.resolve(env.UPLOAD_DIR),
      prefix: '/uploads/'
    });
  }

  // Request logging hooks
  app.addHook('onRequest', (req, _reply, done) => {
    (req as any).startTime = Date.now();
    done();
  });

  app.addHook('onResponse', (req, reply, done) => {
    const duration = Date.now() - ((req as any).startTime || Date.now());
    logger.info('HTTP Request processed', {
      method: req.method,
      route: req.url,
      status: reply.statusCode,
      durationMs: duration
    });
    done();
  });

  // Global Error Handler
  app.setErrorHandler(errorHandler);

  // Health Checks
  app.get('/health', async (_req, reply) => {
    return reply.send({
      status: 'ok',
      service: 'siralink-api',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV
    });
  });

  app.get('/health/ready', async (_req, reply) => {
    try {
      await query('SELECT 1');
      return reply.send({
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      return reply.status(503).send({
        status: 'unhealthy',
        database: 'disconnected',
        error: err.message
      });
    }
  });

  // API Routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(workerRoutes, { prefix: '/api/workers' });
  await app.register(voiceRoutes, { prefix: '/api/voice' });
  await app.register(jobRoutes, { prefix: '/api/jobs' });
  await app.register(ratingRoutes, { prefix: '/api/ratings' });
  await app.register(notificationRoutes, { prefix: '/api/notifications' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  return app;
}
