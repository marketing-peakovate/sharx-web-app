// Builds the Fastify app (backend API). server.ts listens; tests use app.inject() without a socket.
// Public routes (later specs): /webhooks/*, /oauth/*/callback, /forms/:key, /health.
// Every other route is called by web (the BFF) and requires the user's session (F1c).
import Fastify, { type FastifyInstance } from 'fastify';
import type { ApiEnv } from './lib/env.ts';
import { healthRoutes } from './routes/health.ts';

export async function buildApp(env: ApiEnv): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: env.LOG_LEVEL, base: { service: 'api', appEnv: env.APP_ENV } },
  });
  await app.register(healthRoutes, { env });
  return app;
}
