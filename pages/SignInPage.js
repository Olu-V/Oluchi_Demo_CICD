const BasePage = require('./BasePage');

class SignInPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/signin';

    // Tab navigation
    this.personalTab = 'ul.tab-group li:nth-child(1)';
    this.corporateTab = 'ul.tab-group li:nth-child(2)';

    // Forms
    this.personalForm = '#personal-div';
    this.corporateForm = '#corporate-div';

    // Personal login fields
    this.personalEmailInput = '#personal-div input[formcontrolname="username"]';
    this.personalPasswordInput = '#personal-div input[formcontrolname="password"]';
    this.personalSigninButton = '#personal-div button.btn-remita, #personal-div button[type="submit"]';
    this.personalRecaptcha = '#p-login-recaptcha';

    // Corporate login fields
    this.corporateUsernameInput = '#corporate-div input[formcontrolname="username"]';
    this.corporatePasswordInput = '#corporate-div input[formcontrolname="password"]';
    this.corporateOrgIdInput = '#corporate-div input[formcontrolname="organizationId"]';
    this.corporateSigninButton = '#corporate-div button.btn-remita, #corporate-div button[type="submit"]';
    this.corporateRecaptcha = '#c-login-recaptcha';

    // Common elements
    this.forgotPasswordLink = 'a[href*="passwordreset"]';
    this.signUpLink = 'a[href*="signup.spa"]';
  }

  async goto() {
    await this.page.goto(this.url, { waitUntil: 'networkidle', timeout: 60000 });
    await this.page.waitForSelector('app-root', { timeout: 30000 });
    await this.dismissCookieConsent();
    await this.page.waitForSelector('#login_area', { timeout: 30000, state: 'attached' });
    await this.page.waitForTimeout(3000);
  }

  async selectPersonalTab() {
    await this.page.waitForSelector(this.personalTab, { timeout: 15000 });
    await this.page.click(this.personalTab, { force: true });
  }

  async selectCorporateTab() {
    await this.page.waitForSelector(this.corporateTab, { timeout: 15000 });
    await this.page.click(this.corporateTab, { force: true });
  }

  async loginAsPersonal(email, password) {
    await this.selectPersonalTab();
    await this.page.fill(this.personalEmailInput, email);
    await this.page.fill(this.personalPasswordInput, password);
    console.log('reCAPTCHA detected on personal login. Please solve the reCAPTCHA in the browser.');
    await this.page.waitForTimeout(5000);
  }

  async loginAsCorporate(username, password, organizationId) {
    await this.selectCorporateTab();
    await this.page.fill(this.corporateUsernameInput, username);
    await this.page.fill(this.corporatePasswordInput, password);
    await this.page.fill(this.corporateOrgIdInput, organizationId);
    console.log('reCAPTCHA detected on corporate login. Please solve the reCAPTCHA in the browser.');
    await this.page.waitForTimeout(5000);
  }

  async clickSignin() {
    const signinButton = await this.page.$('#personal-div button.btn-remita, #corporate-div button.btn-remita');
    if (signinButton) {
      await signinButton.click({ force: true });
    }
  }

  async gotoSignup() {
    await this.dismissCookieConsent();
    await this.page.click(this.signUpLink, { force: true, timeout: 15000 });
    await this.page.waitForLoadState('networkidle');
  }

  async gotoForgotPassword() {
    await this.page.click(this.forgotPasswordLink);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForRecaptchaSolved() {
    return await this.page.evaluate(() => {
      const personalToken = document.querySelector('input[name="g-recaptcha-response"]');
      return personalToken && personalToken.value && personalToken.value.length > 0;
    });
  }
}

module.exports = SignInPage;
