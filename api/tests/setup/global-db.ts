// Vitest global setup: wipe and re-migrate the test database once per run.
// Guard: TEST_DATABASE_URL must point at a database whose name ends with `_test`.
import pg from 'pg';
import { MIGRATIONS_SCHEMA, runMigrations } from '../../src/db/migrator.ts';
import { getTestDbUrl } from '../../src/lib/env.ts';

export default async function setup(): Promise<void> {
  const url = getTestDbUrl();
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`drop schema if exists public cascade; create schema public;`);
    await client.query(`drop schema if exists ${MIGRATIONS_SCHEMA} cascade;`);
  } finally {
    await client.end();
  }
  await runMigrations(url);
}
