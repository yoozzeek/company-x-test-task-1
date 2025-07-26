import dotenv from 'dotenv';
dotenv.config();

export const config = {
  appPort: Number(process.env.APP_PORT) || 3000,
  appHost: process.env.APP_HOST || 'localhost',
  appName: process.env.APP_NAME || 'api_service',
  jwtPrivateKeyPath: process.env.JWT_PRIVATE_KEY_PATH || '',
  jwtPublicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || '',
  autoMigrate: process.env.AUTO_MIGRATE || false,
  migrationsTable: process.env.MIGRATIONS_TABLE || 'pgmigrations',
  migrationsDir: process.env.MIGRATIONS_DIR || './migrations',
  dbHost: process.env.DATABASE_HOST || '',
  dbUser: process.env.DATABASE_USER || '',
  dbPassword: process.env.DATABASE_PASSWORD || '',
  dbName: process.env.DATABASE_NAME || '',
};
