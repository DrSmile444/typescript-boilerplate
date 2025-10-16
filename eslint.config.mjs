import nodeConfigs from './.eslint/node.eslint.mjs';

export default [
  // Apply this config to js and ts files only
  {
    name: 'Source Files to scan',
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  {
    ignores: ['node_modules', 'function-out.js'],
  },
  // Node config
  ...nodeConfigs,
];
