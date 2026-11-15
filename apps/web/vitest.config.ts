import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      'schedulesMfe/App': resolve(import.meta.dirname, './src/test-mocks/schedules-mfe.tsx'),
      'suppliesMfe/App': resolve(import.meta.dirname, './src/test-mocks/supplies-mfe.tsx'),
      'bpaMfe/App': resolve(import.meta.dirname, './src/test-mocks/bpa-mfe.tsx'),
      'analyticsMfe/App': resolve(import.meta.dirname, './src/test-mocks/analytics-mfe.tsx'),
      'recordsMfe/App': resolve(import.meta.dirname, './src/test-mocks/records-mfe.tsx'),
      'templatesMfe/App': resolve(import.meta.dirname, './src/test-mocks/templates-mfe.tsx'),
      'telehealthMfe/App': resolve(import.meta.dirname, './src/test-mocks/telehealth-mfe.tsx'),
      'demoMfe/App': resolve(import.meta.dirname, './src/test-mocks/demo-mfe.tsx'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
