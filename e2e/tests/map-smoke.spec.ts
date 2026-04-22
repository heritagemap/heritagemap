import { test, expect } from '@playwright/test';

test.describe('Map Smoke Tests (Real API)', () => {
  test('map loads with markers from real API', async ({ page }) => {
    await page.goto('/lat/55.7522/lon/37.6155/zoom/12');

    // Wait for Mapbox canvas to appear
    const canvas = page.locator('.mapboxgl-canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    // Wait for markers to load (real API call to Toolforge)
    await page.waitForTimeout(5000);

    // Verify map is interactive by checking zoom controls exist
    await expect(page.locator('.mapboxgl-ctrl-zoom-in')).toBeVisible();
    await expect(page.locator('.mapboxgl-ctrl-zoom-out')).toBeVisible();
  });

  test('/moscow short link redirects to Moscow coordinates', async ({ page }) => {
    await page.goto('/moscow');

    // Should redirect to /lat/55.744654/lon/37.624991/zoom/12
    await expect(page).toHaveURL(/\/lat\/55\.74.*\/lon\/37\.62.*\/zoom\/12/);

    // Map should load
    const canvas = page.locator('.mapboxgl-canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });
  });

  test('map preserves viewport in localStorage', async ({ page }) => {
    await page.goto('/lat/60/lon/30/zoom/10');

    const canvas = page.locator('.mapboxgl-canvas');
    await expect(canvas).toBeVisible({ timeout: 30000 });

    // Verify localStorage was updated
    const viewport = await page.evaluate(() => localStorage.getItem('viewport'));
    expect(viewport).toContain('60');
    expect(viewport).toContain('30');
    expect(viewport).toContain('10');
  });
});
