// Shared Zod contracts between web (BFF) and api: docs/specs/CONTRACTS.md, frozen Day 1 (spec F1a).
// Source of truth is this folder (api/src/contracts). web/src/contracts is a generated copy:
// run `node scripts/sync-contracts.mjs` after every change; CI fails if the copy is stale.
// Files here may import only `zod` and each other (relative, with .ts extension).
export const CONTRACTS_VERSION = '0.0.0';
