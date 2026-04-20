/**
 * @description ESLint overrides for TypeScript files. Enforces TS-specific rules,
 * disables conflicting base JS rules, and provides TypeScript-specific customizations.
 * @author Dmytro Vakulenko
 */
export default [
  {
    name: 'overrides-ts',
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off', // for path aliases

      // prefer the TS-specific version of these:
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'error',

      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      // disable base rule; @typescript-eslint/no-unused-vars is a superset
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/array-type': 'error',

      // Disable no-undef for TypeScript files (handled by TypeScript compiler)
      'no-undef': 'off',
    },
  },
  // Disable no-extraneous-class for module files (e.g. NestJS *.module.ts)
  {
    name: 'overrides-modules',
    files: ['**/*.module.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
];
