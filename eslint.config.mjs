import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { orderedImportsEslint } from './.eslint/ordered-imports.eslint.mjs';
import { playwrightEslint } from './.eslint/playwright.eslint.mjs';
import projectStructureEslint from './.eslint/project-structure.eslint.mjs';
import flatCompat from './eslint-compat.config.mjs';

export default [
  {
    ignores: ['node_modules', 'playwright-report', 'test-results'],
  },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...tseslint.configs.strict,
  ...flatCompat.extends('./.eslint/stylistic-custom-style.eslintrc.json5'),
  eslintPluginPrettierRecommended,
  playwrightEslint,
  orderedImportsEslint,
  ...projectStructureEslint,
];
