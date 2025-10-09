import path from 'node:path';

import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

import customStyleEslint from './node/custom-style.eslint.mjs';
import eslintRulesEslint from './node/eslint-rules.eslint.mjs';
import jestEslint from './node/jest.eslint.mjs';
import nConfig from './node/n.eslint.mjs';
import noSecretsEslint from './node/no-secrets.eslint.mjs';
import nodeEslint from './node/node.eslint.mjs';
import orderedImportsEslint from './node/ordered-imports.eslint.mjs';
import overridesEslint from './node/overrides.eslint.mjs';
import perfectionistEslint from './node/perfectionist.eslint.mjs';
import projectStructureEslint from './node/project-structure.eslint.mjs';
import securityEslint from './node/security.eslint.mjs';
import sonarEslint from './node/sonar.eslint.mjs';
import unicornEslint from './node/unicorn.eslint.mjs';
import { __dirname, compat } from './eslint-compat.config.mjs';

export default [
  // Javascript Config
  pluginJs.configs.recommended,
  // TypeScript Config
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...tseslint.configs.strict,
  ...nodeEslint,
  ...compat.extends(
    path.join(__dirname, './node/typescript.eslintrc.json'),
    path.join(__dirname, './node/typescript-naming-convention.eslint.cjs'),
  ),
  ...nConfig,
  ...eslintRulesEslint,
  ...sonarEslint,
  eslintPluginPrettierRecommended,
  ...orderedImportsEslint,
  ...noSecretsEslint,
  ...securityEslint,
  ...perfectionistEslint,
  ...unicornEslint,
  ...projectStructureEslint,
  ...overridesEslint,
  ...jestEslint,
  ...customStyleEslint,
];
