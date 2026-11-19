# F10a · Client lead link, routing, portal view
Owner: B (John) · Days 13–14 · Release 2 · Tracker: F10.1, F10.2, F10.3 · PRD: [F10](../PRD.md#f10)

## Goal
Each client opens one secure link, without logging in, and sees only its own leads.

## Acceptance criteria
- [ ] Secure link on the lead-link domain, no login; token 256-bit, stored hashed; Revoke and regenerate invalidates instantly.
- [ ] Portal: KPIs (leads 30 d, MQL rate, SQL rate, waiting for review); tabs Waiting for review/All/MQL/SQL/Not qualified; source filter; expandable row (form answers, campaign, email). List = last 30 days.
- [ ] Portal never exposes notes, chats, owners or other clients.

## Data model / API / job changes
- client_links: generate, revoke + regenerate (`link.manage`); last_opened_at.
- Middleware: leads host serves only `/l/*` and `/api/portal/*`; app host never serves `/l/*`.
- Portal queries run in `withSystem(projectId)` resolved from the token; column allowlist (no owner, notes, chats).
- WhatsApp column shows No chat / Awaiting reply / Replied only.

## Files touched
- B (John): src/modules/client-link/*, src/app/l/[token]/*, middleware host rules (PR reviewed by Alex), messages/en/portal.json

## Dependencies
F2a, F1b.

## Edge cases
- Revoked, malformed or unknown token → same generic page (no hint which).
- Portal language follows the browser, with an EN/AR/FR switcher.
- Test leads never shown.
- Rate limit per IP on token lookups.

## Out of scope
Passcode and expiry (Extra), client logins, Won.

## Test plan
- Token lifecycle: create, open, revoke, regenerate.
- Isolation: token of client A never returns client B rows; forbidden columns absent from responses.
- Host routing tests for both domains.
