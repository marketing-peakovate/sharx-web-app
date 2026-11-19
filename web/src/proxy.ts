// Next.js 16 "proxy" (formerly middleware): locale routing for every page; /api is excluded.
// F10a adds the leads-host rules here.
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing.ts';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
