import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // 👈 This line is crucial
    globals: true,
    setupFiles: './src/test/setup.ts', // optional but good for global mocks
  },
  server: {
    port: 4242,
    proxy: {
      // string shorthand
      // with options
      "/api": {
        target: "http://18.118.145.154:6039",
        changeOrigin: true,
      },
    },
  },
   resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
