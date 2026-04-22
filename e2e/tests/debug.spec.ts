import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const fixturesDir = path.join(__dirname, '../fixtures');
const monumentsFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'monuments.json'), 'utf-8'));
const monumentInfoFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'monument-info.json'), 'utf-8'));

test('reproduce issue', async ({ page }) => {
  await page.route('**/_api/heritage**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(monumentsFixture) });
  });
  await page.route('**/_api/heritage_info**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(monumentInfoFixture) });
  });

  await page.goto('/lat/55.7522/lon/37.6155/zoom/16/test-1');

  const canvas = page.locator('.mapboxgl-canvas');
  await expect(canvas).toBeVisible({ timeout: 30000 });

  // Wait for sidebar content
  await page.waitForTimeout(3000);

  const html = await page.content();
  console.log('HAS SECTION:', html.includes('<section'));
  console.log('HAS TEXT:', html.includes('Тестовый собор'));
  console.log('URL:', page.url());

  const section = page.locator('section');
  console.log('SECTION COUNT:', await section.count());
  console.log('SECTION VISIBLE:', await section.isVisible().catch(() => false));
  console.log('SECTION TEXT:', await section.textContent().catch(() => ''));
});
