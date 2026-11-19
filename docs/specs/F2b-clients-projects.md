# F2b · Clients home, project wizard, agency settings
Owner: B (John) · Days 5–5 · Release 1 · Tracker: F2.3, F2.4, F2.5 · PRD: [F2](../PRD.md#f2)

## Goal
Admins and managers see every client at a glance, create isolated client projects, and set team, language and per-client hours.

## Acceptance criteria
- [ ] Clients home: per client new today, unreplied, MQL rate, 14-day sparkline, connection dots; client search; add client.
- [ ] Create project (name, city, industry, team) → isolated workspace + default pipeline (New, Contacted, Qualified, Visit booked, Won, Lost); creator auto-assigned. Cities: Abu Dhabi, Dubai, Morocco.
- [ ] Agency settings: team and roles, language, first-reply target. Per client: IANA time zone, business hours.

## Data model / API / job changes
- projects, project_members, pipeline_stages written in one transaction; agency_settings row.
- Team and roles screen calls Alex's invite/changeRole actions (F1c).
- Connection dots read integrations.status; unreplied = conversations whose last message is inbound.

## Files touched
- B (John): src/modules/projects/*, src/app/[locale]/(app)/(clients home, settings)/*, messages/en/projects.json

## Dependencies
F2a, F1b. (Stub session until F1c merges the same day.)

## Edge cases
- Agent cannot create projects (`can()`); manager sees only assigned clients on home.
- Time zone required; business hours default Mon–Fri 09:00–18:00 in the client's zone.
- Project with no data yet → zero states, no division by zero in MQL rate.

## Out of scope
Manual Add lead, extra cities, Ctrl+K.

## Test plan
- Wizard creates project + stages + membership atomically; failure leaves nothing.
- Permission tests: agent blocked, manager scoped.
