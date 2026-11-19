# F10b · Client marking, export, link and qualification settings
Owner: B (John) · Days 15–15 · Release 3 · Tracker: F10.4, F10.5, F10.6 · PRD: [F10](../PRD.md#f10)

## Goal
Clients mark leads MQL, SQL or Not qualified, and each mark flows to the CRM and the ad platforms in one transaction.

## Acceptance criteria
- [ ] Client marks MQL/SQL/Not qualified; Not qualified requires a reason (list editable in Settings → Lead qualification); a mark can be changed later; MQL/SQL definitions shown.
- [ ] Toggles: client can mark; client can export CSV.
- [ ] A mark is one transaction: status, history, audit row, conversion outbox rows.

## Data model / API / job changes
- Portal marking calls `changeStatus(…, by: {kind: client})` (CONTRACTS §4) → outbox rows consumed by Alex's F11a.
- client_links.can_mark / can_export; `/api/export/portal-leads` (last 30 days, no test leads).
- qualification_settings: MQL/SQL definitions, reasons list (`link.manage`); settings pages "Client lead link" and "Lead qualification".

## Files touched
- B (John): src/modules/client-link/*, src/modules/leads (qualification settings), src/app/l/[token]/*, src/app/[locale]/(app)/p/[projectId]/settings/{link,qualification}/*

## Dependencies
F10a, F11a.

## Edge cases
- Marking disabled → buttons hidden, server rejects too.
- Reason removed from the list later → existing leads keep their reason text.
- Rapid re-marks → each produces its own status_seq and events.
- Client double-clicks → idempotent within the same status.

## Out of scope
"SharkX suggests MQL", unreviewed reminders to clients, Won.

## Test plan
- Mark → one transaction creates status, event, audit, outbox rows (rollback test).
- Toggle enforcement server-side; export contents.
