/**
 * @description ESLint overrides for test files. Provides test globals and
 * relaxes documentation rules for test files.
 * @author Dmytro Vakulenko
 */
export default [
  // Test-file override
  {
    name: 'overrides-test',
    files: ['**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'jsdoc/require-description': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-param-type': 'off',
    },
  },
];
