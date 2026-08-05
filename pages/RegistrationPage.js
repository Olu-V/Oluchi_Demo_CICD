const BasePage = require('./BasePage');

class RegistrationPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = 'https://login.remita.net/remita/registration/signup.spa';

    // Account type selection buttons
    this.personalButton = '#personal-select';
    this.soleSignatoryButton = '#sole-signatory-select';
    this.multiSignatoryButton = '#multi-signatory-select';
    this.governmentButton = '#government-select';

    // Registration form
    this.form = '#registrationForm';
    this.sessionLoader = '#session-loader';
    this.registrationContainer = '#registration-container';

    // Personal details fields
    this.firstNameInput = '#firstName';
    this.lastNameInput = '#surname';
    this.emailInput = '#email';
    this.ninInput = '#nationalIdentification';
    this.phoneNumberInput = '#phoneNumber';
    this.bvnInput = '#bvn';

    // Toggle NIN / Phone
    this.noNinButton = 'button.noNin';

    // Terms and conditions
    this.termsCheckbox = 'input[name="termsAndConditions"]';

    // reCAPTCHA container (Google reCAPTCHA v2 checkbox)
    this.recaptchaContainer = '#captcha-div';

    // Form buttons
    this.proceedButton = 'button.btn-personal, button.btn-register';

    // OTP modal
    this.otpModal = '#otpModal';
    this.otpInput = '#otp';
    this.otpSubmitButton = '#submitOTP';
    this.resendOtpLink = '.resend-otp';

    // Messages
    this.infoMessage = '#info-message';
    this.errorMessage = '#custom-error';
  }

  async goto() {
    await this.page.goto(this.url, { waitUntil: 'networkidle', timeout: 60000 });
    await this.page.waitForTimeout(3000);
    await this.dismissCookieConsent();
  }

  async selectAccountType(type = 'personal') {
    const buttonMap = {
      personal: this.personalButton,
      'sole-signatory': this.soleSignatoryButton,
      'multi-signatory': this.multiSignatoryButton,
      government: this.governmentButton,
    };

    const buttonSelector = buttonMap[type] || this.personalButton;
    await this.page.click(buttonSelector);
    await this.page.waitForSelector(this.registrationContainer, { state: 'visible', timeout: 15000 });
  }

  async fillPersonalDetails(user) {
    await this.fillJS(this.firstNameInput, user.firstName);
    await this.fillJS(this.lastNameInput, user.lastName);
    await this.page.fill(this.emailInput, user.email);
  }

  async enterNin(nin) {
    await this.page.fill(this.ninInput, nin);
  }

  async switchToPhoneNumber() {
    await this.page.click(this.noNinButton);
    await this.page.waitForSelector(this.phoneNumberInput, { state: 'visible' });
  }

  async enterPhoneNumber(phoneNumber) {
    await this.page.fill(this.phoneNumberInput, phoneNumber);
  }

  async enterBvn(bvn) {
    await this.page.fill(this.bvnInput, bvn);
  }

  async acceptTerms() {
    await this.page.check(this.termsCheckbox);
  }

  async clickProceed() {
    await this.page.click(this.proceedButton, { force: true });
  }

  async waitForRecaptcha() {
    return await this.page.evaluate(() => {
      const token = document.querySelector('input[name="g-recaptcha-response"]');
      return token && token.value && token.value.length > 0;
    });
  }

  async enterOtp(otp) {
    await this.page.fill(this.otpInput, otp);
    await this.page.click(this.otpSubmitButton);
  }

  async clickResendOtp() {
    await this.page.click(this.resendOtpLink);
  }

  async waitForOtpModal() {
    await this.page.waitForSelector(this.otpModal, { state: 'visible', timeout: 30000 });
  }

  async isAccountTypeVisible() {
    return await this.page.isVisible(this.personalButton);
  }

  async isRegistrationFormVisible() {
    return await this.page.isVisible(this.form);
  }

  async getErrorMessage() {
    const visible = await this.page.isVisible(this.errorMessage);
    if (visible) {
      return await this.page.textContent(this.errorMessage);
    }
    return null;
  }

  async getInfoMessage() {
    const visible = await this.page.isVisible(this.infoMessage);
    if (visible) {
      return await this.page.textContent(this.infoMessage);
    }
    return null;
  }

  async registerUser(user) {
    await this.selectAccountType('personal');
    await this.fillPersonalDetails(user);
    await this.enterNin(user.nin || '0000000000');
    await this.acceptTerms();
    await this.clickProceed();
  }
}

module.exports = RegistrationPage;
