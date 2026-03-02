import { defineConfig } from 'eslint/config';

import {
  noInlineInterfaceObjectTypesRule,
  RULE_NAME as noInlineInterfaceObjectTypesRuleName,
} from './no-inline-interface-object-types.eslint.mjs';

const plugin = {
  rules: {
    [noInlineInterfaceObjectTypesRuleName]: noInlineInterfaceObjectTypesRule,
  },
};

/**
 * @description ESLint config for enforcing no inline object types in TypeScript interfaces. Applies the custom rule defined in no-inline-interface-object-types.eslint.mjs to prevent usage of inline `{ ... }` types in interface properties, function parameters, etc. Can be configured to also forbid type aliases with inline object types.
 * @author Dmytro Vakulenko
 * @version 1.1.0
 */
export default defineConfig([
  {
    name: 'lintlord/no-inline-interface-object-types',
    plugins: {
      lintlord: plugin,
    },
    rules: {
      'lintlord/no-inline-interface-object-types': 'error',

      // Optional example: also forbid `type X = { ... }`
      // "lintlord/no-inline-interface-object-types": ["error", { allowTypeAliases: false }],
    },
  },
]);
