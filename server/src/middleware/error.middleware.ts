import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  logger.error('Fastify request error encountered', error, {
    method: request.method,
    route: request.url,
    userId: request.user?.userId
  });

  // Zod validation error
  if (error instanceof ZodError) {
    return reply.status(400).send(
      errorResponse('VALIDATION_ERROR', 'Validation failed on input data', error.format())
    );
  }

  // Fastify Schema validation error
  if (error.validation) {
    return reply.status(400).send(
      errorResponse('VALIDATION_ERROR', error.message, error.validation)
    );
  }

  // Known HTTP Status Codes
  const statusCode = error.statusCode || 500;
  if (statusCode < 500) {
    return reply.status(statusCode).send(
      errorResponse(error.code || 'BAD_REQUEST', error.message)
    );
  }

  // Internal Server Errors (sanitized in production)
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : error.message;

  return reply.status(500).send(errorResponse('INTERNAL_SERVER_ERROR', message));
}
