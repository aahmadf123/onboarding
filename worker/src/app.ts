import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

// Enable CORS for all API routes
app.use('/api/*', cors());

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
