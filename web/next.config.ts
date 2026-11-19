import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const nextConfig: NextConfig = {
  // Tenant data must never be cached across users (ARCHITECTURE §9).
  cacheComponents: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
