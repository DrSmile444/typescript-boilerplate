import { environmentConfig } from './config/environment.config';
import { OVERALL_PROJECT_RELEASE_VERSION } from './version';
import { a } from './util';

export function showHello() {
  return `Hello world ${environmentConfig.CI} ${OVERALL_PROJECT_RELEASE_VERSION} ${a}`;
}

console.info(showHello());
