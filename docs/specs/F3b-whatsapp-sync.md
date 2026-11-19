# F3b · WhatsApp history sync, live ingest, linking, health
Owner: A (Alex) · Days 8–9 · Release 2 · Tracker: F3.3, F3.4, F3.5, F3.8 · PRD: [F3](../PRD.md#f3)

## Goal
Every message on a connected number (6-month history and live, both sides) is stored once and linked to the right contact and lead.

## Acceptance criteria
- [ ] History: last 6 months imported once (Meta allows one sync within 24 h of onboarding); groups excluded; interrupted sync resumes; missed window shows "Reconnect needed".
- [ ] Both sides tracked live (customer messages and messages sent from the app); duplicate deliveries never duplicate messages.
- [ ] Chat from an unknown number creates contact + lead (source WhatsApp); a known number attaches to the contact's open lead.
- [ ] Disconnect or ~14-day app inactivity shows Needs attention + alert email.

## Data model / API / job changes
- `recordMessage()` (CONTRACTS §4) → wa_conversations, wa_messages; unknown number → `ingestLead` (source whatsapp).
- `wa.history.sync` job: resumable chunks, cursor stored, must finish within 24 h; `sync_state`/`sync_pct` on wa_numbers.
- Health: inactivity/disconnect webhooks set integration status needs_attention + `notify` + alert email.
- `emitChange('message', …)` for the inbox.
- After this spec: record per-permission screencasts and submit App Review (target end of D9).

## Files touched
- A (Alex): src/modules/whatsapp/*, src/worker/jobs/wa-*, tests/fixtures/whatsapp/*

## Dependencies
F3a, F4a (`ingestLead`).

## Edge cases
- History and echo of the same message arrive in any order → one row.
- Same customer messages two numbers of one client → one contact, two conversations.
- Sync job crashes mid-chunk → resumes from cursor.
- 24 h window passes before completion → sync_state missed, "Reconnect needed".
- Media → typed placeholder only.

## Out of scope
Media storage, group chats, replying.

## Test plan
- Fixture replay (history + live + echoes, shuffled) is idempotent.
- Linking tests: unknown, known-open, known-closed (Not qualified → new lead).
- Fake-clock test of the 24 h window; health alert on inactivity fixture.
