const { test, expect } = require('@playwright/test');

test.describe('UI smoke', () => {
  test('home loads', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await expect(page.locator('h1')).toContainText('Hungarian Companion');
  });

  test('explore view and open first card', async ({ page }) => {
    await page.goto('http://localhost:8000/#/explore');
    await page.waitForSelector('#search');
    // wait for words to load and for at least one card to appear
    await page.waitForSelector('.card', { timeout: 8000 });
    const first = page.locator('.card').first();
    await first.locator('.card-main').click();
    await page.waitForSelector('.card.expanded .panel', { timeout: 5000 });
    await expect(first).toHaveClass(/expanded/);
  });
});
