import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import simpleImportSort from 'eslint-plugin-simple-import-sort';
import json5 from 'json5';

/**
 * Resolves tsconfig paths from a tsconfig file and its references
 * @param {string} tsconfigPath - Path to the tsconfig file
 * @param {Set<string>} visited - Set of already visited files to prevent circular references
 * @returns {object} - Merged paths object
 */
function resolveTsconfigPaths(tsconfigPath, visited = new Set()) {
  if (visited.has(tsconfigPath)) {
    return {};
  }

  visited.add(tsconfigPath);

  let mergedPaths = {};

  try {
    const fileContent = fs.readFileSync(tsconfigPath, 'utf8');
    const tsconfigContent = json5.parse(fileContent);

    // Add paths from current config
    if (tsconfigContent?.compilerOptions?.paths && typeof tsconfigContent.compilerOptions.paths === 'object') {
      mergedPaths = { ...mergedPaths, ...tsconfigContent.compilerOptions.paths };
    }

    // Recursively process references
    if (Array.isArray(tsconfigContent?.references)) {
      const tsconfigDirectory = path.dirname(tsconfigPath);

      // eslint-disable-next-line no-restricted-syntax
      for (const reference of tsconfigContent.references) {
        const referencePath = path.resolve(tsconfigDirectory, reference.path);
        const referencesPaths = resolveTsconfigPaths(referencePath, visited);

        mergedPaths = { ...mergedPaths, ...referencesPaths };
      }
    }
  } catch (error) {
    // Silently ignore errors for missing or invalid tsconfig files
    console.warn(`Warning: Failed to parse ${tsconfigPath}:`, error.message);
  }

  return mergedPaths;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootTsconfigPath = path.resolve(__dirname, '../../tsconfig.json');
const allPaths = resolveTsconfigPaths(rootTsconfigPath);

let tsconfigPathsGroups = [];

if (allPaths && typeof allPaths === 'object' && Object.keys(allPaths).length > 0) {
  tsconfigPathsGroups = Object.keys(allPaths).map((key) => {
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
            // React and related packages.
            ['^react', String.raw`^@?\w*react`, String.raw`^@?\w*jsx-runtime`],
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
