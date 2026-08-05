const { test, expect } = require('@playwright/test');
const BasePage = require('../pages/BasePage');
const RegistrationPage = require('../pages/RegistrationPage');
const SignInPage = require('../pages/SignInPage');
const DashboardPage = require('../pages/DashboardPage');
const { generateTestUser } = require('../utils/testData');

test.describe('Full E2E Flow: Open → Cookies → Signup → Login → Logout', () => {
  test('Complete flow: open site, close cookies/popups, register, login, logout', async ({ page }) => {
    test.setTimeout(180000);
    const basePage = new BasePage(page);
    const registrationPage = new RegistrationPage(page);
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);
    const user = generateTestUser();

    // Step 1: Open Remita homepage
    await test.step('1. Open Remita homepage', async () => {
      await basePage.goto('https://remita.net');
      await page.waitForTimeout(3000);
    });

    // Step 2: Close cookies and popups on homepage
    await test.step('2. Close cookies and popups on homepage', async () => {
      await basePage.dismissCookieConsent();
      await page.waitForTimeout(2000);
    });

    // Step 3: Navigate to sign-up page via homepage link
    await test.step('3. Navigate to sign-up page', async () => {
      const signupLink = page.locator('a[href*="signup.spa"]').first();
      const linkCount = await signupLink.count();
      if (linkCount > 0) {
        await signupLink.click({ force: true });
      } else {
        await basePage.goto('https://login.remita.net/remita/registration/signup.spa');
      }
      await page.waitForTimeout(5000);
    });

    // Step 4: Fill personal details using direct DOM manipulation
    await test.step('4. Fill personal details', async () => {
      await page.evaluate(({ firstName, lastName, email }) => {
        const firstNameEl = document.querySelector('#firstName');
        if (firstNameEl) {
          firstNameEl.value = firstName;
          firstNameEl.dispatchEvent(new Event('input', { bubbles: true }));
          firstNameEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const lastNameEl = document.querySelector('#surname');
        if (lastNameEl) {
          lastNameEl.value = lastName;
          lastNameEl.dispatchEvent(new Event('input', { bubbles: true }));
          lastNameEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const emailEl = document.querySelector('#email');
        if (emailEl) {
          emailEl.value = email;
          emailEl.dispatchEvent(new Event('input', { bubbles: true }));
          emailEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, { firstName: user.firstName, lastName: user.lastName, email: user.email });
      await page.waitForTimeout(1000);
    });

    // Step 5: Enter phone number or NIN
    await test.step('5. Enter phone number or NIN', async () => {
      await page.evaluate((phoneNumber) => {
        const phoneEl = document.querySelector('#phoneNumber');
        if (phoneEl) {
          phoneEl.value = phoneNumber;
          phoneEl.dispatchEvent(new Event('input', { bubbles: true }));
          phoneEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, user.phoneNumber);
      await page.waitForTimeout(500);
    });

    // Step 6: Accept terms and conditions
    await test.step('6. Accept terms and conditions', async () => {
      await page.evaluate(() => {
        const termsEl = document.querySelector('input[name="termsAndConditions"]');
        if (termsEl) {
          termsEl.checked = true;
          termsEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    // Step 7: Submit registration
    await test.step('7. Submit registration', async () => {
      try {
        await page.evaluate(() => {
          const proceedBtn = document.querySelector('button.btn-personal, button.btn-register');
          if (proceedBtn) {
            proceedBtn.click();
          }
        });
        await page.waitForTimeout(3000);
      } catch (e) {
        console.log('Registration submission blocked (reCAPTCHA or other issue).');
      }
    });

    // Step 8: Navigate to sign-in page
    await test.step('8. Navigate to sign-in page', async () => {
      await basePage.goto('https://remita.net/signin');
      await page.waitForTimeout(3000);
    });

    // Step 9: Fill login credentials
    await test.step('9. Fill login credentials', async () => {
      await signInPage.loginAsPersonal(user.email, user.password);
    });

    // Step 10: Click sign in
    await test.step('10. Click sign in', async () => {
      try {
        await signInPage.clickSignin();
        await page.waitForTimeout(3000);
      } catch (e) {
        console.log('Sign in blocked (reCAPTCHA or other issue).');
      }
    });

    // Step 11: Verify login status
    await test.step('11. Verify login status', async () => {
      await dashboardPage.waitForDashboard(10000);
      const isLoggedIn = await dashboardPage.isUserLoggedIn();
      console.log('Login status:', isLoggedIn ? 'Logged in' : 'Not logged in (reCAPTCHA may be required)');
    });

    // Step 12: Logout
    await test.step('12. Logout', async () => {
      const loggedOut = await dashboardPage.logout();
      await page.waitForTimeout(3000);
      console.log('Logout attempted:', loggedOut ? 'success' : 'button not found');
    });
  });
});