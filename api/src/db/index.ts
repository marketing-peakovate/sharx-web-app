import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { getDbEnv } from '../lib/env.ts';
import * as schema from './schema/index.ts';

// One lazy pool per process. F1b replaces this with role-specific pools
// (app_user / app_system) and the withTenant()/withSystem() helpers.
let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  pool ??= new pg.Pool({ connectionString: getDbEnv().DATABASE_URL, max: 10 });
  return pool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}

export async function pingDb(timeoutMs = 2000): Promise<'ok' | 'error'> {
  try {
    await Promise.race([
      getPool().query('select 1'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
    ]);
    return 'ok';
  } catch {
    return 'error';
  }
}
