import type { PlaywrightTestConfig } from 'playwright/types/test';

export const videoConfig: PlaywrightTestConfig['use'] = {
  video: 'on',
  launchOptions: {
    slowMo: 300,
  },
};
