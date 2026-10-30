/**
 * Apply supabase/migrations/*.sql to the project database.
 *
 * Usage:
 *   node --env-file=.env.migrate scripts/supabase/apply-schema.mjs
 *
 * Requires DATABASE_URL (Supabase Dashboard -> Connect -> Session pooler URI)
 * in .env.migrate, e.g.
 *   DATABASE_URL=postgresql://postgres.xxxx:password@aws-0.ap-southeast-1.pooler.supabase.com:6543/postgres
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env.migrate (use the Session pooler connection string).');
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(here, '../../supabase/migrations');
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (!files.length) {
  console.error(`No .sql migrations found in ${migrationsDir}`);
  process.exit(1);
}

const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Applying ${file} (${sql.length} chars)...`);
    await client.query(sql);
    console.log('  OK');
  }
  console.log('Schema applied successfully.');
} catch (err) {
  console.error(`FAILED: ${err.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
