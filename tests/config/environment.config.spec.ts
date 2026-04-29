import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as z from 'zod';

import type { EnvironmentConfig } from '@config/environment.schema';

interface EnvironmentConfigModule {
  environmentConfig: EnvironmentConfig;
}

const validEnvironment: Record<string, string> = {
  CI: 'false',
  DEV_API_BASE_URL: 'https://dev-api.example.com',
  DEV_BASE_URL: 'https://dev.example.com',
  LOCAL_API_BASE_URL: 'http://localhost:3001',
  LOCAL_BASE_URL: 'http://localhost:3000',
  PLAYWRIGHT_RECORD: 'false',
  PROD_API_BASE_URL: 'https://api.example.com',
  PROD_BASE_URL: 'https://example.com',
};

describe('environment.config.ts', () => {
  beforeEach(() => {
    vi.resetModules();

    for (const [key, value] of Object.entries(validEnvironment)) {
      vi.stubEnv(key, value);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  describe('module initialization', () => {
    describe('positive', () => {
      it('exports parsed environment when validation succeeds', async () => {
        const { environmentConfig } = await vi.importActual<EnvironmentConfigModule>('../../src/config/environment.config');

        expect(environmentConfig).toStrictEqual({
          CI: false,
          DEV_API_BASE_URL: 'https://dev-api.example.com',
          DEV_BASE_URL: 'https://dev.example.com',
          LOCAL_API_BASE_URL: 'http://localhost:3001',
          LOCAL_BASE_URL: 'http://localhost:3000',
          PLAYWRIGHT_RECORD: false,
          PROD_API_BASE_URL: 'https://api.example.com',
          PROD_BASE_URL: 'https://example.com',
        } satisfies EnvironmentConfig);
      });
    });

    describe('negative', () => {
      it('throws ZodError when an env var fails validation', async () => {
        vi.stubEnv('LOCAL_BASE_URL', 'not-a-url');

        await expect(vi.importActual<EnvironmentConfigModule>('../../src/config/environment.config')).rejects.toBeInstanceOf(z.ZodError);
      });
    });
  });
});
