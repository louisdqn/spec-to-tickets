import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from "./constants";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limiter keyed by IP address.
 *
 * Known limitation: on Vercel, each serverless function instance maintains
 * its own map. Counters reset on cold starts. This is best-effort protection
 * acceptable for MVP. Use Vercel KV or Upstash Redis for reliable limiting.
 */
const store = new Map<string, RateLimitEntry>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and consume one request for the given IP.
 * @param ip - Client IP address
 * @returns Whether the request is allowed and remaining quota
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  // No existing entry or window expired — start fresh
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt };
  }

  // Within window — check count
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
  };
}
