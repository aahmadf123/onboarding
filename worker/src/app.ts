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

// ── SPA fallback ──────────────────────────────────────────────
// For any non-API route, serve the React SPA shell
app.get('*', (c) => c.html(getIndexHtml()));

export default app;
