## 1. Minor/patch dependency updates

- [x] 1.1 Run `npm update` to apply all patch and minor version updates
- [x] 1.2 Verify `package.json` and `package-lock.json` changes look correct

## 2. Remove vite-tsconfig-paths

- [x] 2.1 Uninstall `vite-tsconfig-paths` (`npm uninstall vite-tsconfig-paths`)
- [x] 2.2 Update `vitest.config.ts`: remove `tsconfigPaths()` plugin import and usage, add `resolve: { tsconfigPaths: true }`

## 3. Major ESLint plugin updates

- [x] 3.1 Install `eslint-plugin-n@latest` and `ts-declaration-location` (new peer dep for n v18)
- [x] 3.2 Install `eslint-plugin-unicorn@latest`
- [x] 3.3 Install `eslint-plugin-jsdoc@latest`
- [x] 3.4 Install `eslint-plugin-zod@latest`

## 4. Fix ESLint rule breakage from major bumps

- [x] 4.1 Run `npm run lint` and collect all new errors
- [x] 4.2 Fix any renamed/removed rules in `.eslint/node/n.eslint.mjs`
- [x] 4.3 Fix any renamed/removed rules in `.eslint/node/unicorn.eslint.mjs`
- [x] 4.4 Fix any renamed/removed rules in `.eslint/node/jsdoc.eslint.mjs`
- [x] 4.5 Fix any config API changes in `.eslint/zod/zod.eslint.mjs`
- [x] 4.6 Re-run lint until zero errors in `src/`, `tests/`, `scripts/`, `.eslint/`

## 5. Verification

- [x] 5.1 Run `npm run test:run` — all tests pass, no deprecation warning
- [x] 5.2 Run `npm run typecheck` — no TypeScript errors
- [x] 5.3 Run `npm run lint` — zero errors
