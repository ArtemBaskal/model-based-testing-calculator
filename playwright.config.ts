import { PlaywrightTestConfig } from '@playwright/test';

export const config: PlaywrightTestConfig = {
  use: {
    baseURL: 'http://127.0.0.1:5173',
    actionTimeout: 20000,
    headless: !!process.env.HEADLESS,
  },
  testDir: './tests',
  testMatch: '*.test.ts',
  timeout: 150000,
  workers: 1,
};

export default config;
