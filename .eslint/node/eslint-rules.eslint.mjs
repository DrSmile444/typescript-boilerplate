export default [
  {
    files: ['./.eslint/**/*.{js,mjs,cjs,ts,tsx}', './eslint.config.mjs'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
    },
  },
];
