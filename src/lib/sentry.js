/* eslint-disable no-console */
/**
 * Initialiser Sentry pour monitoring des erreurs
 * Usage: importer ce module une fois dans main.jsx
 * 
 * Installation: npm install @sentry/react
 */

let Sentry = null;

try {
  Sentry = require('@sentry/react');
} catch (e) {
  console.log('ℹ️ Sentry not installed. Install with: npm install @sentry/react');
}

/**
 * Initialiser Sentry (à appeler AVANT de créer l'app React)
 */
export const initSentry = () => {
  const isDev = import.meta.env.DEV;
  const hasSentry = Sentry && import.meta.env.VITE_SENTRY_DSN;

  // Ne pas initialiser en développement ou si Sentry n'est pas installé
  if (isDev || !hasSentry) {
    console.log('ℹ️ Sentry skipped (dev mode or not configured)');
    return;
  }

  try {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENV || 'production',
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Capture 100% des erreurs en prod, 10% des sessions
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });

    console.log('✅ Sentry initialized');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

/**
 * Helper pour capturer une erreur avec contexte
 */
export const captureError = (error, context = {}) => {
  if (import.meta.env.DEV) {
    console.error('Error context:', context);
    return;
  }

  if (!Sentry) {
    console.error('Sentry not available:', error);
    return;
  }

  try {
    Sentry.captureException(error, {
      contexts: { app: context },
    });
  } catch (e) {
    console.error('Failed to capture error:', e);
  }
};

/**
 * Helper pour tracker des événements
 */
export const trackEvent = (eventName, data = {}) => {
  if (import.meta.env.DEV) {
    console.log(`📊 Event: ${eventName}`, data);
    return;
  }

  if (!Sentry) {
    console.log(`Event not tracked (Sentry not available): ${eventName}`);
    return;
  }

  try {
    Sentry.captureMessage(eventName, 'info', {
      tags: { event: eventName },
      extra: data,
    });
  } catch (e) {
    console.error('Failed to track event:', e);
  }
};

export default Sentry;
