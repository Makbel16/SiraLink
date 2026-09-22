import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { workerRepository } from '../repositories/worker.repository.js';
import { spatialService } from '../services/spatial.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { JobCategory } from '../types/index.js';

const upsertProfileSchema = z.object({
  skillCategory: z.enum([
    'PLUMBING',
    'ELECTRICAL',
    'CARPENTRY',
    'PAINTING',
    'CLEANING',
    'MECHANIC',
    'CONSTRUCTION',
    'MOVING',
    'GARDENING',
    'OTHER'
  ]),
  skillDescription: z.string().optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  hourlyRateEtb: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

const updateAvailabilitySchema = z.object({
  isAvailable: z.boolean()
});

const nearbyWorkersSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(100).optional().default(5),
  category: z.enum([
    'PLUMBING',
    'ELECTRICAL',
    'CARPENTRY',
    'PAINTING',
    'CLEANING',
    'MECHANIC',
    'CONSTRUCTION',
    'MOVING',
    'GARDENING',
    'OTHER'
  ]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

export class WorkerController {
  async upsertProfile(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    }

    const parse = upsertProfileSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Invalid profile data', parse.error.format()));
    }

    const profile = await workerRepository.upsertProfile({
      userId: request.user.userId,
      skillCategory: parse.data.skillCategory as JobCategory,
      skillDescription: parse.data.skillDescription,
      experienceYears: parse.data.experienceYears,
      hourlyRateEtb: parse.data.hourlyRateEtb,
      isAvailable: parse.data.isAvailable,
      latitude: parse.data.latitude,
      longitude: parse.data.longitude
    });

    return reply.send(successResponse(profile));
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const { id } = (request.params as { id: string });
    const worker = await workerRepository.findById(id);
    if (!worker) {
      return reply.status(404).send(errorResponse('WORKER_NOT_FOUND', 'Worker not found'));
    }
    return reply.send(successResponse(worker));
  }

  async updateLocation(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    }

    const parse = updateLocationSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Invalid coordinates'));
    }

    await spatialService.updateWorkerLocation(request.user.userId, parse.data.latitude, parse.data.longitude);
    return reply.send(successResponse({ message: 'Location updated successfully' }));
  }

  async updateAvailability(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    }

    const parse = updateAvailabilitySchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Invalid availability flag'));
    }

    await workerRepository.setAvailability(request.user.userId, parse.data.isAvailable);
    return reply.send(successResponse({ isAvailable: parse.data.isAvailable }));
  }

  async getNearbyWorkers(request: FastifyRequest, reply: FastifyReply) {
    const parse = nearbyWorkersSchema.safeParse(request.query);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Invalid nearby search parameters', parse.error.format()));
    }

    const workers = await spatialService.findNearbyWorkers(parse.data);
    return reply.send(successResponse(workers));
  }
}

export const workerController = new WorkerController();
