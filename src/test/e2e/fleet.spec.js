import { test, expect } from '@playwright/test';

test.describe('Fleet page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fleet');
  });

  test('shows Bin Fleet heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Bin Fleet');
  });

  test('shows 8 unit count', async ({ page }) => {
    await expect(page.getByText('8 units deployed')).toBeVisible();
  });

  test('grid shows all bin IDs', async ({ page }) => {
    for (let i = 1; i <= 8; i++) {
      await expect(page.getByText(`HS-00${i}`).first()).toBeVisible();
    }
  });

  test('search filters bins by name', async ({ page }) => {
    const input = page.getByPlaceholder(/Search/i);
    await input.fill('Valletta');
    await expect(page.getByText('HS-001')).toBeVisible();
    await expect(page.getByText('HS-002')).not.toBeVisible();
  });

  test('search clears on empty query', async ({ page }) => {
    const input = page.getByPlaceholder(/Search/i);
    await input.fill('Valletta');
    await input.fill('');
    // All bins visible again
    await expect(page.getByText('HS-001')).toBeVisible();
    await expect(page.getByText('HS-002')).toBeVisible();
  });

  test('status filter shows only matching bins', async ({ page }) => {
    await page.getByRole('button', { name: 'OFFLINE' }).click();
    // Only offline bins shown
    await expect(page.getByText('HS-006')).toBeVisible();
    await expect(page.getByText('HS-001')).not.toBeVisible();
  });

  test('ALL filter restores all bins', async ({ page }) => {
    await page.getByRole('button', { name: 'OFFLINE' }).click();
    await page.getByRole('button', { name: 'ALL' }).click();
    await expect(page.getByText('HS-001')).toBeVisible();
  });

  test('switches to list view', async ({ page }) => {
    await page.getByRole('button', { name: 'List' }).click();
    // Table element should appear
    await expect(page.locator('table')).toBeVisible();
  });

  test('clicking bin in grid navigates to detail', async ({ page }) => {
    await page.getByText('HS-001').first().click();
    await expect(page).toHaveURL(/\/fleet\/HS-001/);
  });

  test('list view View link navigates to detail', async ({ page }) => {
    await page.getByRole('button', { name: 'List' }).click();
    await page.getByRole('link', { name: 'View' }).first().click();
    await expect(page).toHaveURL(/\/fleet\/HS-/);
  });
});

test.describe('Bin Detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fleet/HS-001');
  });

  test('shows bin name as heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Valletta City Gate');
  });

  test('shows fill level value', async ({ page }) => {
    await expect(page.getByText(/Effective Fill/i)).toBeVisible();
  });

  test('shows status badge', async ({ page }) => {
    await expect(page.getByText(/Online|Full|Warning|Fault|Offline/).first()).toBeVisible();
  });

  test('mini-map is rendered', async ({ page }) => {
    await expect(page.locator('.leaflet-container').last()).toBeVisible({ timeout: 8000 });
  });

  test('quick actions panel is visible', async ({ page }) => {
    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByRole('button', { name: /Request collection/i })).toBeVisible();
  });

  test('back to fleet link works', async ({ page }) => {
    await page.getByText('Back to fleet').click();
    await expect(page).toHaveURL('/fleet');
  });

  test('returns 404-like page for unknown bin', async ({ page }) => {
    await page.goto('/fleet/HS-999');
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
