// Simple logger for ESLint configs
export function eslintLogger(context) {
  return {
    // eslint-disable-next-line no-console
    log: (...arguments_) => console.log(`[ESLint:${context}]`, ...arguments_),
    info: (...arguments_) => console.info(`[ESLint:${context}]`, ...arguments_),
    warn: (...arguments_) => console.warn(`[ESLint:${context}]`, ...arguments_),
    error: (...arguments_) => console.error(`[ESLint:${context}]`, ...arguments_),
  };
}
