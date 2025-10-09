import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
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

const gitignorePath = path.resolve('.', '.gitignore');

console.info('Using .gitignore file at:', gitignorePath);

export default [
  // Ignore node_modules folder in eslint
  {
    name: 'ignore node_modules',
    ignores: ['node_modules'],
  },
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  // Core Javascript rules
  pluginJs.configs.recommended,
  // TypeScript recommended rules
  ...tseslint.configs.recommended,
  // TypeScript stylistic rules
  ...tseslint.configs.stylistic,
  // TypeScript strict rules
  ...tseslint.configs.strict,
  // Airbnb base style for Node.js
  ...nodeEslint,
  // Compatibility helpers for extending configs
  ...compat.extends(
    path.join(__dirname, './node/typescript.eslintrc.json'),
    path.join(__dirname, './node/typescript-naming-convention.eslint.cjs'),
  ),
  // Node.js best practices (eslint-plugin-n)
  ...nConfig,
  // Rules for ESLint config files
  ...eslintRulesEslint,
  // SonarJS code quality and security
  ...sonarEslint,
  // Prettier integration for formatting
  eslintPluginPrettierRecommended,
  // Dynamic ordered imports
  ...orderedImportsEslint,
  // Secret detection rules
  ...noSecretsEslint,
  // Node.js security rules
  ...securityEslint,
  // Code sorting and organization
  ...perfectionistEslint,
  // Unicorn plugin for best practices
  ...unicornEslint,
  // Project folder/file structure rules
  ...projectStructureEslint,
  // TypeScript and test file overrides
  ...overridesEslint,
  // Jest testing rules
  ...jestEslint,
  // Custom style rules for JS/TS
  ...customStyleEslint,
];
