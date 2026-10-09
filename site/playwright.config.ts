import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4322', ...devices['Desktop Chrome'] },
  webServer: {
    // The build runs before Playwright starts (see the "e2e" npm script), so this only serves dist/.
    // --ignore-lock: astro preview refuses to start (and exits) if a background daemon's lock file exists.
    command: 'npm run preview -- --port 4322 --ignore-lock',
    url: 'http://localhost:4322/',
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
