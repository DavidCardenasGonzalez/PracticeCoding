import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['exercises/**/tests/**/*.spec.ts'],
    environment: 'node',
    testTimeout: 1_000,
    hookTimeout: 1_000,
    clearMocks: true,
    restoreMocks: true,
  },
});
