import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';

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
];
