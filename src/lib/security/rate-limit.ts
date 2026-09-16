/**
 * Global fixed-window limiter for the optional Signal endpoint (M24).
 *
 * Deliberately keyless: rate limiting per visitor would require deriving an IP or
 * fingerprint, which `/surface` states is never collected. A shared window keeps
 * that promise. The cost is honest — sustained abuse exhausts the window for
 * everyone, and every caller falls back to deterministic search, which needs no
 * provider and no server budget.
 */

export const SIGNAL_WINDOW_MS = 60_000;
export const SIGNAL_MAX_PER_WINDOW = 30;

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export type RateLimiter = { check: (now?: number) => RateLimitDecision };

export function createRateLimiter(
  max: number = SIGNAL_MAX_PER_WINDOW,
  windowMs: number = SIGNAL_WINDOW_MS,
): RateLimiter {
  let windowStart = 0;
  let count = 0;

  return {
    check(now: number = Date.now()): RateLimitDecision {
      if (now - windowStart >= windowMs) {
        windowStart = now;
        count = 0;
      }
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((windowStart + windowMs - now) / 1000),
      );
      if (count >= max) {
        return { allowed: false, remaining: 0, retryAfterSeconds };
      }
      count += 1;
      return { allowed: true, remaining: max - count, retryAfterSeconds };
    },
  };
}

/** Process-wide limiter for `/api/signal/interpret`. */
export const signalRateLimiter = createRateLimiter();
