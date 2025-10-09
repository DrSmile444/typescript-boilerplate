import noSecrets from 'eslint-plugin-no-secrets';

// eslint-plugin-no-secrets
// An eslint rule that searches for potential secrets/keys in code and JSON files.
export default [
  {
    name: 'no-secrets',
    plugins: {
      'no-secrets': noSecrets,
    },
    rules: {
      'no-secrets/no-secrets': 'error',
    },
  },
];
