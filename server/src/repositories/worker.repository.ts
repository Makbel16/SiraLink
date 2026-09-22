import { query } from '../db/index.js';
import { WorkerProfile, JobCategory } from '../types/index.js';

export interface UpsertWorkerProfileInput {
  userId: string;
  skillCategory: JobCategory;
  skillDescription?: string;
  experienceYears?: number;
  hourlyRateEtb?: number;
  isAvailable?: boolean;
  latitude?: number;
  longitude?: number;
}

export class WorkerRepository {
  async findByUserId(userId: string): Promise<any | null> {
    const sql = `
      SELECT
        wp.*,
        u.full_name,
        u.phone_number,
        u.avatar_url,
        u.profile_audio_url,
        u.is_verified,
        ST_Y(wp.current_location::geometry) as latitude,
        ST_X(wp.current_location::geometry) as longitude
      FROM worker_profiles wp
      INNER JOIN users u ON u.id = wp.user_id
      WHERE wp.user_id = $1;
    `;
    const res = await query(sql, [userId]);
    return res.rows[0] || null;
  }

  async findById(workerProfileId: string): Promise<any | null> {
    const sql = `
      SELECT
        wp.*,
        u.full_name,
        u.phone_number,
        u.avatar_url,
        u.profile_audio_url,
        u.is_verified,
        ST_Y(wp.current_location::geometry) as latitude,
        ST_X(wp.current_location::geometry) as longitude
      FROM worker_profiles wp
      INNER JOIN users u ON u.id = wp.user_id
      WHERE wp.id = $1 OR wp.user_id = $1;
    `;
    const res = await query(sql, [workerProfileId]);
    return res.rows[0] || null;
  }

  async upsertProfile(input: UpsertWorkerProfileInput): Promise<WorkerProfile> {
    const {
      userId,
      skillCategory,
      skillDescription = '',
      experienceYears = 1,
      hourlyRateEtb = 400.0,
      isAvailable = true,
      latitude,
      longitude
    } = input;

    let locationFragment = '';
    const params: any[] = [
      userId,
      skillCategory,
      skillDescription,
      experienceYears,
      hourlyRateEtb,
      isAvailable
    ];

    if (latitude !== undefined && longitude !== undefined) {
      params.push(longitude, latitude);
      locationFragment = `, current_location = ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography, location_updated_at = CURRENT_TIMESTAMP`;
    }

    const sql = `
      INSERT INTO worker_profiles (
        user_id, skill_category, skill_description,
        experience_years, hourly_rate_etb, is_available
        ${latitude !== undefined && longitude !== undefined ? ', current_location, location_updated_at' : ''}
      )
      VALUES (
        $1, $2, $3, $4, $5, $6
        ${latitude !== undefined && longitude !== undefined ? ', ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography, CURRENT_TIMESTAMP' : ''}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        skill_category = EXCLUDED.skill_category,
        skill_description = EXCLUDED.skill_description,
        experience_years = EXCLUDED.experience_years,
        hourly_rate_etb = EXCLUDED.hourly_rate_etb,
        is_available = EXCLUDED.is_available,
        updated_at = CURRENT_TIMESTAMP
        ${locationFragment}
      RETURNING *;
    `;

    const res = await query(sql, params);
    return res.rows[0];
  }

  async setAvailability(userId: string, isAvailable: boolean): Promise<boolean> {
    const res = await query(`
      UPDATE worker_profiles
      SET is_available = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING id;
    `, [isAvailable, userId]);
    return (res.rowCount ?? 0) > 0;
  }

  async recalculateWorkerRating(workerUserId: string): Promise<void> {
    const statsRes = await query(`
      SELECT
        COUNT(id)::int as count,
        COALESCE(AVG(rating), 0)::numeric(3,2) as avg_rating
      FROM ratings
      WHERE worker_id = $1;
    `, [workerUserId]);

    const { count, avg_rating } = statsRes.rows[0];

    await query(`
      UPDATE worker_profiles
      SET rating_avg = $1, rating_count = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3;
    `, [avg_rating, count, workerUserId]);
  }
}

export const workerRepository = new WorkerRepository();
