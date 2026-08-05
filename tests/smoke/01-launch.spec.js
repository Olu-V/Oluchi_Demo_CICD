const { test, expect } = require('@playwright/test');
const BasePage = require('../../pages/BasePage');

test.describe('Smoke Tests', () => {
  test('Launch Remita website and verify it loads correctly', async ({ page }) => {
    const basePage = new BasePage(page);
    await test.step('Navigate to Remita homepage', async () => {
      await basePage.goto('https://remita.net');
    });

    await test.step('Verify page title', async () => {
      const title = await page.title();
      expect(title).toContain('Remita');
    });

    await test.step('Verify page content loaded', async () => {
      await page.waitForLoadState('networkidle');
      const body = await page.textContent('body');
      expect(body).toContain('Remita');
    });
  });

  test('Verify Sign In page is accessible', async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.goto('https://remita.net/signin');

    await page.waitForSelector('#login_area', { timeout: 15000 });
    const loginAreaVisible = await page.isVisible('#login_area');
    expect(loginAreaVisible).toBe(true);
  });

  test('Verify Registration page is accessible', async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.goto('https://login.remita.net/remita/registration/signup.spa');

    await page.waitForSelector('#personal-select', { timeout: 15000 });
    const personalButtonVisible = await page.isVisible('#personal-select');
    expect(personalButtonVisible).toBe(true);
  });
});
