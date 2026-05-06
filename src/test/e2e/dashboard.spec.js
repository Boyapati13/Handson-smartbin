import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('page title shows Operations Centre', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Operations Centre');
  });

  test('all 4 KPI cards are visible', async ({ page }) => {
    const kpis = ['Avg Fill Level', 'Need Collection', 'Critical Issues', 'Fleet Uptime'];
    for (const kpi of kpis) {
      await expect(page.getByText(kpi)).toBeVisible();
    }
  });

  test('map renders within the bin network card', async ({ page }) => {
    await expect(page.getByText('Bin Network')).toBeVisible();
    // Leaflet map container
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 8000 });
  });

  test('all 8 bin gauge cards are visible', async ({ page }) => {
    for (let i = 1; i <= 8; i++) {
      const id = `HS-00${i}`;
      await expect(page.getByText(id)).toBeVisible();
    }
  });

  test('Dispatch Route button navigates to routes page', async ({ page }) => {
    await page.getByRole('link', { name: /Dispatch Route/i }).click();
    await expect(page).toHaveURL('/routes');
  });

  test('clicking a gauge card navigates to bin detail', async ({ page }) => {
    await page.getByText('HS-001').first().click();
    await expect(page).toHaveURL(/\/fleet\/HS-001/);
  });

  test('active alerts sidebar section loads', async ({ page }) => {
    await expect(page.getByText('Active Alerts')).toBeVisible();
  });

  test('collection queue sidebar loads', async ({ page }) => {
    await expect(page.getByText('Collection Queue')).toBeVisible();
  });

  test('fill trend chart is visible', async ({ page }) => {
    await expect(page.getByText('Fill Trend')).toBeVisible();
    // Recharts renders an SVG
    await expect(page.locator('svg.recharts-surface').first()).toBeVisible({ timeout: 5000 });
  });

  test('topbar shows connection status', async ({ page }) => {
    // Either LIVE or OFFLINE should appear in topbar
    const topbar = page.locator('header');
    await expect(topbar.getByText(/LIVE|OFFLINE/)).toBeVisible({ timeout: 8000 });
  });
});
