import { query } from '../db/index.js';
import { JobRequest, JobCategory, JobStatus } from '../types/index.js';

export interface CreateJobInput {
  clientId: string;
  workerId?: string | null;
  category: JobCategory;
  title?: string;
  audioDescriptionUrl?: string;
  textDescription?: string;
  offeredPriceEtb?: number;
  latitude: number;
  longitude: number;
}

export class JobRepository {
  async createJob(input: CreateJobInput): Promise<JobRequest> {
    const {
      clientId,
      workerId,
      category,
      title = `${category.charAt(0) + category.slice(1).toLowerCase()} Service`,
      audioDescriptionUrl,
      textDescription,
      offeredPriceEtb,
      latitude,
      longitude
    } = input;

    const initialStatus: JobStatus = workerId ? 'ASSIGNED' : 'OPEN';

    const sql = `
      INSERT INTO job_requests (
        client_id, worker_id, category, title,
        audio_description_url, text_description,
        status, offered_price_etb, job_location
      )
      VALUES (
        $1, $2, $3, $4,
        $5, $6,
        $7, $8,
        ST_SetSRID(ST_MakePoint($9, $10), 4326)::geography
      )
      RETURNING
        id, client_id, worker_id, category, title,
        audio_description_url, text_description, status,
        offered_price_etb,
        ST_Y(job_location::geometry) as latitude,
        ST_X(job_location::geometry) as longitude,
        created_at, updated_at;
    `;

    const res = await query(sql, [
      clientId,
      workerId || null,
      category,
      title,
      audioDescriptionUrl || null,
      textDescription || null,
      initialStatus,
      offeredPriceEtb || null,
      longitude,
      latitude
    ]);

    return res.rows[0];
  }

  async findById(jobId: string): Promise<JobRequest | null> {
    const sql = `
      SELECT
        jr.id,
        jr.client_id,
        jr.worker_id,
        jr.category,
        jr.title,
        jr.audio_description_url,
        jr.text_description,
        jr.status,
        jr.offered_price_etb,
        ST_Y(jr.job_location::geometry) as latitude,
        ST_X(jr.job_location::geometry) as longitude,
        jr.created_at,
        jr.updated_at,
        c.full_name as client_name,
        c.phone_number as client_phone,
        w.full_name as worker_name,
        w.phone_number as worker_phone
      FROM job_requests jr
      INNER JOIN users c ON c.id = jr.client_id
      LEFT JOIN users w ON w.id = jr.worker_id
      WHERE jr.id = $1;
    `;

    const res = await query(sql, [jobId]);
    return res.rows[0] || null;
  }

  async findJobs(filters: {
    clientId?: string;
    workerId?: string;
    status?: JobStatus;
    limit?: number;
    offset?: number;
  }): Promise<JobRequest[]> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (filters.clientId) {
      params.push(filters.clientId);
      clauses.push(`jr.client_id = $${params.length}`);
    }
    if (filters.workerId) {
      params.push(filters.workerId);
      clauses.push(`jr.worker_id = $${params.length}`);
    }
    if (filters.status) {
      params.push(filters.status);
      clauses.push(`jr.status = $${params.length}`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    params.push(limit, offset);

    const sql = `
      SELECT
        jr.id,
        jr.client_id,
        jr.worker_id,
        jr.category,
        jr.title,
        jr.audio_description_url,
        jr.text_description,
        jr.status,
        jr.offered_price_etb,
        ST_Y(jr.job_location::geometry) as latitude,
        ST_X(jr.job_location::geometry) as longitude,
        jr.created_at,
        jr.updated_at,
        c.full_name as client_name,
        c.phone_number as client_phone,
        w.full_name as worker_name,
        w.phone_number as worker_phone
      FROM job_requests jr
      INNER JOIN users c ON c.id = jr.client_id
      LEFT JOIN users w ON w.id = jr.worker_id
      ${whereClause}
      ORDER BY jr.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;

    const res = await query(sql, params);
    return res.rows;
  }

  async updateStatus(jobId: string, status: JobStatus, workerId?: string): Promise<JobRequest | null> {
    let workerClause = '';
    const params: any[] = [status, jobId];

    if (workerId) {
      params.push(workerId);
      workerClause = `, worker_id = $3`;
    }

    const sql = `
      UPDATE job_requests
      SET status = $1, updated_at = CURRENT_TIMESTAMP ${workerClause}
      WHERE id = $2
      RETURNING *;
    `;

    const res = await query(sql, params);
    if (!res.rows[0]) return null;
    return this.findById(jobId);
  }
}

export const jobRepository = new JobRepository();
