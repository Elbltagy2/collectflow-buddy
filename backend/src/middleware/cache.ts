import { Request, Response, NextFunction } from 'express';
import { cache } from '../utils/cache';

interface CacheOptions {
  ttlSeconds?: number;
  keyGenerator?: (req: Request) => string;
}

// Cache middleware for GET requests
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttlSeconds = 300, keyGenerator } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `${req.originalUrl}:${JSON.stringify(req.query)}`;

    // Check if we have cached data
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache the response
    res.json = (data: any) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, ttlSeconds);
      }
      return originalJson(data);
    };

    next();
  };
};

// Middleware to invalidate cache on mutations
export const invalidateCacheMiddleware = (patterns: string[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to invalidate cache after successful mutation
    res.json = (data: any) => {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach((pattern) => {
          cache.invalidatePattern(pattern);
        });
      }
      return originalJson(data);
    };

    next();
  };
};
