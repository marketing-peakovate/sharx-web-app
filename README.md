# SHARKX Agency CRM

Two independent projects: `web/` (Next.js UI + BFF) and `api/` (Fastify API + pg-boss worker). Docs, specs and inputs live in `docs/`.

## Install
- Node **26.13.1** (`nvm use`), pnpm 10 (`corepack` or `npm i -g pnpm@10`), Docker Desktop.
- `cd api && pnpm install` and `cd web && pnpm install`
- `cp api/.env.example api/.env.local` and `cp web/.env.example web/.env.local`, then set `SESSION_SECRET` in `web/.env.local` (32+ chars).
- `cd api && docker compose up -d` (Postgres 18 on port 5433, plus `sharkx_test`), then `pnpm db:migrate`.

## Run
- `cd api && pnpm dev` (http://localhost:4000), `pnpm dev:worker` for background jobs
- `cd web && pnpm dev` (http://localhost:3000)

## Test
- In `api/` and in `web/`: `pnpm verify` (typecheck, Biome lint, Vitest; api needs the Docker Postgres)
- `cd web && pnpm build && pnpm test:e2e`: Playwright smoke (first time: `pnpm exec playwright install chromium`)

## Deploy
- Railway services `web`, `api`, `worker` + Postgres; staging auto-deploys from `main`, production is promoted manually.
- Setup steps, variables and secrets: [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md).

## Docs
- Rules for contributors and Claude Code: [CLAUDE.md](CLAUDE.md) · scope: [docs/PRD.md](docs/PRD.md) · design: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · specs: [docs/specs/](docs/specs/)
