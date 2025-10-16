import vitest from '@vitest/eslint-plugin';

/**
 * @description ESLint config for Vitest test files. Applies recommended Vitest rules to files in the tests/ directory.
 * @author Dmytro Vakulenko
 * @see https://github.com/vitest-dev/eslint-plugin-vitest
 */
export default [
  {
    name: vitest.configs.all.name,
    files: ['tests/**'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.all.rules,
      'vitest/max-nested-describe': ['error', { max: 3 }],
    },
  },
];
