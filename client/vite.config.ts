import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // 👈 This line is crucial
    globals: true,
    setupFiles: './src/test/setup.ts', // optional but good for global mocks
  }
})
