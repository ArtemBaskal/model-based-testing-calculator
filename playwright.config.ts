import { PlaywrightTestConfig } from '@playwright/test';

const { HEADLESS, PLAYWRIGHT_SLOW_MO } = process.env;

export const config: PlaywrightTestConfig = {
  use: {
    baseURL: 'http://127.0.0.1:5173',
    actionTimeout: 20000,
    headless: !!HEADLESS,
    launchOptions: {
      slowMo: parseInt(PLAYWRIGHT_SLOW_MO || '0'),
    },
  },
  testDir: './tests',
  testMatch: '*.test.ts',
  timeout: 150000,
  workers: PLAYWRIGHT_SLOW_MO ? 1 : 4,
};

export default config;
