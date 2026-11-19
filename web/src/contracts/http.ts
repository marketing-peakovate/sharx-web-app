// GENERATED from api/src/contracts by scripts/sync-contracts.mjs. Do not edit; change the source and re-run the script.
import { z } from 'zod';
import { changeKind, healthState, iso, source } from './common.ts';

// CONTRACTS §6. The api's /health also sends commit, appEnv and time; they are not part of the contract.
const checkState = z.enum(['ok', 'error', 'unknown']);

export const healthResponse = z.object({
  status: z.enum(['ok', 'error']),
  service: z.string(),
  version: z.string(),
  // partialRecord: no integration key until F14a fills them in
  checks: z.object({
    db: checkState,
    queue: checkState,
    integrations: z.partialRecord(source, healthState),
  }),
  lastWebhookAt: iso.nullable(),
});

// GET /api/events?since=<cursor>. The cursor is a string because change_feed.id is a bigint.
export const eventsResponse = z.object({
  cursor: z.string(),
  changes: z.array(z.object({ kind: changeKind, projectId: z.uuid(), id: z.uuid() })),
});

export type HealthResponse = z.infer<typeof healthResponse>;
export type EventsResponse = z.infer<typeof eventsResponse>;
