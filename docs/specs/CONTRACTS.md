# CONTRACTS · frozen Day 1

Shared between **Alex (Dev A, Pipes)** and **John (Dev B, Product)** so both build in parallel from Day 1. Mirrored as Zod in `api/src/contracts` (spec F1a); `web/src/contracts` is a generated copy (`node scripts/sync-contracts.mjs`, never edited by hand).
- Layout: `web` (Next.js BFF) calls `api` (Fastify) over HTTP; §4 functions run inside the api (and worker). Each web-facing api endpoint gets a Zod request/response schema in `api/src/contracts`, added by the spec that needs it. Path mapping for specs: CLAUDE.md "Layers and ownership".
- After Day 1: additive changes only (new optional field, new enum value), in a `contracts:` commit that both devs have agreed to. Renames/removals need both devs and an ARCHITECTURE update.
- Notation: `?` = optional, `uuid`, `iso` = ISO-8601 UTC string, `e164` = `+9715…`.

## 1 Session and permissions
- `Session { userId: uuid, role: admin|manager|agent, projectIds: uuid[], locale: en|ar|fr, stage: active|pending_2fa }`
- `can(session, action, projectId?) → boolean`. Admin: every project. Manager/Agent: only `projectIds`. `pending_2fa` → always false.

| Action | Admin | Manager | Agent |
|---|---|---|---|
| project.read, lead.read, lead.update, lead.assign, chat.read, chat.note, task.manage | ✓ | ✓ | ✓ |
| project.create, project.update, pipeline.manage, automation.manage, link.manage, integration.manage, conversion.manage, lead.export, report.read | ✓ | ✓ | |
| user.manage, audit.read, agency.manage | ✓ | | |

## 2 Enums
- `source`: meta, google, youtube, tiktok, linkedin, snapchat, website, whatsapp, csv
- `leadStatus`: new, mql, sql, not_qualified
- `health`: connected, needs_attention, broken, not_connected · `mode`: live, fixture, awaiting
- `direction`: in, out · `origin`: customer, app, history · `msgType`: text, image, audio, video, document, sticker, location, other
- `actorKind`: user, client, system · `conversionState`: pending, sent, retrying, failed, skipped
- `changeKind`: lead, message, task, health, notification, link
- `notificationKind`: new_lead, new_message, no_reply, task_due, connection_issue, client_marked

## 3 Tables (base versions created once in F1b; then each owner evolves its own)
Every tenant table has `project_id uuid not null` (RLS). All have `id uuid`, timestamps `timestamptz` UTC.

| Table | Key columns | Owner |
|---|---|---|
| users | email (unique), name, role, pw_hash, locale, status | A |
| sessions | token_hash, user_id, stage, idle_expires_at, expires_at | A |
| auth_tokens | user_id, kind invite/reset/email_code, token_hash, expires_at, attempts, used_at | A |
| project_members | project_id, user_id (unique pair) | A (lib/tenant) |
| audit_log | at, actor_kind, actor_id, project_id?, action, entity, entity_id, meta jsonb (INSERT-only) | A |
| rate_limits, error_log | key/window/count · fingerprint, message, context | A |
| integrations | project_id, platform, status (health), mode, account_label, last_data_at, note | A |
| integration_tokens | integration_id, enc_value, key_id, expires_at | A |
| webhook_events | provider, external_id (unique pair), project_id?, payload jsonb, processed_at, error | A |
| wa_numbers | project_id, phone_e164, label, phone_number_id, waba_id, sync_state none/syncing/done/missed, sync_pct | A |
| wa_conversations | project_id, number_id, contact_id, last_message_at | A |
| wa_messages | project_id, conversation_id, wa_message_id (unique), direction, origin, type, text?, ts | A |
| conversion_mappings | project_id, status, meta_event, google_event, enabled | A |
| conversion_events | project_id, lead_id, status, status_seq, platform meta/google, state, attempts, last_error, sent_at; unique(lead_id, status_seq, platform) | A |
| change_feed | id bigserial, project_id, kind, ref_id, at | A |
| projects | name, city, industry, timezone (IANA), business_hours jsonb, color, created_by | B |
| agency_settings | single row: first_reply_minutes (default 15) | B |
| pipeline_stages | project_id, name, position | B |
| contacts | project_id, name?, phone_e164?, email?; unique(project_id, phone_e164) | B |
| leads | project_id, contact_id, source, external_id?, form_id?, campaign?, answers jsonb, attribution jsonb, status, status_seq, reason?, stage_id, owner_id?, is_test, first_reply_at?; unique(project_id, source, external_id) | B |
| lead_events | project_id, lead_id, kind, data jsonb, actor_kind, actor_id?, at | B |
| lead_forms | project_id, integration_id, external_form_id, name, mapping jsonb | B |
| notes, tasks | lead_id, author_id, text · lead_id?, assignee_id, title, due_at, done_at? | B |
| client_links | project_id, token_hash, can_mark, can_export, revoked_at?, last_opened_at? | B |
| qualification_settings | project_id, mql_definition, sql_definition, reasons text[] | B |
| automation_rules | project_id, trigger, conditions jsonb, actions jsonb, enabled, run_count | B |
| notifications | user_id, project_id, kind, ref_id, read_at? | B |

## 4 Function contracts
- **`ingestLead(input) → { leadId, contactId, created, merged }`** (owner B; called by A adapters inside `withSystem(projectId)`)
  - input: `projectId, source, externalId?, formId?, campaign?, name?, phone?, email?, answers: {question: answer}, attribution?: {fbclid?, gclid?, utm_source?, utm_medium?, utm_campaign?, utm_term?, utm_content?, adId?}, receivedAt: iso, isTest?`
  - Idempotent on `(projectId, source, externalId)`. Writes lead_events, audit_log, change_feed in one transaction.
- **`recordMessage(input) → { messageId, duplicate, leadId }`** (owner A; calls `ingestLead` with source whatsapp for unknown numbers)
  - input: `projectId, numberId, waMessageId, direction, customerPhone: e164, ts: iso, type: msgType, text?, origin`
- **`changeStatus(leadId, to, reason?, by) → statusChanged`** (owner B). `statusChanged = { leadId, projectId, from, to, statusSeq, reason?, by: {kind: actorKind, id?}, at }`. Same transaction: lead_events + audit_log + one `conversion_events` row (state pending) per enabled mapping + change_feed. Not qualified requires `reason`.
- **`emitChange(kind, projectId, refId)`** (owner A, `lib/tenant`): inserts change_feed in the caller's transaction.
- **`notify({ projectId, userIds | role, kind, refId, email? })`** (owner B, notifications): creates notifications rows; `email` true for alert kinds.
- **Adapter** (owner A, `modules/integrations/<platform>`): `{ platform, connectDescriptor: { steps: [{ kind: oauth|select|mapping|qr|snippet|upload, labelKey }] }, handleWebhook?(request), poll?(integrationId), health(integrationId) → { status: health, note? }, refresh?(integrationId) }`
- **Wizard actions** (A, consumed by B's wizard): `startConnect(platform, projectId) → redirectUrl | qrSession`, `listChoices(integrationId) → [{id, label, kind: account|page|form|number}]`, `saveChoices(integrationId, ids[])`, `sendTestLead(integrationId)` (creates an `isTest` lead). Mapping is saved via B's `saveFormMapping(formId, mapping)`.

## 5 Jobs (pg-boss; producer → consumer owner)
| Job | Payload | Producer | Consumer |
|---|---|---|---|
| webhook.process | { webhookEventId } | webhook routes (A) | A |
| wa.history.sync | { numberId, cursor? } | WhatsApp onboarding (A) | A |
| conversion.send | { conversionEventId } | changeStatus (B) | A |
| integration.health | {} (cron 5 min) | worker (A) | A |
| automation.timer | { ruleId, leadId, kind: no_reply\|unreviewed } | leads/automation (B) | B |
| task.reminder | { taskId } | tasks (B) | B |
| email.send | { to, template, locale, data } | any | A |
| csv.import | { projectId, uploadId, mapping } | CSV modal (B UI → A action) | A |
| maintenance | {} (cron daily) | worker (A) | A |

## 6 HTTP routes
- **api public** (owner A): `GET|POST /webhooks/meta` (WhatsApp + Lead Ads, signature) · `POST /webhooks/{google,tiktok,linkedin,snapchat}` · `POST /forms/:key` (rate-limited) · `GET /oauth/:platform/callback` · `GET /health` → `{ status, service, version, checks: { db, queue, integrations }, lastWebhookAt }`
- **api internal** (called only by web, user session token forwarded): one route group per module; shapes in `api/src/contracts`.
- **web BFF** (owner B unless noted): `GET /api/events?since=<cursor>` → `{ cursor, changes: [{ kind: changeKind, projectId, id }] }` (proxies the api) · `GET /api/health` (web + api + db) · `GET /api/export/[kind]` (kind: leads, report, portal-leads; excludes is_test) · `/api/portal/*` and page `/l/[token]` on the leads host only

## 7 Errors
`AppError(code, status)`: UNAUTHENTICATED 401, FORBIDDEN 403, NOT_FOUND 404, CONFLICT 409, VALIDATION 422, RATE_LIMITED 429, INTEGRATION_ERROR 502, INTERNAL 500. Message keys `errors.<code>` in every locale.

## 8 Fixtures
- `tests/fixtures/<platform>/*.json`: recorded webhook/API payloads (Alex). John's UI uses them before integrations land.
- Seed set (John, F4a): mockup's 5 clients, ~64 leads, chats, team.
