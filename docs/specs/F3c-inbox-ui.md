# F3c · WhatsApp inbox UI, assignment, notes
Owner: B (John) · Days 8–9 · Release 2 · Tracker: F3.6, F3.7 · PRD: [F3](../PRD.md#f3)

## Goal
The team reads every tracked chat in one read-only inbox, assigns it and leaves internal notes.

## Acceptance criteria
- [ ] Inbox is read-only: tabs Unread/All/Recent, number chips, search, thread, lead details; no send box; media shown as typed placeholder.
- [ ] Assign chat/lead; internal notes visible to SHARKX only.

## Data model / API / job changes
- Reads wa_conversations/wa_messages through the whatsapp module's exported read functions (Alex).
- Notes in `notes`; assignment via leads service (`lead.assign`, audit).
- Refresh via SWR interval until F14a's events endpoint; then change_feed `message` kind.
- Unread = inbound messages after the viewer's last open of that chat.

## Files touched
- B (John): src/app/[locale]/(app)/p/[projectId]/inbox/*, src/components/inbox/*, src/modules/leads (notes), messages/en/inbox.json
- A (Alex): whatsapp read exports (added in F3b)

## Dependencies
F4b; F3b runs in parallel (build against `tests/fixtures/whatsapp` until it merges).

## Edge cases
- Long threads paginate upward; day separators in project time zone.
- Chat on a disconnected number stays readable with a banner.
- Notes never appear in the client portal or exports.
- Mobile: list → thread → details as stacked views.

## Out of scope
Composer/sending, starred chats, keyboard shortcuts, media download.

## Test plan
- Component tests: tabs counts, number filter, search.
- Permission: agent of another client gets nothing; note visibility test.
