import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/dashboard', heading: 'Operations Centre' },
  { path: '/fleet',     heading: 'Bin Fleet' },
  { path: '/routes',    heading: 'Route Planner' },
  { path: '/analytics', heading: 'Analytics' },
  { path: '/alerts',    heading: 'Alerts' },
  { path: '/telemetry', heading: 'Telemetry Console' },
];

test.describe('Navigation', () => {
  test('sidebar links navigate to all pages', async ({ page }) => {
    await page.goto('/');
    for (const { path, heading } of PAGES) {
      await page.getByRole('navigation').getByText(new RegExp(heading.split(' ')[0], 'i')).click();
      await expect(page).toHaveURL(path);
      await expect(page.locator('h1')).toContainText(heading.split(' ')[0]);
    }
  });

  test('root redirect goes to /dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/dashboard');
  });

  test('breadcrumb shows correct page name', async ({ page }) => {
    await page.goto('/analytics');
    const breadcrumb = page.locator('header nav');
    await expect(breadcrumb).toContainText('Analytics');
  });

  test('breadcrumb shows Fleet > bin id on detail page', async ({ page }) => {
    await page.goto('/fleet/HS-003');
    const breadcrumb = page.locator('header nav');
    await expect(breadcrumb).toContainText('Fleet');
    await expect(breadcrumb).toContainText('HS-003');
  });
});

test.describe('Alerts page', () => {
  test('shows Alerts heading', async ({ page }) => {
    await page.goto('/alerts');
    await expect(page.locator('h1')).toContainText('Alerts');
  });

  test('alert cards are visible', async ({ page }) => {
    await page.goto('/alerts');
    // At least one alert type badge
    await expect(page.getByText(/OVERFLOW|JAM|BATTERY|OFFLINE/).first()).toBeVisible();
  });

  test('View Unit link navigates to bin detail', async ({ page }) => {
    await page.goto('/alerts');
    await page.getByRole('link', { name: /View Unit/i }).first().click();
    await expect(page).toHaveURL(/\/fleet\/HS-/);
  });
});

test.describe('Analytics page', () => {
  test('shows Recharts SVG charts', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('svg.recharts-surface').first()).toBeVisible({ timeout: 5000 });
  });

  test('KPI cards visible', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.getByText('Avg Fill')).toBeVisible();
    await expect(page.getByText('Uptime')).toBeVisible();
  });
});

test.describe('Telemetry page', () => {
  test('shows Telemetry Console heading', async ({ page }) => {
    await page.goto('/telemetry');
    await expect(page.locator('h1')).toContainText('Telemetry Console');
  });

  test('Pause / Resume button is present', async ({ page }) => {
    await page.goto('/telemetry');
    await expect(page.getByRole('button', { name: /Pause|Resume/i })).toBeVisible();
  });

  test('frame filter buttons are visible', async ({ page }) => {
    await page.goto('/telemetry');
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: /UART→TCP/i })).toBeVisible();
  });
});

test.describe('Route Planner page', () => {
  test('threshold slider is present', async ({ page }) => {
    await page.goto('/routes');
    await expect(page.locator('input[type=range]')).toBeVisible();
  });

  test('Dispatch Route button is present', async ({ page }) => {
    await page.goto('/routes');
    await expect(page.getByRole('button', { name: /Dispatch Route/i })).toBeVisible();
  });
});
