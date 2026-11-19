import { NextResponse } from 'next/server';
import pkg from '../../../../package.json' with { type: 'json' };
import { apiFetch } from '../../../lib/api/client.ts';
import { getWebEnv } from '../../../lib/env.ts';

// Railway healthcheck for the web service: web is up and can reach the api (which checks the DB).
export const dynamic = 'force-dynamic';

export async function GET() {
  const env = getWebEnv();
  let api: 'ok' | 'error' = 'error';
  let db: 'ok' | 'error' | 'unknown' = 'unknown';
  try {
    const res = await apiFetch('/health');
    const body = (await res.json()) as { checks?: { db?: 'ok' | 'error' } };
    api = res.ok ? 'ok' : 'error';
    db = body.checks?.db ?? 'unknown';
  } catch {
    api = 'error';
  }
  const ok = api === 'ok' && db === 'ok';
  return NextResponse.json(
    {
      status: ok ? 'ok' : 'error',
      service: 'web',
      version: pkg.version,
      commit: env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      appEnv: env.APP_ENV,
      checks: { api, db },
      time: new Date().toISOString(),
    },
    { status: ok ? 200 : 503, headers: { 'cache-control': 'no-store' } },
  );
}
