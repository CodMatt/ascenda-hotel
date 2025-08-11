import { defineConfig } from 'vitest/config';
import path from 'path';

const config = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['config.ts', './tests/support/setup.ts'],
    isolate: true,
    maxConcurrency: 1,
    
    // Run all test files in tests directory
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/support/**', 'node_modules/**'],
    
    // Different timeouts for different test types
    testTimeout: 10000, // 10 seconds default
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});

export default config;