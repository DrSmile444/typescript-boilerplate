import path from 'node:path';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default new FlatCompat({
  baseDirectory: __dirname,
});
