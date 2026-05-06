import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:    './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries:    process.env.CI ? 2 : 0,
  workers:    process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL:      'http://localhost:5173',
    trace:        'on-first-retry',
    screenshot:   'only-on-failure',
    video:        'off',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Start both servers before E2E tests
  webServer: [
    {
      command: 'npm run dev',
      port:    5173,
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npm run server',
      port:    8765,
      reuseExistingServer: true,
      timeout: 10000,
    },
  ],
});
