import tseslint from 'typescript-eslint';

/**
 * @description ESLint config for TypeScript recommended, stylistic, and strict rules using typescript-eslint with type-checked presets. Scoped to TypeScript files only.
 * @author Dmytro Vakulenko
 * @see https://typescript-eslint.io/linting/typed-linting/
 */
export default tseslint.config({
  files: ['**/*.{ts,tsx,mts,cts}'],
  extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked, ...tseslint.configs.strictTypeChecked],
});
