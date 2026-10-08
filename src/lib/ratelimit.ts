import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Server-side rate limiter using Upstash Redis
// Falls back to allow-all if environment variables are not present (e.g. in offline unit tests)

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

export const contactRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'), // 5 requests per 10 minutes
      analytics: true,
      prefix: 'ratelimit:contact',
    })
  : null;

export const revealContactLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 contact reveals per hour
      analytics: true,
      prefix: 'ratelimit:reveal_contact',
    })
  : null;

export const internalJobsLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
      analytics: true,
      prefix: 'ratelimit:jobs',
    })
  : null;

/**
 * Check rate limit for a specific identifier
 * Returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!limiter) {
    // If Redis is not configured (e.g. in test runner), allow request
    return { success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limiting error, failing open to preserve user availability:', error);
    return { success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 };
  }
}
