import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { query } from '../db/index.js';
import { jobRepository } from '../repositories/job.repository.js';
import { workerRepository } from '../repositories/worker.repository.js';
import { successResponse, errorResponse } from '../utils/response.js';

const createRatingSchema = z.object({
  jobId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional()
});

export class RatingController {
  async createRating(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send(errorResponse('UNAUTHORIZED', 'Not authenticated'));
    }

    const parse = createRatingSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Rating must be an integer between 1 and 5', parse.error.format()));
    }

    const { jobId, rating, comment } = parse.data;

    // Verify job belongs to this client and is completed
    const job = await jobRepository.findById(jobId);
    if (!job) {
      return reply.status(404).send(errorResponse('JOB_NOT_FOUND', 'Job request not found'));
    }

    if (job.client_id !== request.user.userId) {
      return reply.status(403).send(errorResponse('FORBIDDEN', 'Only the client who requested the job can review it'));
    }

    if (!job.worker_id) {
      return reply.status(400).send(errorResponse('NO_WORKER', 'Job does not have an assigned worker'));
    }

    const insertSql = `
      INSERT INTO ratings (job_id, client_id, worker_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (job_id, client_id) DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const res = await query(insertSql, [jobId, request.user.userId, job.worker_id, rating, comment || null]);

    // Recalculate average rating for worker
    await workerRepository.recalculateWorkerRating(job.worker_id);

    return reply.status(201).send(successResponse(res.rows[0]));
  }

  async getWorkerRatings(request: FastifyRequest, reply: FastifyReply) {
    const { id } = (request.params as { id: string });

    const sql = `
      SELECT
        r.id,
        r.job_id,
        r.client_id,
        r.worker_id,
        r.rating,
        r.comment,
        r.created_at,
        u.full_name as client_name,
        u.avatar_url as client_avatar_url
      FROM ratings r
      INNER JOIN users u ON u.id = r.client_id
      WHERE r.worker_id = $1 OR r.worker_id = (SELECT user_id FROM worker_profiles WHERE id = $1)
      ORDER BY r.created_at DESC;
    `;

    const res = await query(sql, [id]);
    return reply.send(successResponse(res.rows));
  }
}

export const ratingController = new RatingController();
