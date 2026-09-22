import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { jobRepository } from '../repositories/job.repository.js';
import { notificationService } from '../services/notification.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { JobCategory, JobStatus } from '../types/index.js';

const createJobSchema = z.object({
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
  ]),
  title: z.string().optional(),
  audioDescriptionUrl: z.string().url().optional(),
  textDescription: z.string().optional(),
  offeredPriceEtb: z.number().positive().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  workerId: z.string().uuid().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  workerId: z.string().uuid().optional()
});

const assignWorkerSchema = z.object({
  workerId: z.string().uuid()
});

export class JobController {
  async createJob(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    }

    const parse = createJobSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Invalid job request data', parse.error.format()));
    }

    const job = await jobRepository.createJob({
      clientId: request.user.userId,
      workerId: parse.data.workerId,
      category: parse.data.category as JobCategory,
      title: parse.data.title,
      audioDescriptionUrl: parse.data.audioDescriptionUrl,
      textDescription: parse.data.textDescription,
      offeredPriceEtb: parse.data.offeredPriceEtb,
      latitude: parse.data.latitude,
      longitude: parse.data.longitude
    });

    // If worker assigned immediately, send push notification
    if (parse.data.workerId) {
      notificationService.sendNotification({
        toUserId: parse.data.workerId,
        title: 'New SiraLink Job Request',
        body: `You have received a new ${job.category} service request!`,
        data: { jobId: job.id, type: 'NEW_JOB' }
      });
    }

    return reply.status(201).send(successResponse(job));
  }

  async getJobs(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    }

    const { status } = (request.query as { status?: JobStatus; role?: string });
    const isWorker = request.user.role === 'WORKER';

    const jobs = await jobRepository.findJobs({
      clientId: isWorker ? undefined : request.user.userId,
      workerId: isWorker ? request.user.userId : undefined,
      status
    });

    return reply.send(successResponse(jobs));
  }

  async getJobById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = (request.params as { id: string });
    const job = await jobRepository.findById(id);
    if (!job) {
      return reply.status(404).send(errorResponse('JOB_NOT_FOUND', 'Job request not found'));
    }
    return reply.send(successResponse(job));
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    }

    const { id } = (request.params as { id: string });
    const parse = updateStatusSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Invalid status update', parse.error.format()));
    }

    const currentJob = await jobRepository.findById(id);
    if (!currentJob) {
      return reply.status(404).send(errorResponse('JOB_NOT_FOUND', 'Job request not found'));
    }

    const updatedJob = await jobRepository.updateStatus(id, parse.data.status, parse.data.workerId);

    // Notify client or worker on status change
    if (updatedJob) {
      if (parse.data.status === 'ASSIGNED' && updatedJob.client_id) {
        notificationService.sendNotification({
          toUserId: updatedJob.client_id,
          title: 'Worker Accepted Your Request!',
          body: `${updatedJob.worker_name || 'Worker'} has accepted your job request.`,
          data: { jobId: updatedJob.id, type: 'JOB_ACCEPTED' }
        });
      } else if (parse.data.status === 'IN_PROGRESS' && updatedJob.client_id) {
        notificationService.sendNotification({
          toUserId: updatedJob.client_id,
          title: 'Job In Progress',
          body: `${updatedJob.worker_name || 'Worker'} has begun working on your job.`,
          data: { jobId: updatedJob.id, type: 'JOB_STARTED' }
        });
      } else if (parse.data.status === 'COMPLETED' && updatedJob.client_id) {
        notificationService.sendNotification({
          toUserId: updatedJob.client_id,
          title: 'Job Completed!',
          body: `${updatedJob.worker_name || 'Worker'} has marked the job completed. Please leave a rating!`,
          data: { jobId: updatedJob.id, type: 'JOB_COMPLETED' }
        });
      }
    }

    return reply.send(successResponse(updatedJob));
  }

  async assignWorker(request: FastifyRequest, reply: FastifyReply) {
    const { id } = (request.params as { id: string });
    const parse = assignWorkerSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Valid worker ID required'));
    }

    const updatedJob = await jobRepository.updateStatus(id, 'ASSIGNED', parse.data.workerId);
    if (!updatedJob) {
      return reply.status(404).send(errorResponse('JOB_NOT_FOUND', 'Job not found'));
    }

    notificationService.sendNotification({
      toUserId: parse.data.workerId,
      title: 'Job Assigned to You',
      body: 'You have been selected for a job request.',
      data: { jobId: updatedJob.id, type: 'JOB_ASSIGNED' }
    });

    return reply.send(successResponse(updatedJob));
  }

  async completeJob(request: FastifyRequest, reply: FastifyReply) {
    const { id } = (request.params as { id: string });
    const updatedJob = await jobRepository.updateStatus(id, 'COMPLETED');
    if (!updatedJob) {
      return reply.status(404).send(errorResponse('JOB_NOT_FOUND', 'Job not found'));
    }

    if (updatedJob.client_id) {
      notificationService.sendNotification({
        toUserId: updatedJob.client_id,
        title: 'Job Completed',
        body: 'Your service has been marked complete. Please rate your worker.',
        data: { jobId: updatedJob.id, type: 'JOB_COMPLETED' }
      });
    }

    return reply.send(successResponse(updatedJob));
  }
}

export const jobController = new JobController();
