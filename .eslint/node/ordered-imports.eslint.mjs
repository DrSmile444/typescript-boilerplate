import simpleImportSort from 'eslint-plugin-simple-import-sort';

import tsconfigPaths from '../../tsconfig.json' with { type: 'json' };

let tsconfigPathsGroups = [];

if (
  tsconfigPaths?.compilerOptions?.paths &&
  typeof tsconfigPaths.compilerOptions.paths === 'object' &&
  Object.keys(tsconfigPaths.compilerOptions.paths).length > 0
) {
  tsconfigPathsGroups = Object.keys(tsconfigPaths.compilerOptions.paths).map((key) => {
    const clearKey = key.replace('/*', '');

    return [`^${clearKey}(/.*|$)?`];
  });

  console.info('Resolved tsconfig paths groups for ordered-imports:', tsconfigPathsGroups);
} else {
  console.info('No tsconfig paths found for ordered-imports. Internal package import groups will not be generated.');
}

/**
 * @description ESLint config for enforcing dynamically resolved ordered imports in Node projects using eslint-plugin-simple-import-sort. Automatically generates import groups from tsconfig.json path aliases for internal packages, ensuring import order matches project structure and alias configuration. This helps maintain consistent and logical import organization, especially in monorepos or projects with custom path aliases.
 * @author Dmytro Vakulenko
 * @see https://github.com/lydell/eslint-plugin-simple-import-sort
 * @see https://www.typescriptlang.org/tsconfig#paths
 */
export default [
  {
    name: 'ordered-imports',
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Packages `node` related packages come first.
            ['^node'],
            // Nest
            ['^@?nestjs'],
            // All other npm packages.
            [String.raw`^@?\w`],
            // Internal packages (split by alias).
            ...tsconfigPathsGroups,
            // Side effect imports.
            [String.raw`^\u0000`],
            // Parent imports. Put `..` last.
            [String.raw`^\.\.(?!/?$)`, String.raw`^\.\./?$`],
            // Other relative imports. Put same-folder imports and `.` last.
            [String.raw`^\./(?=.*/)(?!/?$)`, String.raw`^\.(?!/?$)`, String.raw`^\./?$`],
            // Style imports.
            [String.raw`^.+\.?(css)$`],
          ],
        },
      ],
    },
  },
];
