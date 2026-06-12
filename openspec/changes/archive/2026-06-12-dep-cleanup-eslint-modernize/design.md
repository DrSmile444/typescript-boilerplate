## Context

The boilerplate runs on Vite 8 / Vitest 4.x / ESLint 10 / TypeScript 6. Vitest's deprecation warning on every test run (`vite-tsconfig-paths` detected) signals the transition point. Four ESLint plugins have crossed major version boundaries since the last update, carrying new peer-dep requirements and potential rule renames. The `.eslint/` directory is modular (one file per concern), which keeps each change isolated.

## Goals / Non-Goals

**Goals:**
- Eliminate the `vite-tsconfig-paths` deprecation warning from test output
- Keep all installed packages within their latest supported versions
- Maintain green lint + tests after every dependency change

**Non-Goals:**
- Migrating `eslint-config-airbnb-base` away from FlatCompat (separate change, higher risk)
- Switching `eslint-plugin-import` to `eslint-plugin-import-x` (same)
- Changing any runtime/application code behavior

## Decisions

### 1. Vite native paths vs. vite-tsconfig-paths

**Decision:** Switch to `resolve: { tsconfigPaths: true }` in `vitest.config.ts`, remove the plugin.

**Rationale:** Vite 8 prints an explicit migration prompt; the behavior is identical and the plugin becomes dead weight. The option is a drop-in replacement.

**Alternative considered:** Keep the plugin pinned — rejected because Vite may remove backward compat in Vite 9.

### 2. Major ESLint plugin update strategy

**Decision:** Update all four plugins in one batch (`npm install pkg@latest`), run `npm run lint`, fix any rule errors introduced.

**Rationale:** The plugins share the same ESLint 10 peer requirement; bumping together reduces the number of lint runs. Each plugin's config lives in its own file, so breakage is localized.

**Alternative considered:** One plugin at a time with separate commits — safer but unnecessary for a tooling-only repo with no production traffic.

### 3. eslint-plugin-n v18 peer dep

**Decision:** Install `ts-declaration-location` as a new devDependency required by `eslint-plugin-n@18`.

**Rationale:** v18 requires `ts-declaration-location ^1.0.6`. It's a type-resolution utility used internally; we just need it present.

## Risks / Trade-offs

- **eslint-plugin-unicorn v65 rule renames** → lint run after update reveals any; fix in `.eslint/node/unicorn.eslint.mjs`
- **eslint-plugin-zod v4 config shape change** → the `recommended` export is confirmed an array; if v4 changes the key name we fix it in `.eslint/zod/zod.eslint.mjs`
- **eslint-plugin-n v18 `ts-declaration-location` peer dep** → new devDependency, zero runtime impact
- **`npm update` touching more than intended** → verify with `git diff package.json` before committing; `package-lock.json` changes are expected

## Migration Plan

1. `npm update` — apply all patch/minor updates in one pass
2. `npm install eslint-plugin-n@latest eslint-plugin-unicorn@latest eslint-plugin-jsdoc@latest eslint-plugin-zod@latest ts-declaration-location` — major bumps
3. `npm uninstall vite-tsconfig-paths` + update `vitest.config.ts`
4. `npm run lint` — collect errors, fix rule renames in `.eslint/` files
5. `npm run test:run` — verify tests still pass
6. `npm run typecheck` — verify TypeScript still clean

Rollback: `git checkout package.json package-lock.json vitest.config.ts .eslint/` and `npm install`.
