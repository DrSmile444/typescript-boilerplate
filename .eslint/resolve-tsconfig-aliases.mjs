import * as fs from 'node:fs';
import path from 'node:path';

import json5 from 'json5';

/**
 * Resolves tsconfig paths from a tsconfig file and its references
 * @param {string} tsconfigPath - Path to the tsconfig file
 * @param {Set<string>} visited - Set of already visited files to prevent circular references
 * @returns {Record<string, string[]>} - An object where each key is a path alias (e.g. "@app/*") and the value is an array of paths (e.g. ["src/app/*"]).
 *
 * @example
 * // Given tsconfig.json:
 * {
 *   "compilerOptions": {
 *     "paths": {
 *       "@app/*": ["src/app/*"],
 *       "@utils/*": ["src/utils/*"]
 *     }
 *   }
 * }
 *
 * // Calling resolveTsconfigPaths('path/to/tsconfig.json') returns:
 * {
 *   "@app/*": ["src/app/*"],
 *   "@utils/*": ["src/utils/*"]
 * }
 */
export function resolveTsconfigPaths(tsconfigPath, visited = new Set()) {
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
