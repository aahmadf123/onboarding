import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Bindings } from './types';
import { getIndexHtml } from './frontend';

import categories from './routes/categories';
import articles from './routes/articles';
import users from './routes/users';
import submissions from './routes/submissions';
import search from './routes/search';
import stats from './routes/stats';
import tips from './routes/tips';
import orgchart from './routes/orgchart';
import aiChat from './routes/ai-chat';
import aiAssessment from './routes/ai-assessment';
import youtube from './routes/youtube';
import quicklinks from './routes/quicklinks';
import contacts from './routes/contacts';
import systems from './routes/systems';
import policies from './routes/policies';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all API routes
app.use('/api/*', cors());

// ── API routes ────────────────────────────────────────────────
app.route('/api/categories', categories);
app.route('/api/articles', articles);
app.route('/api/users', users);
app.route('/api/submissions', submissions);
app.route('/api/search', search);
app.route('/api/stats', stats);
app.route('/api/tips', tips);
app.route('/api/orgchart', orgchart);
app.route('/api/ai/chat', aiChat);
app.route('/api/ai/assessment', aiAssessment);
app.route('/api/youtube', youtube);
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
// For any non-API route, serve the React SPA shell
app.get('*', (c) => c.html(getIndexHtml()));

export default app;
