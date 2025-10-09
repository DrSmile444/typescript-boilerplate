import nestEslint from './nest/nest.eslint.mjs';
import nodeEslint from './node.eslint.mjs';

export default [
  // Shared Node rules
  ...nodeEslint,
  // NestJS specific rules
  ...nestEslint,
];
