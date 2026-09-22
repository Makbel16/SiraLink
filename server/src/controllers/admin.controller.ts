import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { query } from '../db/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

const updateStatusSchema = z.object({
  isActive: z.boolean()
});

const verifyWorkerSchema = z.object({
  isVerified: z.boolean()
});

export class AdminController {
  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const queryParams = (request.query as { limit?: number; offset?: number }) || {};
    const limit = queryParams.limit || 50;
    const offset = queryParams.offset || 0;

    const res = await query(`
      SELECT id, phone_number, full_name, role, language_preference, is_verified, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `, [limit, offset]);

    return reply.send(successResponse(res.rows));
  }

  async getWorkers(request: FastifyRequest, reply: FastifyReply) {
    const queryParams = (request.query as { limit?: number; offset?: number }) || {};
    const limit = queryParams.limit || 50;
    const offset = queryParams.offset || 0;

    const res = await query(`
      SELECT
        wp.*,
        u.phone_number,
        u.full_name,
        u.is_verified,
        u.is_active,
        ST_Y(wp.current_location::geometry) as latitude,
        ST_X(wp.current_location::geometry) as longitude
      FROM worker_profiles wp
      INNER JOIN users u ON u.id = wp.user_id
      ORDER BY wp.created_at DESC
      LIMIT $1 OFFSET $2;
    `, [limit, offset]);

    return reply.send(successResponse(res.rows));
  }

  async getJobs(request: FastifyRequest, reply: FastifyReply) {
    const queryParams = (request.query as { limit?: number; offset?: number }) || {};
    const limit = queryParams.limit || 50;
    const offset = queryParams.offset || 0;

    const res = await query(`
      SELECT
        jr.*,
        c.full_name as client_name,
        c.phone_number as client_phone,
        w.full_name as worker_name,
        w.phone_number as worker_phone
      FROM job_requests jr
      INNER JOIN users c ON c.id = jr.client_id
      LEFT JOIN users w ON w.id = jr.worker_id
      ORDER BY jr.created_at DESC
      LIMIT $1 OFFSET $2;
    `, [limit, offset]);

    return reply.send(successResponse(res.rows));
  }

  async updateUserStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = (request.params as { id: string });
    const parse = updateStatusSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'isActive boolean is required'));
    }

    const res = await query(`
      UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, phone_number, full_name, is_active;
    `, [parse.data.isActive, id]);

    if (!res.rows[0]) {
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'User not found'));
    }

    return reply.send(successResponse(res.rows[0]));
  }

  async verifyWorker(request: FastifyRequest, reply: FastifyReply) {
    const { id } = (request.params as { id: string });
    const parse = verifyWorkerSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'isVerified boolean is required'));
    }

    const res = await query(`
      UPDATE users
      SET is_verified = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 OR id = (SELECT user_id FROM worker_profiles WHERE id = $2)
      RETURNING id, full_name, is_verified;
    `, [parse.data.isVerified, id]);

    if (!res.rows[0]) {
      return reply.status(404).send(errorResponse('WORKER_NOT_FOUND', 'Worker user not found'));
    }

    return reply.send(successResponse(res.rows[0]));
  }

  async getStatistics(_request: FastifyRequest, reply: FastifyReply) {
    const userStats = await query(`
      SELECT
        COUNT(id)::int as total_users,
        COUNT(id) FILTER (WHERE role = 'CLIENT')::int as total_clients,
        COUNT(id) FILTER (WHERE role = 'WORKER')::int as total_workers
      FROM users;
    `);

    const jobStats = await query(`
      SELECT
        COUNT(id)::int as total_jobs,
        COUNT(id) FILTER (WHERE status = 'OPEN')::int as open_jobs,
        COUNT(id) FILTER (WHERE status = 'ASSIGNED')::int as assigned_jobs,
        COUNT(id) FILTER (WHERE status = 'IN_PROGRESS')::int as in_progress_jobs,
        COUNT(id) FILTER (WHERE status = 'COMPLETED')::int as completed_jobs,
        COUNT(id) FILTER (WHERE status = 'CANCELLED')::int as cancelled_jobs
      FROM job_requests;
    `);

    const workerStats = await query(`
      SELECT
        COUNT(id) FILTER (WHERE is_available = TRUE)::int as active_workers,
        COALESCE(AVG(rating_avg), 0)::numeric(3,2) as overall_avg_rating
      FROM worker_profiles;
    `);

    return reply.send(
      successResponse({
        users: userStats.rows[0],
        jobs: jobStats.rows[0],
        workers: workerStats.rows[0]
      })
    );
  }
}

export const adminController = new AdminController();
