import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';

/**
 * @description ESLint config for enforcing best practices and recommended rules for NestJS projects using @darraghor/eslint-plugin-nestjs-typed. Applies recommended NestJS rules and disables specific rules for flexibility in project structure and dependency management.
 * @author Dmytro Vakulenko
 * @see https://github.com/darraghoriordan/eslint-plugin-nestjs-typed
 */
export default [
  ...eslintNestJs.configs.flatRecommended,
  {
    rules: {
      '@darraghor/nestjs-typed/injectable-should-be-provided': 'off',
      '@darraghor/nestjs-typed/api-enum-property-best-practices': 'off',
      'max-classes-per-file': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    files: ['**/*.module.*'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
];
