import { Context, Next } from 'hono';
import { Bindings } from '../types';

// Per-isolate fallback store (used only when no RATE_LIMIT KV binding exists).
// Cloudflare runs many isolates across the edge, so this alone does not enforce
// a global limit — bind a RATE_LIMIT KV namespace in wrangler.jsonc to make the
// window global. See MAINTENANCE.md.
const store = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 minute

function clientIp(c: Context<{ Bindings: Bindings }>): string {
  // cf-connecting-ip is set by Cloudflare and is not client-spoofable; prefer it.
  // x-forwarded-for is a client-controllable comma-separated list — only used as
  // a fallback, and normalized to the first entry.
  const cf = c.req.header('cf-connecting-ip');
  if (cf) return cf.trim();
  const xff = c.req.header('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown';
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
      // NOTE: KV is eventually consistent and this get/put is not atomic, so the
      // global limit is best-effort — bursts can slightly exceed it. Strict
      // enforcement would require a Durable Object counter. On any KV error we
      // fail open to the in-memory limiter below rather than reject the request.
      //
      // `next()` deliberately runs OUTSIDE the try: it used to sit inside, so a
      // throw from any downstream handler was swallowed here and the request
      // fell through to the in-memory branch, which called next() a second
      // time. That double-executed the handler (duplicate session inserts, a
      // second billed AI.run) and hid the original error.
      let allowed: boolean | null = null;
      try {
        const windowId = Math.floor(Date.now() / WINDOW_MS);
        const key = `rl:${ip}:${windowId}`;
        const current = parseInt((await kv.get(key)) ?? '0', 10) || 0;
        if (current >= maxRequests) {
          allowed = false;
        } else {
          // expirationTtl minimum is 60s; the bucket self-expires after the window.
          await kv.put(key, String(current + 1), { expirationTtl: 60 });
          allowed = true;
        }
      } catch (err) {
        // Degrading to the per-isolate limiter silently would hide the loss of
        // global rate limiting entirely, so say so.
        console.error(
          'RATE_LIMIT KV unavailable, falling back to per-isolate window:',
          err instanceof Error ? err.message : err
        );
      }

      if (allowed === false) return limited(c);
      if (allowed === true) return next();
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
