# ORDER · build order by dependency

- Day 1 = Fri 20 Nov 2026 · Day 21 = Thu 10 Dec · Day 28 = Thu 17 Dec. Calendar days, weekends included (shaded in `docs/plan.html`).
- **Alex** = Dev A (Pipes) · **John** = Dev B (Product). Data source for the timeline: `docs/plan-data.js`; keep both in sync.
- Release = first release on or after the spec's end day: R1 Day 7, R2 Day 14, R3 Day 18. Days 19–21 hardening/staging/demo; Days 22–28 UAT + production (outside the 21-day build).

| Start | End | Spec | Owner | Release | Depends on |
|---|---|---|---|---|---|
| D1 Fri 20 Nov | D1 | [F1a Scaffold, CI, Railway, contracts](F1a-scaffold-contracts.md) | Both | R1 | — |
| D1 | D2 Sat 21 Nov | [F2a Shell, tokens, i18n/RTL](F2a-shell-i18n.md) | John | R1 | F1a |
| D2 | D3 Sun 22 Nov | [F1b Schema, RLS, tenant helpers](F1b-schema-rls.md) | Alex | R1 | F1a |
| D3 | D4 Mon 23 Nov | [F4a Lead engine and seed](F4a-lead-engine.md) | John | R1 | F1b |
| D4 | D5 Tue 24 Nov | [F1c Auth, 2FA, roles](F1c-auth.md) | Alex | R1 | F1b |
| D5 | D5 | [F2b Clients home, projects, settings](F2b-clients-projects.md) | John | R1 | F2a, F1b |
| D6 Wed 25 Nov | D6 | [F1d Queue, audit, limits, alerts](F1d-queue-audit.md) | Alex | R1 | F1b |
| D6 | D7 Thu 26 Nov | [F4b Leads screen, drawer, contacts](F4b-leads-ui.md) | John | R1 | F4a, F2a |
| D7 | D7 | [F3a WhatsApp onboarding + webhook](F3a-whatsapp-onboarding.md) | Alex | R1 | F1d |
| D8 Fri 27 Nov | D9 Sat 28 Nov | [F3b WhatsApp sync, ingest, linking](F3b-whatsapp-sync.md) | Alex | R2 | F3a, F4a |
| D8 | D9 | [F3c Inbox UI](F3c-inbox-ui.md) | John | R2 | F4b, F3b (parallel, on fixtures) |
| D10 Sun 29 Nov | D10 | [F7 Website forms and CSV](F7-website-csv.md) | Alex | R2 | F4a, F1d |
| D10 | D10 | [F14b Hub UI and connect wizard](F14b-hub-ui.md) | John | R2 | F2a, F1d |
| D11 Mon 30 Nov | D12 Tue 1 Dec | [F5 Meta Lead Ads](F5-meta-lead-ads.md) | Alex | R2 | F3a, F4a, F14b |
| D11 | D11 | [F8a Stages and kanban](F8a-stages-kanban.md) | John | R2 | F2b, F4b |
| D12 | D12 | [F8b Tasks and reminders](F8b-tasks-reminders.md) | John | R2 | F8a, F1d |
| D13 Wed 2 Dec | D13 | [F6 Google lead forms](F6-google.md) | Alex | R2 | F4a, F14b |
| D13 | D14 Thu 3 Dec | [F10a Client link and portal](F10a-client-link-portal.md) | John | R2 | F2a, F1b |
| D14 | D14 | [F11a Outbox and Meta CAPI](F11a-outbox-meta-capi.md) | Alex | R2 | F1d, F4b |
| D15 Fri 4 Dec | D15 | [F11b Google Data Manager and mapping](F11b-google-dm-mapping.md) | Alex | R3 | F11a |
| D15 | D15 | [F10b Marking and link settings](F10b-marking-settings.md) | John | R3 | F10a, F11a |
| D16 Sat 5 Dec | D16 | [F14a Health, events, alerts](F14a-health-events.md) | Alex | R3 | F1d |
| D16 | D16 | [F12 Routing and automation](F12-routing-automation.md) | John | R3 | F8b, F3b |
| D17 Sun 6 Dec | D17 | [F9a Adapter interface and TikTok](F9a-adapters-tiktok.md) | Alex | R3 | F4a, F14b |
| D17 | D17 | [F13a Overview and agency view](F13a-overview-agency.md) | John | R3 | F4b, F3b |
| D17 | D17 | [F1e Audit log viewer](F1e-audit-viewer.md) | John | R3 | F1d, F2a |
| D18 Mon 7 Dec | D18 | [F9b LinkedIn and Snapchat](F9b-linkedin-snapchat.md) | Alex | R3 | F9a |
| D18 | D18 | [F13b Reports and export](F13b-reports.md) | John | R3 | F13a |
| D19 Tue 8 Dec | D20 Wed 9 Dec | [F15a Security and fixture suites](F15a-security-fixtures.md) | Alex | — | F1b, F3b, F5, F9b |
| D19 | D19 | [F2c Arabic/French and RTL QA](F2c-ar-fr-rtl.md) | John | — | F13b |
| D20 | D20 | [F15b Playwright smoke flows](F15b-playwright.md) | John | — | F13b, F10b |
| D19 | D21 Thu 10 Dec | [F15c Staging, backups, handover, demo](F15c-staging-handover-demo.md) | Both | — | F15a, F15b |
| D22 Fri 11 Dec | D28 Thu 17 Dec | [F15d UAT and production](F15d-uat-production.md) | Both | — | F15c |

## Releases
- **R1 (D7):** scaffold, schema/RLS, auth + 2FA, queue/audit, shell, clients/projects, lead engine + seed, leads screen; WhatsApp onboarding started.
- **R2 (D14):** WhatsApp sync + inbox, website/CSV, hub + wizard, Meta Lead Ads, Google, pipeline + tasks, client portal, outbox + Meta CAPI.
- **R3 (D18, feature freeze):** Google Data Manager + mapping, client marking, health/events/alerts, automation, TikTok/LinkedIn/Snapchat, overview/reports, audit viewer.

## Critical cross-dev links
- F1b (Alex, D2–3) → F4a (John, D3–4): John starts lead engine on Alex's schema; RLS lands end of D3.
- F4a (John, D3–4) → every adapter (Alex: F3b, F7, F5, F6, F9a): `ingestLead` must be real by end of D4.
- F14b (John, D10) → F5, F6, F9a (Alex): connect wizard before platform connects.
- F11a (Alex, D14) → F10b (John, D15): marking writes the outbox Alex sends.
- Parallel-on-fixtures: F3c builds against `tests/fixtures/whatsapp` while F3b lands (D8–9).

## External milestones (not build work)
- Meta App Review submission: WhatsApp end of D9 (after F3b), lead retrieval end of D12 (after F5).
- LinkedIn, TikTok, Snapchat access requests: D1–5 (no SLA for LinkedIn).
