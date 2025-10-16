import { describe, expect, it } from 'vitest';

import { showHello } from '../src/main';

/**
 * Unit tests for showHello function.
 * @see src/main.ts
 */
describe(showHello, () => {
  it('should return "Hello world"', () => {
    expect(showHello()).toBe('Hello world');
  });
});
