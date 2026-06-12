## Why

Vite 8 (bundled with Vitest 4.x) now ships native tsconfig path resolution, making `vite-tsconfig-paths` redundant and generating a deprecation warning on every test run. Several ESLint plugins have major releases (n v18, unicorn v65, jsdoc v63, zod v4) with improvements and fixes, plus a build-up of minor/patch updates across the dependency tree. Addressing this now keeps the boilerplate current and avoids compounding drift.

## What Changes

- Remove `vite-tsconfig-paths` plugin; replace with `resolve: { tsconfigPaths: true }` in `vitest.config.ts`
- Apply all safe minor/patch dependency updates (`npm update`)
- Update four ESLint plugins to their latest major versions: `eslint-plugin-n` 17→18, `eslint-plugin-unicorn` 64→65, `eslint-plugin-jsdoc` 62→63, `eslint-plugin-zod` 3→4
- Fix any rule renames or config API changes introduced by those major bumps

## Capabilities

### New Capabilities

- `vitest-native-paths`: Native tsconfig path resolution in Vitest/Vite without an extra plugin

### Modified Capabilities

- None — no public API or spec-level behavior changes; this is entirely tooling and configuration

## Impact

- `package.json` devDependencies (removals, version bumps)
- `vitest.config.ts` (plugin removal, resolve option)
- `.eslint/` config files (rule fixes for major plugin updates)
- All existing tests must continue to pass
