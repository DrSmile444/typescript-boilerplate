import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.jsx', '**/*.tsx', '**/*.ts'],
    rules: {
      'unicorn/filename-case': 'off',
      'project-structure/folder-structure': 'off',
      'import/no-absolute-path': 'off',
    },
  },
]);
