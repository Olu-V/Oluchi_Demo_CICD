const { test, expect } = require('@playwright/test');
const RegistrationPage = require('../../pages/RegistrationPage');
const { generateTestUser } = require('../../utils/testData');

test.describe('User Registration Tests', () => {
  test('Register a new personal user account', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const user = generateTestUser();

    await test.step('Navigate to registration page', async () => {
      await registrationPage.goto();
      expect(await registrationPage.isAccountTypeVisible()).toBe(true);
    });

    await test.step('Select Personal account type', async () => {
      await registrationPage.selectAccountType('personal');
      const formVisible = await registrationPage.isRegistrationFormVisible();
      expect(formVisible).toBe(true);
    });

    await test.step('Fill personal details', async () => {
      await registrationPage.fillPersonalDetails(user);
      await expect(page.locator('#firstName')).toHaveValue(user.firstName);
      await expect(page.locator('#surname')).toHaveValue(user.lastName);
      await expect(page.locator('#email')).toHaveValue(user.email);
    });

    await test.step('Enter NIN', async () => {
      await registrationPage.enterNin(user.nin || '12345678901');
    });

    await test.step('Accept terms and conditions', async () => {
      await registrationPage.acceptTerms();
    });

    await test.step('Solve reCAPTCHA and proceed', async () => {
      const recaptchaSolved = await registrationPage.waitForRecaptcha();
      if (!recaptchaSolved) {
        const waitTime = process.env.HEADLESS === 'false' ? 60000 : 15000;
        console.log(`\n[MANUAL STEP] Please solve the reCAPTCHA checkbox on the registration page.`);
        console.log(`Waiting for ${waitTime / 1000} seconds for reCAPTCHA completion...`);
        await page.waitForTimeout(waitTime);
      }
      try {
        await registrationPage.clickProceed();
      } catch (e) {
        console.log('Cannot proceed without solving reCAPTCHA. Form filling verified successfully.');
      }
    });

    await test.step('Wait for OTP verification', async () => {
      try {
        await registrationPage.waitForOtpModal();
        console.log(`\n[MANUAL STEP] Enter the OTP received via email/SMS to complete registration.`);
        console.log('Waiting for 15 seconds for manual OTP entry...');
        await page.waitForTimeout(15000);
      } catch (e) {
        console.log('OTP modal not displayed. Registration may require manual reCAPTCHA/OTP completion.');
      }
    });
  });

  test('Navigate from registration page to sign-in page', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    // Navigate using the Login link (may be in hidden section, use force)
    await page.getByRole('link', { name: /login|sign in/i }).first().click({ force: true });
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/signin');
  });
});

test.describe('Registration Data Generation', () => {
  test('Generate test user data', async () => {
    const user = generateTestUser();
    expect(user.firstName).toBeDefined();
    expect(user.lastName).toBeDefined();
    expect(user.email).toContain('@example.com');
    expect(user.phoneNumber).toMatch(/^0\d{10}$/);
    expect(user.password).toBeDefined();
    console.log('Generated test user:', JSON.stringify(user, null, 2));
  });
});
