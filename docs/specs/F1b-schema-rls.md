# F1b · Schema, RLS, tenant helpers
Owner: A (Alex) · Days 2–3 · Release 1 · Tracker: F1.2 · PRD: [F1](../PRD.md#f1)

## Goal
All base tables exist with database-level client isolation, and every query runs through a tenant helper.

## Acceptance criteria
- [ ] Manager/Agent read zero rows from other clients via UI, actions, API and polling (isolation suite proves it).

## Data model / API / job changes
- Create every table in CONTRACTS §3 (base columns only); single migration.
- DB roles: `app_migrator` (owner, migrations), `app_user` (web), `app_system` (worker, webhooks, portal). Runtime roles own nothing, no BYPASSRLS.
- ENABLE + FORCE RLS on all tenant tables. Policy: member of `project_id`, or role admin, or `project_id = app.project_id`.
- `withTenant(session, fn)` and `withSystem(projectId, fn)`: one transaction, `set_config(..., true)` (transaction-local). Two pools.
- `audit_log` INSERT-only grant. `emitChange()` helper (CONTRACTS §4).

## Files touched
- A (Alex): src/lib/db/*, src/lib/tenant/*, drizzle/*, A-owned modules' schema.ts
- B (John): first versions of B-owned modules' schema.ts written here from CONTRACTS §3; John reviews, then owns them

## Dependencies
F1a.

## Edge cases
- No context set → zero rows, never an error that leaks existence.
- Connection reused after a failed transaction keeps no setting.
- Admin role sees all projects; system context sees exactly one.
- Table owner bypass prevented by FORCE.
- Users/sessions/auth_tokens are not tenant tables: column grants keep `pw_hash`/token hashes inside `modules/auth`.

## Out of scope
Auth flows (F1c), seed data (F4a), any UI.

## Test plan
- Isolation suite per tenant table: user of project A cannot read/insert/update/delete project B rows; unset context returns zero rows.
- Pool test: two concurrent transactions with different contexts never cross.
- Migration runs clean on an empty database in CI.
