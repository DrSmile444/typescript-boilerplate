import { environmentSchema } from './environment.schema';

try {
  process.loadEnvFile();
} catch {
  // .env file not found; continue with existing environment variables
}

export const environmentConfig = environmentSchema.parse(process.env);
