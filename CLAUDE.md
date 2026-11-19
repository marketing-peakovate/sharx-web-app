# SHARKX Agency CRM

Multi-client CRM for ad agency SHARKX: capture leads → follow up → client marks MQL/SQL/Not qualified via a secure link → results sent to Meta/Google. Contract: SOW 2026-10-16. 21-day build, 2 devs (Alex = A "Pipes", John = B "Product"); Claude Code writes most of the code.

## Read on demand (don't load all)

- `docs/PRD.md`: features F1–F15 with acceptance criteria, Extras, Cut. Read only the F-section you build.
- `docs/ARCHITECTURE.md`: stack, folders, data model/RLS, contracts, auth, integrations, SOW deviations.
- `docs/specs/STATUS.md`: F-ids and sub-features. `docs/CONTACT-SHARKX.md`: client-facing note.
- Specs: `docs/specs/<id>-*.md` (one per spec), `docs/specs/CONTRACTS.md` (frozen shared shapes), `docs/specs/ORDER.md` (build order, days).
- Timeline: docs/plan.html (data in docs/plan-data.js)
- `docs/inputs/` (local only, git-ignored; get it from Vansh): SOW, mockup (UI truth), requirements. Open only to settle a conflict.

## Stack (details: ARCHITECTURE §1)

Two independent projects, each with its own `package.json`, lockfile and `node_modules`: `web/` (frontend: Next.js 16.4 BFF, Cache Components OFF) and `api/` (backend: Fastify 5 + pg-boss worker). `docs/` holds all docs, specs and inputs. Node 26.13.1 · TypeScript 6 strict · Tailwind + Radix · Drizzle + Postgres 18 (RLS) · next-intl · Resend · Biome · Vitest · Playwright. Railway: web, api, worker, Postgres (Europe West).

## Commands (no root package.json: run pnpm inside the app; Node 26.13.1 from .nvmrc)

- Local DB: `cd api && docker compose up -d` (Postgres :5433 + `sharkx_test`)
- **api** (`cd api`): `pnpm dev` (:4000) · `pnpm dev:worker` · `pnpm start` · `pnpm start:worker` · `pnpm db:generate` · `pnpm db:migrate` · `pnpm db:studio` (`db:seed` arrives in F4a)
- **web** (`cd web`): `pnpm dev` (:3000) · `pnpm build` · `pnpm start` · e2e: `pnpm build && pnpm test:e2e` (starts api + web)
- In either app: `pnpm test` (Vitest; api needs the Docker Postgres) · `pnpm typecheck` · `pnpm lint` (Biome; web adds the logical-CSS check) · `pnpm format` · `pnpm check`
- Gate before every push (repo root): `node scripts/verify.mjs` (`--all` = both apps). It runs `pnpm verify` (typecheck + lint + test) in the apps you changed and the contracts sync check; CI repeats it on every push to `main`.

## Layers and ownership

- web (pages, Server Actions, BFF route handlers; no DB) → HTTP via `web/src/lib/api` → api routes → `api/src/modules/<domain>/service.ts` → `api/src/db`. Worker calls the same services. Browser never calls the api.
- Spec paths map: `src/app/api/**` → `api/src/routes`; other `src/app/**`, `src/components/**`, `messages/**` → `web/`; other `src/**` → `api/src/`; `src/contracts` → `api/src/contracts` (web gets a generated copy).
- Imports: relative with explicit `.ts`/`.tsx` extension (api/worker run on Node's native TypeScript); `@/` alias only inside `web`. Erasable syntax only (no enums/namespaces).
- One owner per path. Use another owner's module only through its `index.ts`; change it only after telling them, in its own commit.
- **Dev A "Pipes" (Alex):** `api/src/{db,worker,routes}`, `api/src/lib/*`, api `modules/{auth,audit,webhooks,whatsapp,conversion}`, `modules/integrations/*`, `api/railway*.json`, `api/docker-compose.yml`, CI.
- **Dev B "Product" (John):** all of `web` (pages, components, i18n, messages, BFF client) and api `modules/{leads,contacts,pipeline,tasks,automation,client-link,reports,projects,notifications}`.
- **Shared:** `api/src/contracts` (Zod; owner proposes and tells the other dev before pushing). Never edit `web/src/contracts` (generated): after any change run `node scripts/sync-contracts.mjs`. Also the `api/src/db/schema/index.ts` barrel (append-only).
- Single migration lane: schema lives in `modules/<x>/schema.ts`, migrations only in `api/src/db/migrations`; run `db:generate` only after `git pull --rebase`; push migration commits the same day they are generated; never edit a pushed migration.
- Git: no PRs; small commits pushed straight to `main`, message prefix `<spec-id>: ...` (e.g. `F1a: add session contract`). Before every push: `git pull --rebase`, then `node scripts/verify.mjs` (runs verify in the apps you changed + contracts sync); push only when it passes. Contract changes go in their own `contracts:` commit and you tell the other dev. `main` must always be green: if CI goes red, fix it first.

## Conventions

- Errors: throw `AppError(code, status)` in services; one wrapper per Server Action/route maps it to a translated message or HTTP status. Unexpected: generic message + `error_log` + rate-limited alert email.
- Zod at every boundary (actions, routes, webhooks, env). Read env only via each app's `src/lib/env.ts`.
- Tenant data only via `withTenant()` (web) or `withSystem(projectId)` (worker, webhooks, portal). Every mutation: `can()` check + audit row.
- Webhooks: verify signature → insert raw event (unique key) → return 200 → process via queue.
- UI: Tailwind logical properties only (`ms-`, `ps-`, `start-`, `text-start`). Strings live in `messages/<locale>/<module>.json`; English first, AR/FR batch at the D18 freeze.
- Names: DB snake_case plural tables; TS camelCase; components PascalCase; files kebab-case; UUID ids; UTC `timestamptz`; IANA time zones.
- Biome is the only linter/formatter. Tests beside code (`*.test.ts`); fixtures in `tests/fixtures`.
- Logs: JSON to stdout with request id; never PII.
- Done per push: `node scripts/verify.mjs` passes · `can()` + audit · strings in catalog · RTL checked · no new dependency.

## Never

- No features beyond the spec. Anything not in the PRD is an Extra: ask first, and only after F1–F15 are done.
- No new dependencies without asking.
- No tenant query outside the helpers; no BYPASSRLS; no caching of tenant data (`use cache`, fetch cache, `unstable_cache`).
- No sending WhatsApp messages, ad spend, campaign management, calling, or client logins (SOW out of scope).
- No PII, tokens or message bodies in logs, alerts or error text. Tokens only AES-256-GCM encrypted. No secrets in git.
- No skipping webhook signature checks; no processing before the raw event is stored.
- No physical-direction Tailwind (`ml-`, `pl-`, `left-`, `text-left`); no hard-coded UI strings.
- No edits outside your owned paths, or in `contracts/`, without the other dev.
- No `db:migrate` against production from a laptop; no hand-editing merged migrations.
- No push to `main` before `node scripts/verify.mjs` passes; no force-push. GitHub CI is paused (billing), so that script is the only gate.

## Tracker (tracker/)

- Never edit tracker/index.html or tracker-data.js by hand. Use: node scripts/track.js <ID> --status <s> --pct <n> --note "<max 10 words>"
- Update only: (1) when starting a spec (`now`), (2) at each acceptance-criteria milestone, (3) when a spec is done (pct 100, status done).
- Not after every edit. One command per update. Notes max 10 words.
- Feature IDs come from docs/specs/STATUS.md. Don't invent new IDs; ask first.
- Don't read the tracker files unless asked. Run `node scripts/track.js list` if you need status.
