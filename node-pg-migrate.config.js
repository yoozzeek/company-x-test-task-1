module.exports = {
    migrationsTable: 'pgmigrations',
    direction: 'up',
    dir: 'migrations',
    databaseUrl: process.env.DATABASE_URL,
    migrationFileLanguage: 'sql',
};