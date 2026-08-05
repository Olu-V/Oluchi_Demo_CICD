class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(url) {
    await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  }

  async waitForElement(selector, options = {}) {
    const opts = { timeout: 30000, state: 'visible', ...options };
    await this.page.waitForSelector(selector, opts);
  }

  async click(selector, options = {}) {
    await this.waitForElement(selector, { state: 'visible' });
    await this.page.click(selector, options);
  }

  async fill(selector, text) {
    await this.waitForElement(selector, { state: 'visible' });
    await this.page.fill(selector, text);
  }

  async fillJS(selector, text) {
    await this.waitForElement(selector, { state: 'visible' });
    await this.page.evaluate(({ sel, val }) => {
      const el = document.querySelector(sel);
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, { sel: selector, val: text });
  }

  async dismissCookieConsent() {
    const cookieSelectors = [
      '#cookie-consent-overlay',
      '.cc-window',
      '#cookieconsent',
      '[id*="cookie"]',
      'button[id*="accept"]',
      'button:has-text("Accept")',
      'a:has-text("Accept")',
      'button:has-text("Accept All")',
      '.cc-btn',
      '#cc-allow',
    ];

    for (const selector of cookieSelectors) {
      try {
        const elements = await this.page.$$(selector);
        for (const el of elements) {
          try {
            await el.click({ force: true, timeout: 3000 });
          } catch (e) {
            // Try removing the element via JS
            await this.page.evaluate((sel) => {
              const els = document.querySelectorAll(sel);
              els.forEach(e => e.remove());
            }, selector);
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    await this.page.waitForTimeout(1000);
  }

  async getText(selector) {
    await this.waitForElement(selector, { state: 'visible' });
    return await this.page.textContent(selector);
  }

  async isVisible(selector) {
    return await this.page.isVisible(selector);
  }

  async isHidden(selector) {
    return await this.page.isHidden(selector);
  }

  async waitForUrl(url, options = {}) {
    await this.page.waitForURL(url, { timeout: 30000, ...options });
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  async handleRecaptcha(recaptchaSelector, timeoutMs = 120000) {
    console.log('reCAPTCHA detected. Please solve the reCAPTCHA in the browser.');
    const startTime = Date.now();
    const checkInterval = 2000;
    let solved = false;

    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await this.page.evaluate((selector) => {
          const recaptchaDiv = document.querySelector(selector);
          if (!recaptchaDiv) return { exists: false };
          const iframe = recaptchaDiv.querySelector('iframe');
          if (iframe) {
            return { exists: true, iframe: iframe.src || null };
          }
          const tokenInput = document.querySelector('input[name="g-recaptcha-response"]');
          return { exists: true, token: tokenInput ? tokenInput.value : null };
        }, recaptchaSelector);

        if (response.token && response.token.length > 0) {
          solved = true;
          break;
        }
      } catch (e) {
        // Continue checking
      }

      await this.page.waitForTimeout(checkInterval);
    }

    if (!solved) {
      console.warn('reCAPTCHA was not solved within the timeout. Proceeding anyway.');
    }

    return solved;
  }

  async waitForNetworkIdle(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }
}

module.exports = BasePage;
