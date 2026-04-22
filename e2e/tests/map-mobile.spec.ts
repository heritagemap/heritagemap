import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const fixturesDir = path.join(__dirname, '../fixtures');
const monumentsFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'monuments.json'), 'utf-8'));
const monumentInfoFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'monument-info.json'), 'utf-8'));

test.describe('Map Mobile Tests (Mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    await page.route(/\/_api\/heritage(?:\/|\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(monumentsFixture),
      });
    });

    await page.route('**/_api/heritage_info*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(monumentInfoFixture),
      });
    });
  });

  test('sidebar opens and covers full width on mobile', async ({ page }) => {
    await page.goto('/lat/55.7522/lon/37.6155/zoom/16/test-1');

    const canvas = page.locator('.mapboxgl-canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    // Sidebar should be visible
    const sidebar = page.locator('section');
    await expect(sidebar).toBeVisible();

    // Check sidebar width is full viewport on mobile
    const sidebarWidth = await sidebar.evaluate((el) => (el as HTMLElement).offsetWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(sidebarWidth).toBeLessThanOrEqual(viewportWidth);
    expect(sidebarWidth).toBeGreaterThan(300);
  });

  test('touch scroll works on sidebar content', async ({ page }) => {
    await page.goto('/lat/55.7522/lon/37.6155/zoom/16/test-1');

    const canvas = page.locator('.mapboxgl-canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    const sidebar = page.locator('section');
    await expect(sidebar).toBeVisible();

    // Verify sidebar spans most of viewport height
    const sidebarHeight = await sidebar.evaluate((el) => (el as HTMLElement).offsetHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    expect(sidebarHeight).toBeGreaterThanOrEqual(viewportHeight * 0.9);
  });

  test('closing sidebar on mobile removes it from view', async ({ page }) => {
    await page.goto('/lat/55.7522/lon/37.6155/zoom/16/test-1');

    const canvas = page.locator('.mapboxgl-canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    await expect(page.getByText('Тестовый собор')).toBeVisible();

    const closeButton = page.locator('section button').first();
    await closeButton.click();

    await expect(page.getByText('Тестовый собор')).not.toBeVisible();
  });
});
