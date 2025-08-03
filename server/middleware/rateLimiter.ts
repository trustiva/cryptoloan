import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;
  private message: string;

  constructor(options: {
    windowMs: number;
    maxRequests: number;
    message?: string;
  }) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.message = options.message || 'Too many requests, please try again later.';
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Clean up expired entries
      this.cleanup(windowStart);

      // Get or create record for this key
      let record = this.store[key];
      if (!record || record.resetTime <= windowStart) {
        record = {
          count: 0,
          resetTime: now + this.windowMs
        };
        this.store[key] = record;
      }

      // Check rate limit
      if (record.count >= this.maxRequests) {
        const resetTimeSeconds = Math.ceil((record.resetTime - now) / 1000);
        
        res.set({
          'X-RateLimit-Limit': this.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString(),
          'Retry-After': resetTimeSeconds.toString()
        });

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: this.message,
          retryAfter: resetTimeSeconds
        });
      }

      // Increment counter
      record.count++;

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': this.maxRequests.toString(),
        'X-RateLimit-Remaining': (this.maxRequests - record.count).toString(),
        'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString()
      });

      next();
    };
  }

  private getKey(req: Request): string {
    // Use IP address as key (in production, consider using user ID for authenticated requests)
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup(cutoff: number) {
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= cutoff) {
        delete this.store[key];
      }
    });
  }
}

// Pre-configured rate limiters for different endpoints
export const generalLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.'
});

export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.'
});

export const loanApplicationLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 loan applications per hour
  message: 'Too many loan applications, please wait before submitting another.'
});

export const paymentLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20, // 20 payment requests per 5 minutes
  message: 'Too many payment requests, please wait a moment.'
});

export const strictLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Rate limit exceeded for this sensitive endpoint.'
});

export default RateLimiter;