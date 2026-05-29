import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import * as schema from './schema';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', err);
});

export const db = drizzle(pool, { schema });

export { pool };

// Graceful shutdown
const shutdown = async () => {
  logger.info('Closing database pool...');
  await pool.end();
  logger.info('Database pool closed.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
