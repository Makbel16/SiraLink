import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './index.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  logger.info('Starting database migrations...');
  let migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    migrationsDir = path.join(__dirname, '../../src/db/migrations');
  }
  if (!fs.existsSync(migrationsDir)) {
    migrationsDir = path.resolve('src/db/migrations');
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  if (files.length === 0) {
    logger.warn('No migration files found.');
    return;
  }

  // Create migrations tracker table if not exists
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const file of files) {
    const check = await query('SELECT 1 FROM _migrations WHERE name = $1', [file]);
    if (check.rowCount && check.rowCount > 0) {
      logger.info(`Migration already executed: ${file}`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    logger.info(`Executing migration: ${file}`);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      logger.info(`Successfully executed migration: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`Failed to execute migration: ${file}`, err);
      throw err;
    } finally {
      client.release();
    }
  }

  logger.info('All database migrations completed successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => {
      logger.info('Migration process finished.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Migration process failed with error', err);
      process.exit(1);
    });
}
