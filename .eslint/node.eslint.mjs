import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

import customStyleEslint from './node/custom-style.eslint.mjs';
import eslintRulesEslint from './node/eslint-rules.eslint.mjs';
import importAliasEslint from './node/import-alias.eslint.mjs';
import nConfig from './node/n.eslint.mjs';
import noSecretsEslint from './node/no-secrets.eslint.mjs';
import nodeEslint from './node/node.eslint.mjs';
import orderedImportsEslint from './node/ordered-imports.eslint.mjs';
import overridesEslint from './node/overrides.eslint.mjs';
import perfectionistEslint from './node/perfectionist.eslint.mjs';
import projectStructureEslint from './node/project-structure.eslint.mjs';
import securityEslint from './node/security.eslint.mjs';
import sonarEslint from './node/sonar.eslint.mjs';
import stylisticEslint from './node/stylistic.eslint.mjs';
import typescriptProjectEslint from './node/typescript-project.eslint.mjs';
import unicornEslint from './node/unicorn.eslint.mjs';
import vitestEslint from './node/vitest.eslint.mjs';
import { __dirname, compat } from './eslint-compat.config.mjs';

const gitignorePath = path.resolve('.', '.gitignore');

console.info('Using .gitignore file at:', gitignorePath);

export default [
  {
    // Ignore node_modules folder in eslint
    name: 'ignore node_modules',
    ignores: ['node_modules'],
  },
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  // Core Javascript rules
  pluginJs.configs.recommended,
  // TypeScript recommended rules
  {
    name: '@typescript-eslint/recommended (type-checked)',
    files: ['**/*.ts', '**/*.tsx'],
    ...tseslint.configs.recommendedTypeChecked[0],
  },
  // TypeScript stylistic rules
  {
    name: '@typescript-eslint/stylistic (type-checked)',
    files: ['**/*.ts', '**/*.tsx'],
    ...tseslint.configs.stylisticTypeChecked[0],
  },
  // TypeScript strict rules
  {
    name: '@typescript-eslint/strict (type-checked)',
    files: ['**/*.ts', '**/*.tsx'],
    ...tseslint.configs.strictTypeChecked[0],
  },
  // Airbnb base style for Node.js
  ...nodeEslint,
  // Compatibility helpers for extending configs
  ...compat.extends(
    path.join(__dirname, './node/typescript.eslintrc.json'),
    path.join(__dirname, './node/typescript-naming-convention.eslint.cjs'),
  ),
  ...stylisticEslint,
  // Node.js best practices (eslint-plugin-n)
  ...nConfig,
  // Vitest rules for testing
  ...vitestEslint,
  // Rules for ESLint config files
  ...eslintRulesEslint,
  // SonarJS code quality and security
  ...sonarEslint,
  // Prettier integration for formatting
  eslintPluginPrettierRecommended,
  // Dynamic ordered imports
  ...orderedImportsEslint,
  // Import alias support
  ...importAliasEslint,
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
  // Custom style rules for JS/TS
  ...customStyleEslint,
  // TypeScript ESLint rules for project (with parserOptions.project)
  ...typescriptProjectEslint,
];
