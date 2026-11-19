import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.ts';
import { healthResponse } from '../src/contracts/index.ts';
import { getPool } from '../src/db/index.ts';
import { apiSchema, getTestDbUrl, parseEnv } from '../src/lib/env.ts';

// vitest.config.ts sets DATABASE_URL to TEST_DATABASE_URL, so the app's pool uses the test database.
const env = parseEnv(
  apiSchema,
  { DATABASE_URL: getTestDbUrl(), APP_URL: 'http://localhost:3000', LOG_LEVEL: 'error' },
  'api',
);

describe('GET /health', () => {
  afterAll(async () => {
    await getPool().end();
  });

  it('reports db, queue, integrations and last webhook as the contract says', async () => {
    const app = await buildApp(env);
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = healthResponse.parse(res.json());
    expect(body).toMatchObject({
      status: 'ok',
      service: 'api',
      checks: { db: 'ok', queue: 'unknown', integrations: {} },
      lastWebhookAt: null,
    });
    expect(body.version).toBeTruthy();
    await app.close();
  });
});
