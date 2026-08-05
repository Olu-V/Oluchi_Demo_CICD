const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = 'https://remita.net/signin';
  }

  async open() {
    await this.goto(this.url);
    await this.page.waitForTimeout(3000);
  }
}

module.exports = LoginPage;
