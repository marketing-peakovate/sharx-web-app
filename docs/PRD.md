# PRD · SHARKX Agency CRM

- Authority: SOW (2026-10-16) > Client Requirements > Feature Document > mockup (UI only). Anything not in the SOW is an Extra.
- Window: build 21 days (feature freeze D18, hardening/staging/demo D19–21). UAT, production, rollout D22–28.
- Trace key: **SOW** = SOW §4 module (hours from §8) · **Mockup** = screen in `docs/inputs/sharkx-crm-mockup.html`. Sub-features and status: `docs/specs/STATUS.md`.

## Problem
- SHARKX runs campaigns for aesthetics clinics and SMEs (Abu Dhabi, Dubai, Morocco). Leads sit in Meta, Google, TikTok, Snapchat, LinkedIn, website forms and WhatsApp.
- Follow-up is unmanaged, clients cannot see or rate leads, ad platforms never learn which leads converted.
- Core loop: capture lead → follow up → client qualifies → ad platforms learn.

## Users and roles
| Role | Who | Can |
|---|---|---|
| Admin | SHARKX owner/lead | Everything. Only role for users, roles, audit log, agency settings. Sees all clients |
| Manager (UI: "Account manager") | Runs a set of clients | Create projects; pipeline, automation, link settings; connect integrations; reports. Assigned clients only |
| Agent | Analyst / sales | Leads, chats, tasks, notes, assignment. Assigned clients only |
| Client | Clinic / SME | No login. Secure link: view own leads, mark MQL/SQL/Not qualified (+reason), export if allowed |

- Sign-in: email + password + emailed code. Clients never see notes, chats, owners or other clients.
- Statuses: New, MQL, SQL, Not qualified (reason from an editable list). Pipeline stage is independent of status.

## MVP features (all Must)

### F1
**Foundation and access** · A · SOW: Users and access (12h) · Mockup: Settings → Team and roles (login, code, audit screens new, mockup style)
- Invite by email → single-use set-password link (72 h) → sign in with password + 6-digit emailed code (10 min, 5 tries). Reset by link (1 h).
- Roles per matrix. Manager/Agent read zero rows from other clients via UI, actions, API and polling (isolation suite proves it).
- Every mutation, sign-in event, integration connect/disconnect and client mark writes an audit row. Admin filters by user, action, client, date.
- The api's `/health` reports DB, queue, each integration, last webhook time. The web `/api/health` only reports web + api reachability.
- Failed jobs retry with backoff; exhausted jobs send an alert email.

### F2
**App shell and projects** · B · SOW: Interface, Agency workspace (10h) · Mockup: rail, topbar, Clients home, New project wizard, Agency settings
- SHARKX brand (mockup tokens; assets pending), usable at 360 px.
- EN/AR/FR with full RTL; language saved per user; no hard-coded strings.
- Clients home: per client new today, unreplied, MQL rate, 14-day sparkline, connection dots; client search; add client.
- Create project (name, city, industry, team) → isolated workspace + default pipeline (New, Contacted, Qualified, Visit booked, Won, Lost); creator auto-assigned. Cities: Abu Dhabi, Dubai, Morocco.
- Agency settings: team and roles, language, first-reply target. Per client: IANA time zone, business hours.

### F3
**WhatsApp tracking** · A service + B UI · SOW: WhatsApp tracking (18h) · Mockup: WhatsApp inbox; connect flow (steps 2–3 replaced by QR)
- Connect: analyst starts Embedded Signup; client scans QR in the WhatsApp Business app; several numbers per client; sync % shown.
- History: last 6 months imported once (Meta allows one sync within 24 h of onboarding); groups excluded; interrupted sync resumes; missed window shows "Reconnect needed".
- Both sides tracked live (customer messages and messages sent from the app); duplicate deliveries never duplicate messages.
- Chat from an unknown number creates contact + lead (source WhatsApp); a known number attaches to the contact's open lead.
- Inbox is read-only: tabs Unread/All/Recent, number chips, search, thread, lead details; no send box; media shown as typed placeholder.
- Assign chat/lead; internal notes visible to SHARKX only.
- Disconnect or ~14-day app inactivity shows Needs attention + alert email.

### F4
**Lead engine and contacts** · B · SOW: Lead capture (field mapping), Contacts, Routing (assignment) (10h) · Mockup: Leads, lead drawer, "Check the fields" step
- Every source calls `ingestLead()`; phones normalised to E.164.
- Per-form field mapping (name, phone, email, custom → custom field / notes / ignore).
- Dedupe per client: same phone (else email) merges into the contact's open lead timeline; no open lead → new lead on the same contact.
- Auto-assign round-robin among project members.
- Lead visible ≤10 s after arrival with source, campaign, form answers.
- Leads screen: tabs All/New today/Unreviewed/MQL/SQL/Not qualified; search; source and owner filters; single assign; CSV export of the current filter.
- Lead drawer: qualification, details, answers, timeline. Contacts list + profile (all leads, chats, notes, status changes).
- Test leads (`is_test`) are excluded from reports, exports and conversion feedback.

### F5
**Meta Lead Ads** · A · SOW: Lead capture (8h) · Mockup: Integrations → Meta, connect flow
- Connect via Facebook login: choose Page and lead forms; health shown.
- New lead via webhook → retrieve → ingest ≤30 s; fields mapped per form.
- Tokens encrypted; expiry warned ≥5 days ahead; one-click reconnect.
- Verified with Meta's lead testing tool (dev mode) and fixtures; live on approval.

### F6
**Google Ads and YouTube lead forms** · A · SOW: Lead capture (6h) · Mockup: Integrations → Google
- Connect Google account; choose Ads account and lead forms (Search, YouTube, Demand Gen).
- Lead-form webhook (key-verified) → ingest; fields mapped per form.
- Health and reconnect as F5; fixture-tested, live with real forms.

### F7
**Website forms and CSV import** · A (modals via B's connect wizard) · SOW: Lead capture (4h) · Mockup: website snippet modal, CSV import modal
- One copy-paste snippet; any form posts to `/api/forms/:key`; captures UTM, gclid, fbclid; honeypot, rate limit, origin allowlist.
- CSV: column auto-match + confirm, dedupe on import, summary (created/merged/skipped), ≤10k rows.

### F8
**Pipeline and tasks** · B · SOW: Pipeline and tasks (12h) · Mockup: none (kanban CSS only), design in mockup style
- Custom stages per client (add, rename, reorder, delete; deleting moves leads to a chosen stage).
- Kanban with drag and drop; a stage change writes timeline + audit; stage is independent of the client mark.
- Tasks: create from a lead, assignee, due date, done; "My tasks" list.
- Reminders at due time via bell + email; overdue tasks feed the agency view (F13).

### F9
**TikTok, LinkedIn, Snapchat** · A · SOW: Lead capture (15h) · Mockup: Integrations cards, connect flow
- One adapter interface. Per platform: connect, account/form selection, lead retrieval (webhook or polling), mapping, health, reconnect.
- Each passes its fixture suite. A platform without access shows "Awaiting platform access" and is verified live when access arrives.

### F10
**Client lead link** · B · SOW: Client lead link (10h) · Mockup: Settings → Client lead link; client portal
- Secure link on the lead-link domain, no login; token 256-bit, stored hashed; Revoke and regenerate invalidates instantly.
- Portal: KPIs (leads 30 d, MQL rate, SQL rate, waiting for review); tabs Waiting for review/All/MQL/SQL/Not qualified; source filter; expandable row (form answers, campaign, email). List = last 30 days.
- Client marks MQL/SQL/Not qualified; Not qualified requires a reason (list editable in Settings → Lead qualification); a mark can be changed later; MQL/SQL definitions shown.
- Toggles: client can mark; client can export CSV.
- A mark is one transaction: status, history, audit row, conversion outbox rows.
- Portal never exposes notes, chats, owners or other clients.

### F11
**Conversion feedback** · A · SOW: Conversion feedback (10h) · Mockup: Settings → Conversion feedback
- Mapping table per client (New, MQL, SQL, Not qualified → Meta event / Google event) with on/off toggles.
- Status change → outbox → sent ≤60 s; retries with backoff; one event per platform per change (idempotent event id).
- Meta Conversions API (hashed phone/email, lead id/fbclid; `test_event_code` on staging); Google Data Manager API (gclid / enhanced conversion).
- Event log with state (sent/retrying/failed) and "last event" time; failures alert.
- Test leads and leads with no usable identifier are skipped and logged.

### F12
**Routing and automation** · B · SOW: Routing and automation (5h) · Mockup: none (rule-card CSS only)
- Auto-assignment (round-robin) configurable per client.
- Response-time alert: no reply in 15 min during business hours → notify the account manager (bell + email).
- Simple rules: when (new lead from source, no reply N min, client marks status, unreviewed N h) → then (assign, notify, create task, move stage); enable/disable; run count.
- Business hours per client drive the timers.

### F13
**Reports and agency dashboard** · B · SOW: Reports, Agency workspace (8h) · Mockup: Overview, Reports, Clients home
- Overview KPIs: Leads (30 d), New today, Median first reply, MQL rate, SQL rate; leads per day; leads by source; waiting-for-reply list.
- Reports: 7/30/90 days; funnel Leads → MQL → SQL; performance by source **and** campaign; first-reply time by agent; CSV export.
- Definitions: MQL rate = (MQL+SQL)/leads; SQL rate = SQL/leads; first reply = first customer message → first outbound message.
- Agency view: new leads, unreplied chats, overdue follow-ups, connection health across clients.

### F14
**Integrations hub and live updates** · A backend + B UI · SOW: Integrations hub (8h shared with F2.6) · Mockup: Integrations, Connections, bell
- Four health states (Connected, Needs attention, Broken, Not connected) from token expiry, last data, webhook errors; checked every 5 min.
- Per-client hub + cross-client table (broken first); one-click Reconnect; Send test lead (flagged test); each adapter labelled Live / Fixture-verified / Awaiting access.
- Bell: connection issues, new leads, new messages, task reminders. Polling `/api/events` ≤5 s on inbox and leads, ≤30 s elsewhere.
- Alert emails to the alert inbox for broken connections and job failures (rate-limited, no personal data).

### F15
**Testing, deploy, handover** · A + B · SOW: testing, deployment, handover (14h)
- CI: typecheck, Biome, Vitest (Postgres), audit; runs on every push to `main` (devs run `node scripts/verify.mjs` first). Staging auto-deploys from `main` only after green CI (Railway "Wait for CI"); production promoted manually.
- Tests: isolation + permission suite, webhook signature and idempotency, adapter fixtures, 6 Playwright flows; manual UAT checklist.
- Seed/demo data from the mockup (5 clients, ~64 leads).
- Backups on; restore drill passed before production.
- Handover: runbook, env/secrets list, reconnect guide, team training session.

## UI deltas vs mockup
- **Hide:** Won/Junk (menus, tabs, KPI, funnel, mapping row), Cost per SQL (KPI, column), "SharkX suggests MQL", passcode and expiry, Add lead, bulk bar and checkboxes, starred chats, Ctrl+K, "Remind client on WhatsApp" rule and the unreviewed-reminder setting.
- **Change:** "Reject" → "Not qualified"; WhatsApp connect → QR (Embedded Signup); "Send test lead" creates an `is_test` lead; portal list = last 30 days; Reports add the campaign table, drop Won; first-reply-by-agent from real data; Team 2FA column reads "Email code".
- **New screens (mockup style):** login + code, reset/invite, kanban + stage editor, tasks, contacts, automation rules, business hours, audit log.

## Extras (lowest priority, in order; only after F1–F15 are done and tested)
1. Link passcode and expiry (with attempt lockout)
2. Manual "Add lead"
3. Bulk assign / bulk status
4. Click-to-WhatsApp tag; extra cities (Sharjah, Rabat, Marrakech, Casablanca)
5. Starred chats, Ctrl+K palette, inbox shortcuts
6. Won + Junk statuses (Client Requirements #14 open; adds Won event with value)
7. Email reminder to client for unreviewed leads
8. WhatsApp media download and storage
9. Authenticator-app TOTP
10. Cost per SQL (needs a written change order: ad spend is out of scope)
11. "SharkX suggests MQL" (no rule defined)
12. Offsite database dump

## Cut
- SOW out of scope: calling/IVR; client logins and white-label; sending WhatsApp from the CRM (incl. auto-reply add-on); ad spend and campaign management.
- Not planned: SSO, multi-currency, data-retention tooling, UAE-resident database (deferred).
- SOW §5 stack changes: ARCHITECTURE §10.

## SHARKX inputs needed
| By day | Input | Blocks |
|---|---|---|
| 1 | Meta business verification started, with business documents (legal name, registered address, trade licence, phone, website, DNS-verified domain) | F3, F5, F11 |
| 1 | Named product owner + review contact (3-working-day reviews) | acceptance |
| 1 | Railway Pro account, Conalytic invited as admin | production |
| 1 | Answer on Won status (#14); default = Extra | Extras |
| 3 | Domain + DNS access; addresses for app and lead link | F10, F15 |
| 3 | Brand assets (logo, colours, fonts) | F2 |
| 3 | Resend account in SHARKX's name + sending-domain DNS records | F1 email |
| 3 | Alert inbox address | F14 |
| 3 | Privacy policy and terms URLs + data-deletion instructions on SHARKX's domain | F3, F5, F6, F9 (app reviews, consent screens) |
| 5 | Admin: Facebook Page, Meta ad account + dataset (Pixel) used for conversions; Google Ads (incl. YouTube forms) with conversion-upload access | F5, F6, F11 |
| 5 | Admin: TikTok, LinkedIn, Snapchat ad accounts (not in Client Requirements); LinkedIn legal-entity details + verified Page | F9 |
| 7 | Pilot client: WhatsApp Business app (≥2.24.17, ≥7 days active), owner with phone for QR + history approval; live form or test campaign per platform | F3, F5–F9 |
| 14 | SHARKX reviewers and one pilot client booked for testing on D22–28 | F15 (acceptance, go-live) |
| 18 | Native Arabic and French reviewers | F2.6 |

## Demo success criteria
- Day 21, staging, scripted; each integration labelled Live or Fixture-verified:
  1. Create a client project → default pipeline.
  2. Connect Meta (dev mode) → test lead appears ≤10 s with source, campaign, answers, auto-assigned.
  3. WhatsApp: customer message arrives; a message sent from the Business app appears; a new chat becomes a lead.
  4. Agent moves the lead on the kanban and creates a task; the 15-min no-reply alert fires.
  5. Manager shares the client link; client marks SQL and Not qualified (with reason).
  6. Conversion event reaches Meta test events (Google where access exists) ≤60 s; a failure shows its retry state.
  7. Reports and agency view reflect the marks.
  8. Switch to Arabic: RTL renders.
  9. An agent of client A cannot see client B; the audit log shows the actions.
  10. Health endpoint and hub show all states, incl. a broken connection + alert email.
- Gates: CI green; isolation and security suite pass; no open P1/P2 bugs; seed loaded; restore drill done.
- UAT exit (D22–28): each integration verified live or logged as blocked with a dated dependency entry; milestone reviews signed (3 working days each); production live; training done.
