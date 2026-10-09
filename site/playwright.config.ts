import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4321',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
