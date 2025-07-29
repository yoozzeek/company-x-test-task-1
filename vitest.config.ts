/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api_service_tests',
    environment: 'node',
    globals: true,
    silent: true,
    include: ['./tests/e2e/**/*.test.ts'],
    setupFiles: ['./tests/utils/setup-postgres.ts'],
    // globalSetup: ['./tests/utils/setup-x.ts'],
    reporters: ['verbose'],
    env: {
      NODE_ENV: 'test',
      APP_PORT: '3000',
      APP_HOST: 'localhost',
      APP_NAME: 'api_service_test',
      JWT_SECRET_KEY: '142ac94e27fc79b82966768514109d70341f3bcf21219df8407f71aa21c71869',
      //JWT_PRIVATE_KEY_PATH=./tests/keys/private.key
      //JWT_PUBLIC_KEY_PATH=./tests/keys/public.key
      AUTO_MIGRATE: 'true',
      MIGRATIONS_TABLE: 'pgmigrations',
      MIGRATIONS_DIR: './migrations',
    },
  },
});
