import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';

import nodeConfigs from './.eslint/node.eslint.mjs';

const gitignorePath = path.resolve('.', '.gitignore');

console.info('Using .gitignore file at:', gitignorePath);

export default [
  // Ignore node_modules folder in eslint
  {
    ignores: ['node_modules'],
  },
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  // Apply this config to js and ts files only
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  // Node config
  ...nodeConfigs,
];
