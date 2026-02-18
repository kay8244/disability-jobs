/**
 * Simple in-memory TTL cache for cross-request caching.
 * Stores values with a time-to-live (TTL) and automatically
 * invalidates stale entries.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

/**
 * Get or set a cached value.
 * If the cached value exists and hasn't expired, returns it.
 * Otherwise, calls the fetcher, caches the result, and returns it.
 *
 * @param key - Cache key
 * @param fetcher - Async function to produce the value on cache miss
 * @param ttlMs - Time-to-live in milliseconds (default: 5 minutes)
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
): Promise<T> {
  const now = Date.now()
  const entry = store.get(key) as CacheEntry<T> | undefined

  if (entry && entry.expiresAt > now) {
    return entry.value
  }

  const value = await fetcher()
  store.set(key, { value, expiresAt: now + ttlMs })
  return value
}

/**
 * Invalidate a specific cache entry.
 */
export function invalidateCache(key: string): void {
  store.delete(key)
}

/**
 * Invalidate all cache entries.
 */
export function invalidateAll(): void {
  store.clear()
}
