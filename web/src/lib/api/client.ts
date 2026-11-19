import { getWebEnv } from '../env.ts';

// BFF → backend calls. Server-side only (Server Components, Server Actions, route handlers).
// F1c adds the user's session token to every request; the browser never calls api directly.
export async function apiFetch(path: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 3000, ...rest } = init;
  return fetch(new URL(path, getWebEnv().API_URL), {
    ...rest,
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });
}
