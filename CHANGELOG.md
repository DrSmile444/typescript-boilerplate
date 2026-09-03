# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.6.2] - 2026-09-03

### Changed

- Updated npm dependencies, including several ESLint plugin major versions (`eslint-plugin-unicorn` 65→74, `eslint-plugin-boundaries` 6→7, `eslint-plugin-no-barrel-files` 1→2, Vitest 4→5, and others); bumped the Node engine range.
- Replaced `eslint-config-airbnb-base` with an owned, in-repo ESLint ruleset.
- Migrated to native Vite/Vitest tsconfig path resolution.
- Added OpenSpec quality-gate rules (lint/typecheck/test verification, paired test tasks, 80% coverage floor) and post-implementation review scaffolding (security-review, code-review, Codex adversarial review) to `openspec/config.yaml`.
- Updated OpenSpec tooling (CLI and Claude Code `opsx` commands/skills) to v1.12.0.

### Fixed

- ESLint config API changes from the `eslint-plugin-no-barrel-files` and `eslint-plugin-unicorn` major version bumps.
- Lint findings surfaced by the updated `eslint-plugin-unicorn`/`eslint-plugin-sonarjs` rule sets across `scripts/`, `src/`, and `.eslint/`.
- `unicorn/prefer-split-limit` violation in `find-missing-deps`.

## [1.6.1] - 2026-04-29

### Added

- `generate:env-template` script to generate a `.env.template` from the Zod environment schema.
- ESLint configuration for Zod, including a switch-exhaustiveness option.

### Changed

- Migrated environment configuration from `typed-dotenv` to Zod validation; updated the environment config tests and README accordingly.

## [1.6.0] - 2026-04-29

### Added

- Project banner SVG, referenced from the README.

### Changed

- Replaced `typed-dotenv` with Zod for environment validation; added the corresponding Zod ESLint plugins.

## [1.5.0] - 2026-04-20

### Added

- `update-deps` skill (check, update, and verify npm dependencies).
- ESLint configuration for Vue.js (JS and TS SFCs).
- "Framework configs" section in the README.

### Changed

- Dependency updates.

### Fixed

- Migrated to TypeScript 6 for compatibility.

## [1.4.6] - 2026-04-20

### Changed

- Extracted the TypeScript-specific ESLint configs into their own dedicated directory; broad ESLint config overhaul (new plugins, fixes, boundaries rules).
- Removed `swc` from the Vitest pipeline.

### Fixed

- Strict-mode TypeScript lint issues in `scripts/`.
- `showHello` now wraps the CI env value with `String()`.

## [1.4.5] - 2026-03-30

### Added

- ESLint configuration for Zod schemas.

## [1.4.4] - 2026-03-23

### Added

- ESLint configuration for JSDoc, with separate presets for JavaScript and TypeScript.

### Changed

- Updated the i18next ESLint config to use `fixupPluginRules`.

## [1.4.3] - 2026-03-14

### Added

- `eslint-plugin-lintlord`'s `prefer-logger` rule, discouraging raw `console.*` calls in favor of the shared logger.

## [1.4.2] - 2026-03-12

### Added

- Unit tests for the environment configuration module.

### Changed

- Streamlined the ESLint setup by removing an unused TypeScript config and consolidating rule overrides.

## [1.4.1] - 2026-03-11

### Added

- Vitest coverage reporting (`test:coverage`) and a `test:run` script.
- A TypeScript-code-quality skill for the assistant workflow.

### Changed

- Upgraded Vitest 3 → 4; updated devDependencies (including `eslint-plugin-perfectionist` to 5.6.0, refactoring its `customGroups`).
- Bumped the Node engine to the latest LTS (v24.14.0) in `.nvmrc`.
- Hardened several ESLint security configs; added a postinstall step to symlink agent skills for Codex.

## [1.3.24] - 2026-03-02

### Added

- Custom `eslint-plugin-lintlord` rule, `no-inline-interface-object-types`, flagging (and autofixing) inline object-literal types in interfaces, including function parameters and return types.
- `@typescript-eslint/array-type` rule.
- `after-parse-llm-response` script chaining lint-fix and markdown formatting after applying LLM-generated code.

### Changed

- Updated devDependencies and ESLint to v10.

## [1.3.23] - 2026-02-25

### Fixed

- React ESLint config migrated to flat config with an explicit ECMAScript version.
- Renamed the `better-tailwindcss` "unknown classes" rule; removed an unused project-structure plugin and the SVG-specific Prettier override.
- Tightened `unicorn/filename-case` (kebab/pascal case) and added `enforce-consistent-line-wrapping` for Tailwind classes.

## [1.3.22] - 2026-02-16

### Changed

- The import-alias ESLint config is now only exported when the project actually declares path aliases.

## [1.3.21] - 2026-02-14

### Added

- `split-plain-code.wrap` script to safely apply `package.json` modifications produced by the code splitter.

## [1.3.20] - 2026-02-09

### Added

- `create-auto-ts-paths` script to auto-generate `@alias/*` entries in `tsconfig.json` from the source folder structure.

### Changed

- Dependency updates and audit fixes; clearer variable naming in the new script and in `find-missing-deps`.

## [1.3.19] - 2026-01-06

### Added

- ESLint configuration enforcing naming conventions across the TypeScript codebase.

### Changed

- Downgraded `eslint-plugin-perfectionist` to 4.15.1 for compatibility; dependency updates.

## [1.3.18] - 2025-12-19

### Changed

- Dependency updates.

## [1.3.17] - 2025-11-29

### Added

- Scoped `no-process-env` exceptions for files that legitimately read `process.env` (e.g. a database config directory).

### Changed

- Reworked `no-restricted-syntax` in the Airbnb-derived ESLint config for modern syntax, and renamed that config module to `airbnb-base`.
- Refined naming-convention boolean-prefix rules and simplified TypeScript parser options.

## [1.3.16] - 2025-11-12

### Added

- ESLint configuration disallowing barrel (index re-export) files.

## [1.3.15] - 2025-11-09

### Added

- ESLint configuration for detecting and removing unused imports.

## [1.3.14] - 2025-11-09

### Fixed

- Conflicting ESLint import-sorting rules.

## [1.3.13] - 2025-11-05

### Added

- `skipLibCheck` in the TypeScript configuration.

## [1.3.12] - 2025-11-05

### Added

- `--dev` flag to install missing dependencies as devDependencies.
- ESLint rule forbidding `process.env` usage outside designated config files.

### Fixed

- JSON output from `find-missing-deps` now always ends with a trailing newline.

## [1.3.11] - 2025-10-29

### Added

- tsconfig path-alias support in the missing-dependencies check.

### Changed

- Simplified `isPackageLike` and extracted helper functions for tsconfig aliases.

## [1.3.10] - 2025-10-29

### Added

- `eslintLogger` helper with colored, contextual console output for ESLint config files.
- Vitest- and Jest-file-specific ESLint configurations using their recommended settings.

## [1.3.9] - 2025-10-29

### Added

- `resolveTsconfigPaths` utility, extracted into its own module, powering dynamic import-alias resolution.

### Changed

- Extended the TypeScript ESLint config to cover `scripts/`.

## [1.3.8] - 2025-10-27

### Changed

- Markdown formatting script now covers all markdown files; documentation polish in `AGENTS.md`.

## [1.3.7] - 2025-10-26

### Added

- `find-missing-deps` script to detect and install uninstalled dependencies.
- ESLint configuration for `eslint-plugin-better-tailwindcss`.

## [1.3.6] - 2025-10-26

### Added

- ESLint configuration for React and Prettier (with SVG exclusion).

### Changed

- Updated tsconfig path resolution and parser options.

## [1.3.5] - 2025-10-25

### Changed

- Refactored the ESLint configuration to use `defineConfig`.

## [1.3.4] - 2025-10-25

### Changed

- Updated the NestJS ESLint configuration for TypeScript files.

## [1.3.3] - 2025-10-25

### Changed

- Moved the Vitest ESLint config into its own file; refined case/default blank-line and switch-case style rules.

## [1.3.2] - 2025-10-23

### Changed

- Updated devDependencies.
- Improved argument parsing and error handling in `split-plain-code`.

### Fixed

- Process-exit handling and variable naming in environment config.

## [1.3.1] - 2025-10-23

### Added

- Release version string surfaced in the app's greeting message.
- Script to bump the package version and related files (`bump-version`).

## [1.3.0] - 2025-10-23

### Added

- ESLint configuration for the Zod plugin, plus additional NestJS model/entity rules.
- Extended TypeScript rules and module overrides; naming convention now allows camelCase for member-like identifiers.

### Changed

- Simplified import-alias and ordered-imports logging.
- Reworked the unicorn ESLint config to use its recommended settings.

## [1.2.3] - 2025-10-16

### Added

- Multi-file "plain code" splitter script (`split-plain-code`) for extracting file bundles from LLM output.

## [1.2.2] - 2025-10-16

### Added

- `AGENTS.md` documenting setup and coding conventions.

## [1.2.1] - 2025-10-16

### Added

- Vite support for tsconfig aliases and SWC.

### Fixed

- Reduced eslint-disable comment noise in the Vitest config.

## [1.2.0] - 2025-10-16

### Added

- Example `showHello` function with unit tests.
- Dynamic tsconfig-paths-based import alias resolution for ESLint's ordered-imports rule.

### Changed

- Migrated ESLint config to flat config, reorganized under `.eslint/` by domain (Node, NestJS, import aliasing, i18n, Vitest, TypeScript project references).
- Migrated test runner from Jest to Vitest; removed `jest`/`ts-jest`.
- Refined naming-convention, kebab-case filename, and abbreviation-prevention ESLint rules.

## [1.1.0] - 2025-07-23

### Added

- ESLint + Prettier baseline with an extensive plugin set (Airbnb base, unicorn, security, no-secrets, sonarjs, perfectionist, stylistic, import-sort, project-structure).
- Playwright test scaffolding with env/teardown support, `.env` loading via dotenv, decorators (`@Step`, `FieldStep`), and video-recording utilities (click/typing effects, easing transitions).
- `src/` folder structure, tsconfig path aliases, `typecheck` script, `api.fixture`.
- README.

### Changed

- Removed Playwright entirely in favor of a plain TypeScript boilerplate direction.
- Replaced the removed Playwright test runner with Jest (`jest`, `ts-jest`, `eslint-plugin-jest`).

### Fixed

- `npm audit` findings in dependencies.

## [1.0.0] - 2024-10-28

### Added

- Initial project scaffold.
