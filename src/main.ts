import { environmentConfig } from './config/environment.config';

export function showHello() {
  return `Hello world ${environmentConfig.CI}`;
}

console.info(showHello());
