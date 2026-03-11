import { environmentConfig } from './config/environment.config';
import { a } from './util';
import { OVERALL_PROJECT_RELEASE_VERSION } from './version';

/**
 * Builds the default startup message with environment and release metadata.
 *
 * @returns Human-readable application greeting.
 */
export function showHello() {
  return `Hello world ${environmentConfig.CI} ${OVERALL_PROJECT_RELEASE_VERSION} ${a}`;
}

console.info(showHello());
