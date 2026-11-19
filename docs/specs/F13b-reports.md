# F13b · Reports and export
Owner: B (John) · Days 18–18 · Release 3 · Tracker: F13.2, F13.3 · PRD: [F13](../PRD.md#f13)

## Goal
Managers see lead quality by source and campaign and agent response times, and export them.

## Acceptance criteria
- [ ] Reports: 7/30/90 days; funnel Leads → MQL → SQL; performance by source **and** campaign; first-reply time by agent; CSV export.
- [ ] Definitions: MQL rate = (MQL+SQL)/leads; SQL rate = SQL/leads; first reply = first customer message → first outbound message.

## Data model / API / job changes
- Aggregates in `modules/reports` (shared with F13a), excluding is_test; `/api/export/report` (`report.read`).
- Agent attribution for first reply = owner at the time of the first outbound message.

## Files touched
- B (John): src/modules/reports/*, src/app/[locale]/(app)/p/[projectId]/reports/*, messages/en/reports.json

## Dependencies
F13a.

## Edge cases
- Range boundaries in the client's time zone.
- Campaign names missing → "(no campaign)" bucket.
- Agents without replies → excluded from the agent chart.

## Out of scope
Cost per SQL, Won in funnel, scheduled report emails.

## Test plan
- Funnel and source/campaign tables against seed data.
- Export equals on-screen table for each range.
