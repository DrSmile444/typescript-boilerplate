import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.jsx', '**/*.tsx'],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
      'project-structure/folder-structure': 'off',
      'import/no-absolute-path': 'off',
    },
  },
]);
