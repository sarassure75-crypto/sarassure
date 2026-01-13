/**
 * Logger conditionnel
 * Les logs de debug ne s'affichent qu'en développement
 * Les erreurs s'affichent toujours
 */
/* eslint-disable no-console */
export const logger = {
  /**
   * Log de debug (seulement en DEV)
   */
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },

  /**
   * Erreurs (toujours affichées)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Warnings (seulement en DEV)
   */
  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },

  /**
   * Info (seulement en DEV)
   */
  info: (...args) => {
    if (import.meta.env.DEV) {
      console.info(...args);
    }
  },
};
