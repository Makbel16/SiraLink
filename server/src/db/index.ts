import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

const isProduction = env.NODE_ENV === 'production';

// Render and cloud PostgreSQL providers require SSL with rejectUnauthorized: false
const sslConfig = isProduction || env.DATABASE_URL.includes('sslmode=require')
  ? { rejectUnauthorized: false }
  : false;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: sslConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected error on idle PostgreSQL client pool', err);
});

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn('Slow database query detected', { durationMs: duration });
    }
    return res;
  } catch (error) {
    logger.error('Database query execution error', error, { query: text });
    throw error;
  }
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

export async function closePool(): Promise<void> {
  logger.info('Closing PostgreSQL pool connections...');
  await pool.end();
  logger.info('PostgreSQL pool closed successfully.');
}
