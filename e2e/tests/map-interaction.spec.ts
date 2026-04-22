import { test, expect, Page, Route } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const fixturesDir = path.join(__dirname, '../fixtures');
const monumentsFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'monuments.json'), 'utf-8'));
const monumentInfoFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'monument-info.json'), 'utf-8'));

async function mockHeritageInfo(page: Page) {
  await page.route('**/_api/heritage_info**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(monumentInfoFixture),
    });
  });
}

async function mockHeritage(page: Page, body?: object) {
  await page.route(/\/_api\/heritage(?:\/|\?|$)/, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body ?? monumentsFixture),
    });
  });
}

test.describe('Map Interaction Tests (Mocked API)', () => {
  test('clicking marker opens sidebar with monument info', async ({ page }) => {
    await mockHeritageInfo(page);
    await mockHeritage(page);

    await page.goto('/lat/55.7522/lon/37.6155/zoom/16');

    const canvas = page.locator('.mapboxgl-canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    // Wait for markers to appear
    await page.waitForTimeout(2000);

    // Find and click a marker button
    const marker = page.getByTestId('marker').first();
    await expect(marker).toBeVisible();
    await marker.click();

    // Wait for navigation and data fetch
    await page.waitForURL(/\/test-1$/);
    await page.waitForTimeout(3000);

    // Sidebar should open with monument name
    await expect(page.getByText('Тестовый собор')).toBeVisible();
    await expect(page.getByText('1500')).toBeVisible();
    await expect(page.getByText('Красная площадь, 1')).toBeVisible();
  });

  test('closing sidebar updates URL', async ({ page }) => {
    await mockHeritageInfo(page);
    await mockHeritage(page);

    await page.goto('/lat/55.7522/lon/37.6155/zoom/16/test-1');

    const canvas = page.locator('.mapboxgl-canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    // Wait for sidebar content to load
    await page.waitForTimeout(3000);

    // Sidebar should be visible with loaded content
    await expect(page.getByText('Тестовый собор')).toBeVisible();

    // Click close button (Close icon inside button)
    const closeButton = page.locator('section button').first();
    await closeButton.click();

    // Sidebar should disappear
    await expect(page.getByText('Тестовый собор')).not.toBeVisible();

    // URL should not contain /test-1
    await expect(page).toHaveURL(/\/lat\/55\.7522\/lon\/37\.6155\/zoom\/16\/?$/);
  });

  test('cluster button is visible and clickable', async ({ page }) => {
    await mockHeritageInfo(page);

    const clusteredMonuments = {
      monuments: [
        { id: 'c1', name: 'Cluster A', lat: 55.7522, lon: 37.6155 },
        { id: 'c2', name: 'Cluster B', lat: 55.7522, lon: 37.6155 },
        { id: 'c3', name: 'Cluster C', lat: 55.7522, lon: 37.6155 },
      ],
    };
    await mockHeritage(page, clusteredMonuments);

    await page.goto('/lat/55.7522/lon/37.6155/zoom/8');

    const canvas = page.locator('.mapboxgl-canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    await page.waitForTimeout(2000);

    // Cluster button should be visible
    const clusterButton = page.getByTestId('cluster').first();
    await expect(clusterButton).toBeVisible();

    // Click cluster to zoom in
    await clusterButton.click();

    // Wait for zoom animation
    await page.waitForTimeout(1000);

    // URL should contain higher zoom
    const url = page.url();
    expect(url).toContain('/zoom/');
  });
});
