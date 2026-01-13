
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import ErrorBoundary from '@/components/ErrorBoundary';

// ===== Sentry Initialization =====
import { initSentry } from '@/lib/sentry';
initSentry();
// ===============================

const queryClient = new QueryClient();

// Service Worker - désactiver en développement, activer en production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Version de l'application pour forcer le nettoyage du cache si nécessaire
const APP_VERSION = '1.2.6';
try {
  const storedVersion = localStorage.getItem('app_version');
  if (storedVersion !== APP_VERSION) {
    console.log(`🚀 Nouvelle version détectée (${storedVersion} -> ${APP_VERSION}). Nettoyage du cache...`);
    // On nettoie le cache localStorage immédiatement des clés de données
    Object.keys(localStorage).forEach(key => {
      if (key && (key.startsWith('cache:') || key.startsWith('cached_'))) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem('app_version', APP_VERSION);
  }
} catch (e) {
  console.warn('Erreur lors du check de version:', e);
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
