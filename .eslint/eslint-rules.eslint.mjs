import pluginImport from 'eslint-plugin-import';

export default [
  { plugins: { import: pluginImport } }, // enable import/* rules

  {
    files: ['./.eslint/**/*.{js,mjs,cjs,ts,tsx}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
];
