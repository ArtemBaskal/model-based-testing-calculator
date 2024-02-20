import { PlaywrightTestConfig } from '@playwright/test';

const { HEADLESS, PLAYWRIGHT_SLOW_MO, TEST_ACTIONS } = process.env;

export const config: PlaywrightTestConfig = {
  use: {
    baseURL: 'http://localhost:5173/model-based-testing-calculator/',
    actionTimeout: 20000,
    headless: !!HEADLESS,
    launchOptions: {
      slowMo: parseInt(PLAYWRIGHT_SLOW_MO || '0'),
    },
  },
  testDir: './tests',
  testMatch: TEST_ACTIONS ? 'actions.test.ts' : '*.test.ts',
  timeout: 150000,
  workers: PLAYWRIGHT_SLOW_MO ? 1 : 4,
};

export default config;
