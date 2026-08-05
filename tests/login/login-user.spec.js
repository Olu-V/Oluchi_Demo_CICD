const { test, expect } = require('@playwright/test');
const SignInPage = require('../../pages/SignInPage');
const DashboardPage = require('../../pages/DashboardPage');
const { generateTestUser } = require('../../utils/testData');

test.describe('User Login Tests', () => {
  test('Login with registered personal account', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await test.step('Navigate to the sign-in page', async () => {
      await signInPage.goto();
      expect(await signInPage.page.isVisible('#login_area')).toBe(true);
    });

    const testUser = generateTestUser();

    await test.step('Fill in personal login credentials', async () => {
      await signInPage.loginAsPersonal(testUser.email, testUser.password);
      // Verify the input values
      const emailValue = await page.inputValue('#personal-div input[formcontrolname="username"]');
      const passwordValue = await page.inputValue('#personal-div input[formcontrolname="password"]');
      expect(emailValue).toBe(testUser.email);
      expect(passwordValue).toBe(testUser.password);
    });

    await test.step('Solve reCAPTCHA and sign in', async () => {
      const recaptchaSolved = await page.evaluate(() => {
        const token = document.querySelector('input[name="g-recaptcha-response"]');
        return token && token.value && token.value.length > 0;
      });

      if (!recaptchaSolved) {
        const waitTime = process.env.HEADLESS === 'false' ? 60000 : 15000;
        console.log(`\n[MANUAL STEP] Please solve the reCAPTCHA checkbox on the login page.`);
        console.log(`Waiting for ${waitTime / 1000} seconds for reCAPTCHA completion...`);
        await page.waitForTimeout(waitTime);
      }

      try {
        await signInPage.clickSignin();
      } catch (e) {
        console.log('Cannot proceed without solving reCAPTCHA. Form filling verified successfully.');
      }
    });

    await test.step('Verify login success', async () => {
      const dashboard = new DashboardPage(page);
      const isLoggedIn = await dashboard.isUserLoggedIn();
      expect(isLoggedIn).toBe(true);
    });
  });

  test('Login with registered corporate account', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await test.step('Navigate to the sign-in page', async () => {
      await signInPage.goto();
    });

    const testUser = generateTestUser();

    await test.step('Fill in corporate login credentials', async () => {
      await signInPage.loginAsCorporate(
        `testuser_${Date.now()}`,
        testUser.password,
        'ORG12345'
      );
      await signInPage.clickSignin();
    });

    await test.step('Verify login attempt', async () => {
      const dashboard = new DashboardPage(page);
      await dashboard.waitForDashboard(10000);
      expect(await dashboard.isUserLoggedIn()).toBe(true);
    });
  });

  test('Navigate from sign-in page to registration page', async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();

    await signInPage.gotoSignup();
    expect(page.url()).toContain('signup.spa');
  });
});
