class DashboardPage {
  constructor(page) {
    this.page = page;
    this.url = 'https://remita.net/';

    // Possible dashboard indicators
    this.dashboardIndicators = [
      '.dashboard',
      '#dashboard',
      '[class*="dashboard"]',
      '[class*="home"]',
      '.balance-card',
      '[class*="welcome"]',
    ];

    // Header / navigation elements
    this.userProfile = '.user-profile, .nav-item.dropdown, [class*="user-menu"]';
    this.logoutButton = 'a[href*="logout"], button:has-text("Logout"), a:has-text("Logout")';
    this.navBar = 'nav, .navigation';

    // Common elements visible after login
    this.reportsLink = 'a[href*="report"], a:has-text("Reports")';
    this.paymentsLink = 'a[href*="payment"], a:has-text("Payments")';
    this.transactionsLink = 'a[href*="transaction"], a:has-text("Transactions")';
  }

  async waitForDashboard(timeout = 30000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const currentUrl = this.page.url();
      const isDashboard =
        currentUrl.includes('/dashboard') ||
        currentUrl.includes('/home') ||
        currentUrl !== 'https://remita.net/signin';

      if (isDashboard) {
        return true;
      }
      await this.page.waitForTimeout(1000);
    }
    return false;
  }

  async verifyLoggedIn() {
    await this.page.waitForTimeout(3000);
    const currentUrl = this.page.url();
    const isLoggedIn =
      currentUrl.includes('/dashboard') ||
      currentUrl.includes('/home') ||
      !currentUrl.includes('/signin');

    if (!isLoggedIn) {
      throw new Error('User was not redirected to the dashboard after login.');
    }
    return true;
  }

  async isUserLoggedIn() {
    const currentUrl = this.page.url();
    const loggedOutUrls = ['/signin', '/login', '/signup'];
    const isLoggedOut = loggedOutUrls.some((url) => currentUrl.includes(url));
    return !isLoggedOut;
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async logout() {
    await this.page.waitForTimeout(2000);
    const logoutBtn = this.page.locator(this.logoutButton);
    const isVisible = await logoutBtn.isVisible().catch(() => false);
    if (isVisible) {
      await logoutBtn.click({ force: true });
      await this.page.waitForTimeout(3000);
      return true;
    }
    const profileMenu = this.page.locator(this.userProfile);
    const isProfileVisible = await profileMenu.isVisible().catch(() => false);
    if (isProfileVisible) {
      await profileMenu.click({ force: true });
      await this.page.waitForTimeout(1000);
      await logoutBtn.click({ force: true });
      await this.page.waitForTimeout(3000);
      return true;
    }
    console.log('Logout button or profile menu not found. Attempting navigation to logout URL.');
    await this.page.goto('https://remita.net/logout', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    return false;
  }
}

module.exports = DashboardPage;
