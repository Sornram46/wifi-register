import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
}

console.log(
  '🔍 Using DATABASE_URL:',
  process.env.DATABASE_URL?.replace(/:(\/\/)?([^:@]+):([^@]+)@/, '://****:****@'),
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Database error:', err);
});

export default pool;