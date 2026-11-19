// API service entry (`pnpm start:api`). Railway sets PORT; '::' accepts IPv4 and IPv6 (private networking).
import { buildApp } from './app.ts';
import { getApiEnv } from './lib/env.ts';

const env = getApiEnv();
const app = await buildApp(env);

const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'api stopping');
  await app.close();
  process.exit(0);
};
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

await app.listen({ port: env.PORT, host: '::' });
