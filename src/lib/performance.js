import React from 'react';

/**
 * Utilitaires pour optimiser les performances
 */

/**
 * Debounce - Retarde l'exécution d'une fonction
 * Utile pour les champs de recherche, sauvegardes auto
 *
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai en ms
 * @returns {Function} Fonction debouncée
 */
export const debounce = (func, wait = 300) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle - Limite la fréquence d'exécution d'une fonction
 * Utile pour les scroll handlers, resize handlers
 *
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Intervalle minimum en ms
 * @returns {Function} Fonction throttlée
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoize - Met en cache le résultat d'une fonction
 * Utile pour des calculs coûteux répétés
 *
 * @param {Function} fn - Fonction à mémoïser
 * @returns {Function} Fonction mémoïsée
 */
export const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Lazy Load - Charge une fonction/module de manière différée
 * Utile pour le code splitting
 *
 * @param {Function} importFunc - Fonction d'import dynamique
 * @returns {Promise} Promise du module chargé
 */
export const lazyLoad = (importFunc) => {
  return React.lazy(importFunc);
};

/**
 * Batch - Regroupe plusieurs mises à jour en une seule
 * Utile pour optimiser les rendus React
 *
 * @param {Function} callback - Fonction contenant les mises à jour
 */
export const batch = (callback) => {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0);
  }
};

/**
 * Preload Image - Précharge une image
 * Utile pour les galeries, carousels
 *
 * @param {string} src - URL de l'image
 * @returns {Promise<HTMLImageElement>}
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Cancel Debounce - Annule un debounce en cours
 * Utile pour nettoyer les effets
 *
 * @param {Function} debouncedFunc - Fonction debouncée
 */
export const cancelDebounce = (debouncedFunc) => {
  if (debouncedFunc && debouncedFunc.cancel) {
    debouncedFunc.cancel();
  }
};

/**
 * Deep Clone - Clone profond d'un objet
 * Utile pour éviter les mutations
 *
 * @param {*} obj - Objet à cloner
 * @returns {*} Clone de l'objet
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Chunk Array - Divise un array en chunks
 * Utile pour la pagination côté client
 *
 * @param {Array} array - Array à diviser
 * @param {number} size - Taille des chunks
 * @returns {Array<Array>}
 */
export const chunkArray = (array, size = 10) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Wait - Attend un certain temps
 * Utile pour les tests, animations
 *
 * @param {number} ms - Temps d'attente en ms
 * @returns {Promise}
 */
export const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry - Réessaye une fonction en cas d'échec
 * Utile pour les appels API
 *
 * @param {Function} fn - Fonction à réessayer
 * @param {number} retries - Nombre de tentatives
 * @param {number} delay - Délai entre tentatives en ms
 * @returns {Promise}
 */
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await wait(delay);
    return retry(fn, retries - 1, delay);
  }
};
