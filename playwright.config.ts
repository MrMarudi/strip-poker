import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://localhost:3005',
    headless: true,
  },
  webServer: {
    command: 'npx next dev --port 3005',
    port: 3005,
    timeout: 60000,
    reuseExistingServer: true,
  },
});
