---
name: typescript-code-quality
description: Use this skill when writing, reviewing, or refactoring TypeScript in this repository to keep code strongly typed, documented, lint-clean, covered by tests, and validated by the project's npm quality gates.
version: 1.0.0
---

# TypeScript Code Quality

Use this skill whenever you create or modify TypeScript in this repository.

## Standards

- Prefer explicit, precise types and small composable functions.
- Do not introduce `any`. If a value is unknown, use `unknown` and narrow it safely.
- Add JSDoc to exported functions and to non-trivial internal functions where intent, parameters, return values, or side effects are not obvious.
- Keep TypeScript strict. Do not weaken compiler or lint rules to make code pass.
- Prefer domain types, discriminated unions, generics, type guards, and `satisfies` over assertions.
- Avoid unsafe casts. If a cast is unavoidable, keep it local and justify it with code structure.
- Keep functions focused, names specific, and control flow easy to follow.
- Add or update tests for all new behavior. New and changed code must be covered.

## Required workflow

1. Read `package.json` before making assumptions about available scripts.
2. Implement the change with production-quality typing and JSDoc coverage.
3. Add or update Vitest tests in `tests/`:
   - Use a root `describe` named after the service, class, or module under test.
   - Create a separate nested `describe` for each method or function.
   - Split positive and negative cases into nested `describe` blocks.
4. Run `npm run lint:fix` if the script exists to auto-fix safe lint issues.
5. Run `npm run format:md` to format Markdown files.
6. Run `npm run typecheck` and fix all type errors.
7. Run `npm run lint` and fix all remaining ESLint problems until the command is clean.
8. Run `npm run test:run` and fix failures until all tests pass.
9. Run `npm run test:coverage` and ensure coverage is at least 80% for the enforced metrics, and that all new code is covered by meaningful tests.
10. If a build script exists, run the repository build command and fix build failures.
11. After the work is complete, bump the project version in `package.json` using semantic versioning:

- patch: bug fixes only
- minor: backward-compatible feature additions
- major: breaking changes

## Verification rules

- Do not claim completion while any of these commands fail: `npm run typecheck`, `npm run lint`, `npm run test:run`, `npm run test:coverage`.
- If `npm run build` exists, it must pass before finishing.
- Do not leave lint warnings or type errors for later.
- Do not reduce coverage thresholds or remove tests to make the suite pass.
- Do not bypass quality gates by disabling rules, adding `// @ts-ignore`, or relaxing config unless the user explicitly asks for that tradeoff.

## TypeScript guidance

- Model data with named types or interfaces when it improves clarity.
- Validate external input at boundaries and convert it into trusted internal types.
- Prefer returning typed results over throwing loosely typed errors when practical.
- Keep async code explicit about failure paths and return shapes.
- Use exhaustive checks for unions and unreachable states.
- Prefer readonly data and immutable updates unless mutation is materially simpler and safe.

## JSDoc minimum

Add JSDoc for functions that are exported or non-obvious. Document:

- purpose
- parameters
- return value
- thrown errors or important side effects when relevant

## Completion checklist

- TypeScript code has no `any`
- Functions are documented with JSDoc where required
- Markdown formatting is clean
- Typecheck passes
- ESLint passes
- Tests pass
- Coverage passes at 80%+
- Build passes when available
- Version bump matches the scope of change
