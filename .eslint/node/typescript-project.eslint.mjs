/* eslint-disable security/detect-non-literal-fs-filename */
import * as fs from 'node:fs';
import path from 'node:path';

import tseslint from 'typescript-eslint';

// Get the directory name in ES module scope
const tsconfigRootDirectory = path.join(path.dirname(new URL(import.meta.url).pathname), '../..');
const tsconfigPath = path.join(tsconfigRootDirectory, 'tsconfig.json');

if (!fs.existsSync(tsconfigPath)) {
  console.warn(`Warning: tsconfig.json not found at ${tsconfigPath}. Please ensure the path is correct.`);
}

/**
 * @description ESLint config for TypeScript projects using project references. Configures the TypeScript parser with project settings to enable type-aware linting.
 * @author Dmytro Vakulenko
 * @see https://typescript-eslint.io/linting/typed-linting/
 */
export default [
  {
    files: ['**/*.{js,jsx,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: tsconfigRootDirectory,
      },
    },
  },
];
