import { Pool } from 'pg';
import { env } from './env';

const pool = new Pool({
  host:     env.DB_HOST,
  port:     env.DB_PORT,
  database: env.DB_NAME,
  user:     env.DB_USER,
  password: env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 3_000,
});

pool.on('error', (err) => {
  console.error('Error inesperado en cliente PostgreSQL inactivo:', err);
  process.exit(1);
});

export default pool;
