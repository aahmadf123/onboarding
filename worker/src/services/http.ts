import type { Context } from 'hono';
import type { AppEnv } from '../types';

/**
 * Reads a JSON body, returning null instead of throwing on malformed input.
 *
 * Several routes called c.req.json() bare. A malformed body — or no body at all
 * — threw, which app.onError turns into a 500. That is the wrong answer: the
 * request is the caller's mistake, not the server's, and a 500 tells monitoring
 * something is broken when nothing is.
 */
export async function readJson<T>(c: Context<AppEnv>): Promise<T | null> {
  try {
    const body = await c.req.json<T>();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
    return body;
  } catch {
    return null;
  }
}

/** The 400 that goes with a null from readJson. */
export function badBody(c: Context<AppEnv>) {
  return c.json({ success: false, error: 'Request body must be a JSON object' }, 400);
}

/**
 * Coerces an untrusted value to a trimmed string.
 *
 * Handlers called .trim() straight on values off the request, so a client
 * sending a number or null crashed the route with "x.trim is not a function"
 * and returned a 500.
 */
export function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Page bounds from ?limit / ?offset, with a hard ceiling.
 *
 * Every list endpoint was unbounded, so response size grew with the database
 * and a single request could pull the whole table. The ceiling applies even
 * when a caller asks for more, so the cap is not something a client can opt out
 * of.
 */
export const DEFAULT_PAGE_SIZE = 100;
export const MAX_PAGE_SIZE = 500;

export function pageBounds(c: Context<AppEnv>): { limit: number; offset: number } {
  const rawLimit = Number(c.req.query('limit'));
  const rawOffset = Number(c.req.query('offset'));
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  const offset = Number.isFinite(rawOffset) && rawOffset > 0 ? Math.floor(rawOffset) : 0;
  return { limit, offset };
}
