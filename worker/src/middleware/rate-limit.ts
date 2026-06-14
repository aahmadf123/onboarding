import { Context, Next } from 'hono';
import { Bindings } from '../types';

// Per-isolate fallback store (used only when no RATE_LIMIT KV binding exists).
// Cloudflare runs many isolates across the edge, so this alone does not enforce
// a global limit — bind a RATE_LIMIT KV namespace in wrangler.jsonc to make the
// window global. See MAINTENANCE.md.
const store = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 minute

function clientIp(c: Context<{ Bindings: Bindings }>): string {
  return (
    c.req.header('cf-connecting-ip') ??
    c.req.header('x-forwarded-for') ??
    'unknown'
  );
}

const limited = (c: Context<{ Bindings: Bindings }>) =>
  c.json(
    { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
    429
  );

/**
 * Returns middleware that allows at most `maxRequests` calls per minute from a
 * single IP. Uses a global KV fixed-window counter when `RATE_LIMIT` is bound;
 * otherwise falls back to a per-isolate in-memory rolling window.
 */
export function rateLimit(maxRequests: number) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const ip = clientIp(c);
    const kv = c.env.RATE_LIMIT;

    if (kv) {
      // Global fixed-window counter keyed by IP + current minute bucket.
      const windowId = Math.floor(Date.now() / WINDOW_MS);
      const key = `rl:${ip}:${windowId}`;
      const current = parseInt((await kv.get(key)) ?? '0', 10) || 0;
      if (current >= maxRequests) return limited(c);
      // expirationTtl minimum is 60s; the bucket self-expires after the window.
      await kv.put(key, String(current + 1), { expirationTtl: 60 });
      await next();
      return;
    }

    // In-memory fallback (per isolate).
    const now = Date.now();
    const timestamps = (store.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (timestamps.length >= maxRequests) return limited(c);
    timestamps.push(now);
    store.set(ip, timestamps);
    await next();
  };
}
