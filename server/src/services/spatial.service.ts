import { query } from '../db/index.js';
import { JobCategory, NearbyWorkerResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface NearbyWorkerParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  category?: JobCategory;
  limit?: number;
  offset?: number;
}

export class SpatialService {
  /**
   * Search for nearby available workers using PostGIS ST_DWithin and ST_Distance
   */
  async findNearbyWorkers(params: NearbyWorkerParams): Promise<NearbyWorkerResult[]> {
    const {
      latitude,
      longitude,
      radiusKm = 5,
      category,
      limit = 20,
      offset = 0
    } = params;

    const radiusMeters = radiusKm * 1000;
    const queryParams: any[] = [longitude, latitude, radiusMeters];
    let categoryClause = '';

    if (category) {
      queryParams.push(category);
      categoryClause = `AND wp.skill_category = $${queryParams.length}`;
    }

    queryParams.push(limit, offset);
    const limitClause = `LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    const sql = `
      SELECT
        wp.id,
        wp.user_id,
        u.full_name,
        u.phone_number,
        u.avatar_url,
        u.profile_audio_url,
        wp.skill_category,
        wp.skill_description,
        wp.experience_years,
        wp.hourly_rate_etb,
        wp.rating_avg,
        wp.rating_count,
        wp.is_available,
        ST_Y(wp.current_location::geometry) as latitude,
        ST_X(wp.current_location::geometry) as longitude,
        ST_Distance(
          wp.current_location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) AS distance_meters
      FROM worker_profiles wp
      INNER JOIN users u ON u.id = wp.user_id
      WHERE
        wp.is_available = TRUE
        AND u.is_active = TRUE
        AND wp.current_location IS NOT NULL
        AND ST_DWithin(
          wp.current_location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
        ${categoryClause}
      ORDER BY distance_meters ASC
      ${limitClause};
    `;

    logger.info('Executing PostGIS nearby workers query', {
      latitude,
      longitude,
      radiusKm,
      category
    });

    const result = await query(sql, queryParams);

    return result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      full_name: row.full_name,
      phone_number: row.phone_number,
      avatar_url: row.avatar_url,
      profile_audio_url: row.profile_audio_url,
      skill_category: row.skill_category,
      skill_description: row.skill_description,
      experience_years: row.experience_years,
      hourly_rate_etb: row.hourly_rate_etb ? parseFloat(row.hourly_rate_etb) : null,
      rating_avg: parseFloat(row.rating_avg),
      rating_count: row.rating_count,
      is_available: row.is_available,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      distance_meters: Math.round(parseFloat(row.distance_meters)),
      distance_km: Math.round((parseFloat(row.distance_meters) / 1000) * 10) / 10
    }));
  }

  /**
   * Update a worker's geographic location
   */
  async updateWorkerLocation(userId: string, latitude: number, longitude: number): Promise<void> {
    const sql = `
      UPDATE worker_profiles
      SET
        current_location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        location_updated_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3;
    `;
    await query(sql, [longitude, latitude, userId]);
    logger.info('Updated worker location in PostGIS', { userId, latitude, longitude });
  }
}

export const spatialService = new SpatialService();
