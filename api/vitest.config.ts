import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    // Migrates a fresh schema into TEST_DATABASE_URL before any test (RLS/security suite builds on this).
    globalSetup: ['./tests/setup/global-db.ts'],
    // Code under test (getDbEnv/getPool) must never touch the dev database.
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL ?? '' },
  },
});
