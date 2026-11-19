import pg from 'pg';
import { afterAll, describe, expect, it } from 'vitest';
import { MIGRATIONS_SCHEMA, MIGRATIONS_TABLE } from '../../src/db/migrator.ts';
import { getTestDbUrl } from '../../src/lib/env.ts';

const pool = new pg.Pool({ connectionString: getTestDbUrl(), max: 1 });
afterAll(() => pool.end());

describe('test database', () => {
  it('is reachable', async () => {
    const { rows } = await pool.query<{ ok: number }>('select 1 as ok');
    expect(rows[0]?.ok).toBe(1);
  });

  it('has the migrations journal from global setup', async () => {
    const { rows } = await pool.query<{ n: string }>(
      `select count(*)::text as n from ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE}`,
    );
    expect(Number(rows[0]?.n)).toBeGreaterThanOrEqual(1);
  });
});
