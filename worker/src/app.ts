import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { AppEnv } from './types';
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
import feedback from './routes/feedback';

const app = new Hono<AppEnv>();

// Security headers on API responses.
//
// The SPA document and every other static asset are served without invoking
// this Worker (run_worker_first is scoped to /api/*), so their headers come
// from client/public/_headers instead. This policy therefore only has to cover
// JSON: no scripts, styles, fonts or frames are ever served from here.
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
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
app.route('/api/feedback', feedback);

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

// No SPA fallback route: assets.not_found_handling = "single-page-application"
// serves index.html for any navigation request that matches no asset, without
// invoking the Worker at all. That covers deep links like /article/23 and the
// /reset-password landing page. A catch-all here would only ever shadow it.

export default app;
