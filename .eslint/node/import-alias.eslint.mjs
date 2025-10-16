import importAlias from '@dword-design/eslint-plugin-import-alias';

import tsconfigPaths from '../../tsconfig.json' with { type: 'json' };

const baseUrl = tsconfigPaths.compilerOptions?.baseUrl || '';

const aliases = Object.fromEntries(
  Object.entries(tsconfigPaths.compilerOptions?.paths || {}).map(([key, valueArray]) => {
    // Remove trailing /* from alias key
    const aliasKey = key.replace('/*', '');
    // Remove trailing /* from path value
    let aliasValue = valueArray[0].replace('/*', '');
    // Prepend baseUrl unless value is already absolute or relative
    if (!aliasValue.startsWith('.') && !aliasValue.startsWith('/')) {
      aliasValue = `${baseUrl.replace(/\/$/, '')}/${aliasValue}`;
      // Ensure ./ prefix for ESLint
      if (!aliasValue.startsWith('./') && !aliasValue.startsWith('/')) {
        aliasValue = `./${aliasValue}`;
      }
    }
    return [aliasKey, aliasValue];
  }),
);

console.info('Resolved import aliases from tsconfig paths:', aliases);

/**
 * @description ESLint config for import alias linting using @dword-design/eslint-plugin-import-alias. Aliases are built dynamically from tsconfig.json using baseUrl.
 * @author Dmytro Vakulenko
 * @see https://github.com/dword-design/eslint-plugin-import-alias
 */
export default [
  importAlias.configs.recommended,
  {
    name: 'import-alias',
    rules: {
      '@dword-design/import-alias/prefer-alias': [
        'error',
        {
          alias: aliases,
        },
      ],
    },
  },
];
