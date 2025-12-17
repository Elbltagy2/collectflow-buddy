// Simple in-memory cache with TTL support

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTLSeconds: number = 300) {
    this.defaultTTL = defaultTTLSeconds * 1000;

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Delete all keys matching a pattern (e.g., "products:*")
  invalidatePattern(pattern: string): number {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new MemoryCache(300); // 5 minutes default TTL

// Cache key generators
export const cacheKeys = {
  products: (page?: number, limit?: number, category?: string) =>
    `products:${page || 1}:${limit || 10}:${category || 'all'}`,
  productById: (id: string) => `product:${id}`,
  productCategories: () => 'product:categories',

  customers: (page?: number, limit?: number, collectorId?: string) =>
    `customers:${page || 1}:${limit || 10}:${collectorId || 'all'}`,
  customerById: (id: string) => `customer:${id}`,

  invoices: (page?: number, limit?: number, customerId?: string, status?: string) =>
    `invoices:${page || 1}:${limit || 10}:${customerId || 'all'}:${status || 'all'}`,
  invoiceById: (id: string) => `invoice:${id}`,

  collectorRoute: (collectorId: string, date: string) =>
    `route:${collectorId}:${date}`,
  collectorStats: (collectorId: string) => `stats:${collectorId}`,

  dashboard: (role: string, userId: string) => `dashboard:${role}:${userId}`,
};

// Cache invalidation helpers
export const invalidateCache = {
  products: () => cache.invalidatePattern('product*'),
  customers: () => cache.invalidatePattern('customer*'),
  invoices: () => cache.invalidatePattern('invoice*'),
  routes: () => cache.invalidatePattern('route:*'),
  stats: () => cache.invalidatePattern('stats:*'),
  dashboard: () => cache.invalidatePattern('dashboard:*'),
  all: () => cache.clear(),
};
