import { Hono } from 'hono';
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

// Security headers (incl. Content-Security-Policy) on every response.
// 'unsafe-inline'/'unsafe-eval' are required because the SPA compiles JSX in
// the browser with Babel-standalone and Tailwind is loaded via its CDN script;
// the policy still locks down object-src, base-uri, form-action, frame-ancestors,
// and restricts frame-src to Google Maps (the only embeds we render).
app.use(
  '*',
  secureHeaders({
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
  })
);

// CORS for API routes — restricted to the worker's own origin. The SPA is
// served same-origin, so legitimate requests need no cross-origin grant; this
// stops other sites from reading API responses in a browser.
app.use(
  '/api/*',
  cors({
    origin: (origin, c) => {
      if (!origin) return origin; // same-origin / non-CORS requests
      try {
        return new URL(origin).host === new URL(c.req.url).host ? origin : '';
      } catch {
        return '';
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
  url.pathname = url.pathname.replace(/^\/branding/, '');
  if (url.pathname === '' || url.pathname === '/') url.pathname = '/index.html';
  return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
});

// ── SPA fallback ──────────────────────────────────────────────
// For any non-API route, serve the React SPA shell (this also covers
// /reset-password, which the SPA handles client-side).
app.get('*', (c) => c.html(getIndexHtml()));

export default app;
