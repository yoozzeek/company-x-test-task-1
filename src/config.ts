import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? `.env.test` : `.env`,
});

export function getConfig() {
  return {
    appPort: Number(process.env.APP_PORT) || 3000,
    appHost: process.env.APP_HOST || 'localhost',
    appName: process.env.APP_NAME || 'api_service',
    jwtSecretKey: process.env.JWT_SECRET_KEY || undefined,
    jwtPrivateKeyPath: process.env.JWT_PRIVATE_KEY_PATH || undefined,
    jwtPublicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || undefined,
    autoMigrate: process.env.AUTO_MIGRATE || false,
    migrationsTable: process.env.MIGRATIONS_TABLE || 'pgmigrations',
    migrationsDir: process.env.MIGRATIONS_DIR || './migrations',
    dbHost: process.env.DATABASE_HOST || '',
    dbPort: Number(process.env.DATABASE_PORT) || 5432,
    dbUser: process.env.DATABASE_USER || '',
    dbPassword: process.env.DATABASE_PASSWORD || '',
    dbName: process.env.DATABASE_NAME || '',
  };
}
