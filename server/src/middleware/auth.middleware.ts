import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service.js';
import { JWTPayload, UserRole } from '../types/index.js';
import { errorResponse } from '../utils/response.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Authentication token required'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Malformed authorization token'));
  }

  try {
    const payload = authService.verifyToken(token);
    request.user = payload;
  } catch {
    return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Invalid or expired authentication token'));
  }
}

export function authorizeRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Authentication required'));
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send(errorResponse('FORBIDDEN', 'Access denied for your role'));
    }
  };
}
