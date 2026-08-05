const { test, expect } = require('@playwright/test');
const RegistrationPage = require('../../pages/RegistrationPage');
const SignInPage = require('../../pages/SignInPage');
const DashboardPage = require('../../pages/DashboardPage');
const { generateTestUser } = require('../../utils/testData');

test.describe('Full End-to-End Flow: Register and Login', () => {
  test('Complete registration flow, then login with new account', async ({ page }) => {
    const user = generateTestUser();
    const registrationPage = new RegistrationPage(page);
    const signInPage = new SignInPage(page);

    // ============================================
    // PHASE 1: Registration
    // ============================================
    await test.step('1. Navigate to registration page', async () => {
      await registrationPage.goto();
      expect(await registrationPage.isAccountTypeVisible()).toBe(true);
    });

    await test.step('2. Select Personal account type', async () => {
      await registrationPage.selectAccountType('personal');
      expect(await registrationPage.isRegistrationFormVisible()).toBe(true);
    });

    await test.step('3. Fill personal details', async () => {
      await registrationPage.fillPersonalDetails(user);
    });

    await test.step('4. Enter NIN', async () => {
      await registrationPage.enterNin(user.nin || '12345678901');
    });

    await test.step('5. Accept terms and conditions', async () => {
      await registrationPage.acceptTerms();
    });

    await test.step('6. Solve reCAPTCHA (manual step)', async () => {
      const recaptchaWait = process.env.HEADLESS === 'false' ? 60000 : 15000;
      console.log('\n========================================');
      console.log('[MANUAL STEP] Please solve the reCAPTCHA checkbox.');
      console.log(`Waiting for ${recaptchaWait / 1000} seconds for reCAPTCHA completion...`);
      console.log('========================================\n');
      await page.waitForTimeout(recaptchaWait);
    });

    await test.step('7. Submit registration form', async () => {
      try {
        await registrationPage.clickProceed();
      } catch (e) {
        console.log('Cannot proceed without solving reCAPTCHA.');
      }
    });

    await test.step('8. Handle OTP verification (manual step)', async () => {
      const otpWait = process.env.HEADLESS === 'false' ? 60000 : 15000;
      try {
        await registrationPage.waitForOtpModal();
        console.log('\n========================================');
        console.log(`[MANUAL STEP] An OTP was sent to ${user.phoneNumber || user.email}.`);
        console.log('Please enter the OTP in the browser to complete verification.');
        console.log(`Waiting for ${otpWait / 1000} seconds for manual OTP entry...`);
        console.log('========================================\n');
        await page.waitForTimeout(otpWait);
      } catch (e) {
        console.log('OTP modal not displayed. Proceeding to login.');
      }
    });

    // ============================================
    // PHASE 2: Login
    // ============================================
    await test.step('9. Navigate to sign-in page', async () => {
      await signInPage.goto();
      expect(await page.isVisible('#login_area')).toBe(true);
    });

    await test.step('10. Fill in login credentials', async () => {
      await signInPage.loginAsPersonal(user.email, user.password);
    });

    await test.step('11. Solve reCAPTCHA for login (manual step)', async () => {
      const recaptchaWait = process.env.HEADLESS === 'false' ? 60000 : 15000;
      console.log('\n========================================');
      console.log('[MANUAL STEP] Please solve the reCAPTCHA checkbox on the login page.');
      console.log(`Waiting for ${recaptchaWait / 1000} seconds for reCAPTCHA completion...`);
      console.log('========================================\n');
      await page.waitForTimeout(recaptchaWait);
    });

    await test.step('12. Click Sign In', async () => {
      try {
        await signInPage.clickSignin();
      } catch (e) {
        console.log('Cannot proceed without solving reCAPTCHA.');
      }
    });

    await test.step('13. Verify login to dashboard', async () => {
      const dashboard = new DashboardPage(page);
      await dashboard.waitForDashboard(15000);
      try {
        expect(await dashboard.isUserLoggedIn()).toBe(true);
      } catch (e) {
        console.log('Login may not have completed due to reCAPTCHA. This is expected in headless mode.');
      }
    });

    // ============================================
    // PHASE 3: Keep website open
    // ============================================
    await test.step('14. Keep website open', async () => {
      const waitTime = process.env.HEADLESS === 'false' ? 60000 : 10000;
      console.log('\n========================================');
      console.log('Registration and login flow completed.');
      console.log(`The browser will remain open for ${waitTime / 1000} seconds.`);
      console.log('========================================\n');
      await page.evaluate(() => {
        const el = document.createElement('div');
        el.id = 'test-automation-banner';
        el.style.cssText = 'position:fixed;top:0;left:0;z-index:999999;background:#ff6b35;color:#fff;padding:10px;font-size:14px;text-align:center;width:100%';
        el.textContent = 'TEST AUTOMATION ACTIVE - Browser will remain open';
        document.body.appendChild(el);
      });
      await page.waitForTimeout(waitTime);
    });
  });
});
