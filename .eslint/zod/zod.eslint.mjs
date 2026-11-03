import { defineConfig } from 'eslint/config';
import eslintPluginZod from 'eslint-plugin-zod';

export default defineConfig(eslintPluginZod.configs.recommended, eslintPluginZod.configs.stylistic, {
  name: 'zod/custom',
  rules: {
    // Moved from `recommended` to `strict` in v5; kept without the rest of `strict`
    'zod/prefer-trim-before-string-length-checks': 'error',
  },
});
