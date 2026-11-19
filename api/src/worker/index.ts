// Worker service entry (`pnpm start:worker`). Runs pg-boss consumers; started by Railway's worker service.
// Runs under Node's native TypeScript support: relative imports with explicit .ts extensions, no path aliases.
import { PgBoss } from 'pg-boss';
import { getWorkerEnv } from '../lib/env.ts';
import { createLogger } from '../lib/log/index.ts';

const env = getWorkerEnv();
const log = createLogger(env.LOG_LEVEL, { service: 'worker', appEnv: env.APP_ENV });

// Example job; real queues come from docs/specs/CONTRACTS.md §5 (registered in F1d).
const EXAMPLE_QUEUE = 'example.hello';

const boss = new PgBoss(env.DATABASE_URL);
boss.on('error', (err: Error) => log.error('pg-boss error', { error: err.message }));

await boss.start();
await boss.createQueue(EXAMPLE_QUEUE);
await boss.work<{ name: string }>(EXAMPLE_QUEUE, async (jobs) => {
  for (const job of jobs) log.info('example job done', { jobId: job.id, name: job.data.name });
});
log.info('worker started', { queues: [EXAMPLE_QUEUE] });

const shutdown = async (signal: string) => {
  log.info('worker stopping', { signal });
  await boss.stop({ graceful: true });
  process.exit(0);
};
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
