/**
 * In-Memory TTL Cache Manager for high-throughput read operations.
 * Implements auto-expiration and automatic memory cleanup.
 */
class MemoryCache {
  constructor(defaultTTLMs = 60 * 1000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTLMs;

    // Periodic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  set(key, value, ttlMs = this.defaultTTL) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();
