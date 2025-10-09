/**
 * @description ESLint config for TypeScript and test file overrides. Enforces TS-specific rules and disables conflicting JS rules.
 * @author Dmytro Vakulenko
 */
export default [
  {
    name: 'overrides-ts',
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'error',
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off', // for path aliases

      // prefer the TS-specific version of these:
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'error',

      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
  // Test-file override
  {
    name: 'overrides-test',
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
];
