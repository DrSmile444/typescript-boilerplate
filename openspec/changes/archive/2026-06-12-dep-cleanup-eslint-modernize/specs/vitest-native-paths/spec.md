## ADDED Requirements

### Requirement: Vitest resolves tsconfig path aliases natively
The test runner SHALL resolve TypeScript path aliases (defined in `tsconfig.json` `compilerOptions.paths`) without requiring the `vite-tsconfig-paths` plugin. Vite 8's native `resolve.tsconfigPaths` option SHALL be used instead.

#### Scenario: Tests with tsconfig path aliases pass
- **WHEN** a test file imports a module via a tsconfig path alias (e.g., `@utils/foo`)
- **THEN** vitest resolves the import correctly and the test passes

#### Scenario: No deprecation warning on test run
- **WHEN** `npm run test:run` is executed
- **THEN** no "vite-tsconfig-paths is detected" deprecation warning appears in output

### Requirement: ESLint plugins stay at latest supported versions
All ESLint plugin devDependencies SHALL be updated to their latest compatible versions. Major-version updates (n v18, unicorn v65, jsdoc v63, zod v4) SHALL be applied without introducing new lint errors in existing source files.

#### Scenario: Lint passes after major plugin updates
- **WHEN** `npm run lint` is executed after updating all ESLint plugins
- **THEN** no errors are reported for files in `src/`, `tests/`, `scripts/`, or `.eslint/`

