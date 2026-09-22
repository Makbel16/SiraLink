import { buildApp } from './app.js';
import { env } from './config/env.js';
import { closePool } from './db/index.js';
import { logger } from './utils/logger.js';

async function start() {
  try {
    const app = await buildApp();
    const port = Number(process.env.PORT || env.PORT || 3000);
    const host = process.env.HOST || env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    logger.info(`SiraLink API service running on http://${host}:${port}`, {
      port,
      host,
      env: env.NODE_ENV
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      try {
        await app.close();
        logger.info('Fastify server closed.');
        await closePool();
        logger.info('Database pool closed. Exiting process.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during graceful shutdown', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Fatal error starting server', err);
    process.exit(1);
  }
}

start();
