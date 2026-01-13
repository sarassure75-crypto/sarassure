import { logger } from '@/lib/logger';

/**
 * Retry utilities with exponential backoff
 * Ensures reliable data loading for PWA without requiring page refresh
 */
/**
 * Retry util with exponential backoff
 * @param {Function} fn - Function returning a promise
 * @param {number} retries - Number of retries
 * @param {number} delay - Initial delay in ms
 * @param {number} maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} onRetry - Callback executed on each retry
 * @returns {Promise} Result from function
 */
export async function retryWithBackoff(
  fn,
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 10000,
  onRetry = null
) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx except 408, 429)
      if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        // Calculate delay with exponential backoff
        const exponentialDelay = initialDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
        const delay = Math.min(exponentialDelay + jitter, maxDelay);
        
        logger.warn(
          `Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${Math.round(delay)}ms...`
        );
        if (typeof onRetry === 'function') {
          onRetry({ attempt, delay, error });
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Wrapper for Supabase queries with automatic retry
 * @param {Function} queryFn - Function that returns a Supabase query
 * @param {Object} options - Retry options
 * @returns {Promise} Query result
 */
export async function supabaseWithRetry(queryFn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry = null,
  } = options;

  return retryWithBackoff(
    async () => {
      const { data, error } = await queryFn();
      
      if (error) {
        const err = new Error(error.message);
        err.status = error.status;
        throw err;
      }
      
      return data;
    },
    maxRetries,
    initialDelay,
    maxDelay,
    onRetry
  );
}

/**
 * Create a resilient async operation that handles both online and offline scenarios
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} cacheKey - Optional cache key for offline support
 * @returns {Promise} Result from asyncFn
 */
export async function resilientAsync(asyncFn, cacheKey = null) {
  try {
    return await retryWithBackoff(asyncFn, 3, 500, 5000);
  } catch (error) {
    // Try to use cached data if available
    if (cacheKey && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`cache:${cacheKey}`);
        if (cached) {
          logger.warn(`Using cached data for ${cacheKey} due to error:`, error.message);
          return JSON.parse(cached);
        }
      } catch (cacheError) {
        logger.error('Cache retrieval error:', cacheError);
      }
    }
    
    throw error;
  }
}

/**
 * Cache a successful async result
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in ms (default: 1 hour)
 */
export function cacheData(key, data, ttl = 3600000) {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`cache:${key}`, JSON.stringify(cacheEntry));
  } catch (error) {
    logger.warn('Failed to cache data:', error);
  }
}

/**
 * Retrieve cached data if still valid
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if expired/not found
 */
export function getCachedData(key) {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`cache:${key}`);
    if (!cached) return null;
    
    const cacheEntry = JSON.parse(cached);
    const isExpired = Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
    
    if (isExpired) {
      localStorage.removeItem(`cache:${key}`);
      return null;
    }
    
    return cacheEntry.data;
  } catch (error) {
    logger.warn('Failed to retrieve cached data:', error);
    return null;
  }
}

/**
 * Invalidate ALL caches (localStorage + Service Worker cache)
 * Use this when admin makes changes that should be immediately visible to learners
 */
export async function invalidateAllCaches() {
  if (typeof window === 'undefined') return;
  
  logger.info('🗑️ Invalidating ALL caches...');
  
  // Clear localStorage caches
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cache:') || key.startsWith('cached_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    logger.info(`✅ Cleared ${keysToRemove.length} localStorage cache entries`);
  } catch (error) {
    logger.warn('Failed to clear localStorage cache:', error);
  }
  
  // Clear Service Worker caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      logger.info(`✅ Cleared ${cacheNames.length} Service Worker caches`);
    } catch (error) {
      logger.warn('Failed to clear Service Worker caches:', error);
    }
  }
}

/**
 * Clear specific cache entry or all cache
 * @param {string|null} key - Cache key to clear, or null to clear all
 */
export function clearCache(key = null) {
  if (typeof window === 'undefined') return;
  
  try {
    if (key) {
      localStorage.removeItem(`cache:${key}`);
    } else {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cache:'));
      keys.forEach(k => localStorage.removeItem(k));
    }
  } catch (error) {
    logger.warn('Failed to clear cache:', error);
  }
}
