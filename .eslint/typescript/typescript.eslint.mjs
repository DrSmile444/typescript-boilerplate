import namingEslint from './naming.eslint.mjs';
import overridesEslint from './overrides.eslint.mjs';
import overridesTestEslint from './overrides-test.eslint.mjs';
import projectEslint from './project.eslint.mjs';
import tseslintRulesEslint from './tseslint-rules.eslint.mjs';

/**
 * @description Aggregated TypeScript-specific ESLint configs. All rules here
 * only apply to TypeScript files (*.ts, *.tsx, *.mts, *.cts). Remove this import
 * from node.eslint.mjs to switch to a JavaScript-only configuration.
 * @author Dmytro Vakulenko
 */
export default [
  // TypeScript recommended, stylistic, and strict rules (type-checked)
  ...tseslintRulesEslint,
  // Naming convention rules for TypeScript
  ...namingEslint,
  // TypeScript-specific overrides (type imports, no-shadow, no-undef, etc.)
  ...overridesEslint,
  // Test-file overrides for TypeScript (test globals, relaxed JSDoc rules)
  ...overridesTestEslint,
  // TypeScript parser configuration (must be last to ensure parser settings take precedence)
  ...projectEslint,
];
