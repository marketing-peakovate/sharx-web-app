import type { FastifyPluginAsync } from 'fastify';
import pkg from '../../package.json' with { type: 'json' };
import { pingDb } from '../db/index.ts';
import type { ApiEnv } from '../lib/env.ts';

// Railway healthcheck for the api service. F14a adds queue, integrations and lastWebhookAt. No secrets or PII.
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
        checks: { db },
        time: new Date().toISOString(),
      });
  });
};
