import { defineConfig } from 'drizzle-kit';
import { MIGRATIONS_FOLDER, MIGRATIONS_SCHEMA, MIGRATIONS_TABLE } from './src/db/migrator.ts';
import { getDbEnv } from './src/lib/env.ts';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: `./${MIGRATIONS_FOLDER}`,
  dbCredentials: { url: getDbEnv().DATABASE_URL },
  migrations: { schema: MIGRATIONS_SCHEMA, table: MIGRATIONS_TABLE },
  strict: true,
  verbose: true,
});
