import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { AppEnv } from './types';
import { getIndexHtml } from './frontend';
import { authGate } from './middleware/auth';

import auth from './routes/auth';
import tasks from './routes/tasks';
import admin from './routes/admin';
import categories from './routes/categories';
import articles from './routes/articles';
import submissions from './routes/submissions';
import search from './routes/search';
import stats from './routes/stats';
import tips from './routes/tips';
import aiChat from './routes/ai-chat';
import quicklinks from './routes/quicklinks';
import contacts from './routes/contacts';
import systems from './routes/systems';
import policies from './routes/policies';

const app = new Hono<AppEnv>();

async function serveBrandingAsset(c: Context<AppEnv>, requestedPathname: string): Promise<Response> {
  const reqUrl = new URL(c.req.url);
  const basename = requestedPathname.split('/').filter(Boolean).pop() || '';

  // Try multiple path candidates because the ASSETS binding path semantics can
  // vary by deployment shape (root route vs prefixed route).
  const candidatePathnames = [
    requestedPathname,
    requestedPathname.replace(/^\/branding/, ''),
    basename ? `/${basename}` : '',
  ].filter((value, index, arr) => value && arr.indexOf(value) === index);

  let lastResponse: Response | null = null;
  for (const pathname of candidatePathnames) {
    const assetUrl = new URL(reqUrl.toString());
    assetUrl.pathname = pathname;
    const response = await c.env.ASSETS.fetch(new Request(assetUrl.toString(), c.req.raw));
    if (response.status !== 404) return response;
    lastResponse = response;
  }

  return lastResponse || c.text('Branding asset not found', 404);
}

// Security headers (incl. Content-Security-Policy) on every response.
// 'unsafe-inline'/'unsafe-eval' are required because the SPA compiles JSX in
// the browser with Babel-standalone and Tailwind is loaded via its CDN script;
// the policy still locks down object-src, base-uri, form-action, frame-ancestors,
// and restricts frame-src to Google Maps (the only embeds we render).
const secureHeadersMiddleware = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdnjs.cloudflare.com',
      'https://cdn.tailwindcss.com',
      'https://cdn.jsdelivr.net',
    ],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.tailwindcss.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'data:', 'https:'],
    frameSrc: ['https://www.google.com', 'https://maps.google.com'],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
  },
});

app.use(
  '*',
  async (c, next) => {
    const pathname = new URL(c.req.url).pathname;
    if (pathname.includes('/branding/')) {
      await next();
      return;
    }
    await secureHeadersMiddleware(c, next);
  }
);

// CORS for API routes — restricted to the worker's own origin. The SPA is
// served same-origin, so legitimate requests need no cross-origin grant; this
// stops other sites from reading API responses in a browser.
app.use(
  '/api/*',
  cors({
    origin: (origin, c) => {
      if (!origin) return null; // same-origin / non-CORS requests need no header
      try {
        return new URL(origin).host === new URL(c.req.url).host ? origin : null;
      } catch {
        return null;
      }
    },
  })
);

// Global auth gate: the portal is invite-only, so every API route except
// /api/auth/* requires a valid session (authGate skips auth paths itself).
app.use('/api/*', authGate);

// ── API routes ────────────────────────────────────────────────
app.route('/api/auth', auth);
app.route('/api/tasks', tasks);
app.route('/api/admin', admin);
app.route('/api/categories', categories);
app.route('/api/articles', articles);
app.route('/api/submissions', submissions);
app.route('/api/search', search);
app.route('/api/stats', stats);
app.route('/api/tips', tips);
app.route('/api/ai/chat', aiChat);
app.route('/api/quicklinks', quicklinks);
app.route('/api/contacts', contacts);
app.route('/api/systems', systems);
app.route('/api/policies', policies);

// ── Static assets (branding images) ───────────────────────────
app.get('/branding/*', async (c) => {
  const url = new URL(c.req.url);
  return serveBrandingAsset(c, url.pathname);
});

// ── API 404 + error handling ──────────────────────────────────
// Without these, an unmatched /api path fell through to the SPA catch-all and
// returned HTTP 200 with an HTML document, and a thrown handler returned
// Hono's plain-text 500. Both made the client's res.json() reject.
app.all('/api/*', (c) => c.json({ success: false, error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error('Unhandled error:', err instanceof Error ? err.stack ?? err.message : err);
  if (new URL(c.req.url).pathname.startsWith('/api/')) {
    return c.json({ success: false, error: 'Something went wrong. Please try again.' }, 500);
  }
  return c.text('Internal Server Error', 500);
});

// ── SPA fallback ──────────────────────────────────────────────
// For any non-API route, serve the React SPA shell (this also covers
// /reset-password, which the SPA handles client-side).
app.get('*', async (c) => {
  const pathname = new URL(c.req.url).pathname;
  const brandingPathIndex = pathname.indexOf('/branding/');

  // Handle prefixed routes like /onboarding/branding/... so assets still load
  // when the Worker is deployed under a path prefix.
  if (brandingPathIndex >= 0) {
    return serveBrandingAsset(c, pathname.slice(brandingPathIndex));
  }

  return c.html(getIndexHtml());
});

export default app;
