import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['exercises/**/tests/**/*.spec.{ts,tsx}'],
    environment: 'node',
    setupFiles: ['./shared/test-utils/setup-react.ts'],
    testTimeout: 1_000,
    hookTimeout: 1_000,
    clearMocks: true,
    restoreMocks: true,
  },
});
