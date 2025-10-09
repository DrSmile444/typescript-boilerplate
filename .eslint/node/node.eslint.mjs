import airbnbBase from 'eslint-config-airbnb-base';

import { compat } from '../eslint-compat.config.mjs';

export default [
  ...compat.config(airbnbBase),
  {
    name: 'node',
    rules: {
      'class-methods-use-this': 'off',
    },
  },
];
