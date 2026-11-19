import type { FastifyPluginAsync } from 'fastify';
import pkg from '../../package.json' with { type: 'json' };
import { pingDb } from '../db/index.ts';
import type { ApiEnv } from '../lib/env.ts';

// Railway healthcheck for the api service. Shape: HealthResponse (contracts/http.ts). No secrets or PII.
// queue is stubbed until F1d; integrations and lastWebhookAt until F14a.
export const healthRoutes: FastifyPluginAsync<{ env: ApiEnv }> = async (app, { env }) => {
  app.get('/health', async (_req, reply) => {
    const db = await pingDb();
    const ok = db === 'ok';
    return reply
      .code(ok ? 200 : 503)
      .header('cache-control', 'no-store')
      .send({
        status: ok ? 'ok' : 'error',
        service: 'api',
        version: pkg.version,
        commit: env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
        appEnv: env.APP_ENV,
        checks: { db, queue: 'unknown', integrations: {} },
        lastWebhookAt: null,
        time: new Date().toISOString(),
      });
  });
};
