import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { mockDb } from './mock-db.js';

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
  connectionTimeoutMillis: 3000 // Fast fail in development if local DB is offline
});

let isPostgresOffline = false;

pool.on('error', (err: Error) => {
  logger.warn('PostgreSQL connection error, falling back to development in-memory store', { error: err.message });
  isPostgresOffline = true;
});

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  // If we already know PostgreSQL is offline in development, use in-memory store directly
  if (isPostgresOffline && !isProduction) {
    const res = mockDb.execute(text, params);
    return res as any;
  }

  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn('Slow database query detected', { durationMs: duration });
    }
    return res;
  } catch (error: any) {
    // If connection was refused in development, activate seamless in-memory fallback
    const isConnError =
      error?.name === 'AggregateError' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ETIMEDOUT' ||
      error?.message?.includes('connect ECONNREFUSED');

    if (!isProduction && isConnError) {
      if (!isPostgresOffline) {
        logger.warn(
          '⚠️ Local PostgreSQL is offline. Activating development in-memory store with seeded Addis Ababa workers.'
        );
        isPostgresOffline = true;
      }
      const mockRes = mockDb.execute(text, params);
      return mockRes as any;
    }

    logger.error('Database query execution error', error, { query: text });
    throw error;
  }
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

export async function closePool(): Promise<void> {
  logger.info('Closing PostgreSQL pool connections...');
  try {
    await pool.end();
  } catch {}
  logger.info('PostgreSQL pool closed successfully.');
}
