/**
 * Retry utilities with exponential backoff
 * Ensures reliable data loading for PWA without requiring page refresh
 */

/**
 * Retry a promise-based function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * @param {number} maxDelay - Maximum delay in ms (default: 10000)
 * @returns {Promise} Result from function
 */
export async function retryWithBackoff(
  fn,
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 10000
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
        
        console.warn(
          `Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${Math.round(delay)}ms...`
        );
        
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
    maxDelay
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
          console.warn(`Using cached data for ${cacheKey} due to error:`, error.message);
          return JSON.parse(cached);
        }
      } catch (cacheError) {
        console.error('Cache retrieval error:', cacheError);
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
    console.warn('Failed to cache data:', error);
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
    console.warn('Failed to retrieve cached data:', error);
    return null;
  }
}

/**
 * Invalidate ALL caches (localStorage + Service Worker cache)
 * Use this when admin makes changes that should be immediately visible to learners
 */
export async function invalidateAllCaches() {
  if (typeof window === 'undefined') return;
  
  console.log('🗑️ Invalidating ALL caches...');
  
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
    console.log(`✅ Cleared ${keysToRemove.length} localStorage cache entries`);
  } catch (error) {
    console.warn('Failed to clear localStorage cache:', error);
  }
  
  // Clear Service Worker caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log(`✅ Cleared ${cacheNames.length} Service Worker caches`);
    } catch (error) {
      console.warn('Failed to clear Service Worker caches:', error);
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
    console.warn('Failed to clear cache:', error);
  }
}
