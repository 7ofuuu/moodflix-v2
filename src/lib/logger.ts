 
/**
 * Centralised logger — console calls isolated here so SonarQube
 * only needs a single NOSONAR suppression instead of per-call suppressions.
 */
export const logger = {
  error: (...args: unknown[]): void => {
    console.error(...args); // NOSONAR
  },
  warn: (...args: unknown[]): void => {
    console.warn(...args); // NOSONAR
  },
};
