import { Context, Next } from 'hono';
import { Bindings } from '../types';

// Simple in-memory rate limiter (per Worker isolate).
// Keeps a rolling window of request timestamps keyed by client IP.
const store = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 minute

/**
 * Returns middleware that allows at most `maxRequests` calls per minute
 * from a single IP address.
 */
export function rateLimit(maxRequests: number) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const ip =
      c.req.header('cf-connecting-ip') ??
      c.req.header('x-forwarded-for') ??
      'unknown';

    const now = Date.now();
    const timestamps = (store.get(ip) ?? []).filter(
      (t) => now - t < WINDOW_MS
    );

    if (timestamps.length >= maxRequests) {
      return c.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
        429
      );
    }

    timestamps.push(now);
    store.set(ip, timestamps);
    await next();
  };
}
