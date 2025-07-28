import { afterAll, beforeAll } from 'vitest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

const EXPOSE_PORT = 5432;

let pgContainer: StartedPostgreSqlContainer;

beforeAll(async () => {
  pgContainer = await new PostgreSqlContainer('postgres:latest')
    .withExposedPorts(EXPOSE_PORT)
    .start();

  // set pg test container dynamic host and port
  process.env.DATABASE_HOST = pgContainer.getHost();
  process.env.DATABASE_PORT = pgContainer.getMappedPort(EXPOSE_PORT).toString();
  process.env.DATABASE_USER = pgContainer.getUsername();
  process.env.DATABASE_PASSWORD = pgContainer.getPassword();
  process.env.DATABASE_NAME = pgContainer.getDatabase();
});

afterAll(async () => {
  if (pgContainer) await pgContainer.stop();
});
