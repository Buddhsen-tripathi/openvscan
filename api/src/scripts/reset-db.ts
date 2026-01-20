import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  const client = await pool.connect();

  try {
    // List tables before drop
    const resBefore = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables before drop:', resBefore.rows.map(r => r.table_name));

    console.log('🗑️  Dropping all tables...');
    
    // Drop tables in correct order to handle foreign key constraints
    await client.query(`
      DROP TABLE IF EXISTS "finding" CASCADE;
      DROP TABLE IF EXISTS "scan_log" CASCADE;
      DROP TABLE IF EXISTS "scan" CASCADE;
      DROP TABLE IF EXISTS "project" CASCADE;
      DROP TABLE IF EXISTS "account" CASCADE;
      DROP TABLE IF EXISTS "session" CASCADE;
      DROP TABLE IF EXISTS "verification" CASCADE;
      DROP TABLE IF EXISTS "user" CASCADE;
      DROP TABLE IF EXISTS "drizzle_migrations" CASCADE;
      DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;
    `);

    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDb();
