import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import customStyleEslint from './.eslint/custom-style.eslint.mjs';
import jestEslint from './.eslint/jest.eslint.mjs';
import noSecretsEslint from './.eslint/no-secrets.eslint.mjs';
import orderedImportsEslint from './.eslint/ordered-imports.eslint.mjs';
import perfectionistEslint from './.eslint/perfectionist.eslint.mjs';
import projectStructureEslint from './.eslint/project-structure.eslint.mjs';
import securityEslint from './.eslint/security.eslint.mjs';
import sonarEslint from './.eslint/sonar.eslint.mjs';
import unicornEslint from './.eslint/unicorn.eslint.mjs';
import { compat } from './eslint-compat.config.mjs';

export default [
  {
    ignores: ['node_modules'],
  },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...tseslint.configs.strict,
  ...compat.extends(
    './.eslint/node.eslintrc.json',
    './.eslint/typescript.eslintrc.json',
    // './.eslint/typescript-naming-convention.eslint.mjs',
    './.eslint/eslint-rules.eslintrc.json',
  ),
  ...sonarEslint,
  eslintPluginPrettierRecommended,
  ...orderedImportsEslint,
  ...noSecretsEslint,
  ...securityEslint,
  ...perfectionistEslint,
  ...unicornEslint,
  ...projectStructureEslint,
  ...compat.extends('./.eslint/overrides.eslintrc.json'),
  ...jestEslint,
  ...customStyleEslint,
];
