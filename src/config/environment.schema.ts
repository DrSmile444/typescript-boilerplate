import * as z from 'zod';

const boolEnvironment = () =>
  z
    .string()
    .trim()
    .optional()
    .transform((environmentValue) => environmentValue === 'true');

export const environmentSchema = z.object({
  CI: boolEnvironment().meta({ description: 'Whether running in CI', example: '', type: 'boolean' }),
  DEV_API_BASE_URL: z
    .url()
    .default('https://dev.api.example.com')
    .meta({ description: 'Base API URL for the development environment', example: 'https://dev.api.example.com', type: 'string' }),
  DEV_BASE_URL: z
    .url()
    .default('https://dev.example.com')
    .meta({ description: 'Base URL for the development environment', example: 'https://dev.example.com', type: 'string' }),
  LOCAL_API_BASE_URL: z
    .url()
    .default('https://localhost:4000/api')
    .meta({ description: 'Base API URL for the local environment', example: 'https://localhost:4000/api', type: 'string' }),
  LOCAL_BASE_URL: z
    .url()
    .default('http://localhost:4000')
    .meta({ description: 'Base URL for the local environment', example: 'http://localhost:4000', type: 'string' }),
  PLAYWRIGHT_RECORD: boolEnvironment().meta({ description: 'Whether to record video of Playwright tests', example: '', type: 'boolean' }),
  PROD_API_BASE_URL: z
    .url()
    .default('https://production.api.example.com')
    .meta({ description: 'Base API URL for the production environment', example: 'https://production.api.example.com', type: 'string' }),
  PROD_BASE_URL: z
    .url()
    .default('https://production.example.com')
    .meta({ description: 'Base URL for the production environment', example: 'https://production.example.com', type: 'string' }),
});

export type EnvironmentConfig = z.infer<typeof environmentSchema>;
