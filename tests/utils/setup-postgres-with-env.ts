import { afterAll, beforeAll } from 'vitest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import fs from 'node:fs';

const EXPOSE_PORT = 5432;

let pgContainer: StartedPostgreSqlContainer;

beforeAll(async () => {
  pgContainer = await new PostgreSqlContainer('postgres:latest')
    .withExposedPorts(EXPOSE_PORT)
    .start();

  process.env.NODE_ENV = 'test';
  process.env.DATABASE_HOST = pgContainer.getHost();
  process.env.DATABASE_PORT = pgContainer.getMappedPort(EXPOSE_PORT).toString();
  process.env.DATABASE_USER = pgContainer.getUsername();
  process.env.DATABASE_PASSWORD = pgContainer.getPassword();
  process.env.DATABASE_NAME = pgContainer.getDatabase();

  fs.writeFileSync(
    './.env.test',
    `
APP_PORT=3000
APP_HOST=localhost
APP_NAME=api_service_1
JWT_SECRET_KEY=142ac94e27fc79b82966768514109d70341f3bcf21219df8407f71aa21c71869
#JWT_PRIVATE_KEY_PATH=./test/keys/private.key
#JWT_PUBLIC_KEY_PATH=./test/keys/public.key
AUTO_MIGRATE=true
MIGRATIONS_TABLE=pgmigrations
MIGRATIONS_DIR=./migrations
#OTEL_COLLECTOR_ENDPOINT=http://localhost:4317
  `
  );
});

afterAll(async () => {
  if (pgContainer) await pgContainer.stop();
});
