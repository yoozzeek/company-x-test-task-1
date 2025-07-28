/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api_service_tests',
    environment: 'node',
    globals: true,
    include: ['./tests/e2e/**/*.test.ts'],
    setupFiles: ['./tests/utils/setup-postgres-with-env.js'],
  },
});
