import type { ClientBase } from 'pg';

// HACK: doesn't work with ESM modules
const { runner } = require('node-pg-migrate');

export async function runMigrations(dbClient: ClientBase, table: string, dir: string) {
  await runner({
    dir,
    dbClient: dbClient,
    direction: 'up',
    migrationsTable: table,
    singleTransaction: true,
    count: Infinity,
  });
}
