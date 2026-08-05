# Remita Test Automation Framework

A Playwright-based end-to-end test automation framework for the Remita payment platform (https://remita.net).

## Features

- **Page Object Model** architecture for maintainable, reusable test code
- **Test data generation** with random user credentials
- **Smoke tests** for launch and page accessibility verification
- **Registration tests** for new user account creation
- **Login tests** for authentication (Personal & Corporate)
- **Full E2E flow** combining registration and login in a single test

## Project Structure

```
remita-test-automation/
├── playwright.config.js       # Playwright configuration
├── package.json               # Node.js dependencies and scripts
├── .env                       # Environment variables (not committed)
├── .env.example               # Environment variables template
├── AGENTS.md                  # Project commands reference
├── utils/
│   └── testData.js            # Random test user data generator
├── pages/
│   ├── BasePage.js            # Common page object methods
│   ├── SignInPage.js          # Sign-in page object (Personal/Corporate)
│   ├── RegistrationPage.js    # Registration page object
│   └── DashboardPage.js       # Post-login dashboard page object
├── tests/
│   ├── smoke/
│   │   └── 01-launch.spec.js  # Website launch and accessibility tests
│   ├── register/
│   │   └── register-user.spec.js # User registration tests
│   ├── login/
│   │   └── login-user.spec.js # User login tests
│   └── full-flow/
│       └── register-and-login.spec.js # Complete E2E flow
├── test-results/              # Test results (generated)
└── playwright-report/         # HTML reports (generated)
```

## Prerequisites

- Node.js v24+
- npm or yarn

## Installation

```bash
npm install
npx playwright install chromium
```

## Running Tests

### All tests (headless)
```bash
npm test
```

### All tests (headed - browser visible)
```bash
npm run test:headed
```

### Specific test suites
```bash
npm run test:smoke         # Launch and page accessibility tests
npm run test:register      # Registration tests
npm run test:login         # Login tests
npm run test:full-flow     # Complete E2E flow (register + login)
```

### Debug and UI mode
```bash
npm run test:debug         # Debug mode with step-through
npm run test:ui            # Interactive UI mode
```

## Configuration

Copy the environment template and customize:

```bash
cp .env.example .env
```

Key environment variables:

| Variable        | Description                              | Default            |
|-----------------|------------------------------------------|--------------------|
| `HEADLESS`      | Run browser in headless mode             | `false`            |
| `BASE_URL`      | Application base URL                     | `https://remita.net` |
| `TEST_EMAIL`    | Pre-registered test user email           | auto-generated     |
| `TEST_PASSWORD` | Pre-registered test user password          | auto-generated     |

## Manual Interaction Notes

- **reCAPTCHA**: Google reCAPTCHA v2 is present on both registration and login forms. Tests will pause and wait for manual reCAPTCHA completion (30-60 seconds timeout).
- **OTP Verification**: After registration, an OTP is sent to the registered phone/email. The full-flow test includes a wait step for manual OTP entry.
- **BVN Verification**: New accounts may require BVN (Bank Verification Number) verification through NIBSS, which requires manual interaction.
