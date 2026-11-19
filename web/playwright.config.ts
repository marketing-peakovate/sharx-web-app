import { defineConfig, devices } from '@playwright/test';

// Smoke tests run against production builds of both apps: `pnpm build && pnpm test:e2e` (in web/).
// Ports differ from dev (3000/4000) so a running dev server is never reused by mistake.
const WEB_PORT = 3100;
const API_PORT = 4100;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  use: { baseURL: `http://localhost:${WEB_PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --dir ../api start',
      url: `http://localhost:${API_PORT}/health`,
      env: { PORT: String(API_PORT) },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `pnpm start --port ${WEB_PORT}`,
      url: `http://localhost:${WEB_PORT}/api/health`,
      env: { API_URL: `http://localhost:${API_PORT}` },
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
