import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for frontend
app.use('/api/*', cors());

// ============================================================
// CATEGORIES
// ============================================================

// GET all categories
app.get('/api/categories', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM Categories').all();
  return c.json({ success: true, data: results });
});

// GET single category by ID
app.get('/api/categories/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare('SELECT * FROM Categories WHERE id = ?').bind(id).first();
  if (!result) return c.json({ success: false, error: 'Category not found' }, 404);
  return c.json({ success: true, data: result });
});

// ============================================================
// ARTICLES
// ============================================================

// GET all articles (with optional category filter and search)
app.get('/api/articles', async (c) => {
  const categoryId = c.req.query('category_id');
  const search = c.req.query('search');

  let query = `
    SELECT Articles.*, Categories.name as category_name
    FROM Articles
    LEFT JOIN Categories ON Articles.category_id = Categories.id
  `;
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (categoryId) {
    conditions.push('Articles.category_id = ?');
    bindings.push(categoryId);
  }

  if (search) {
    conditions.push('(Articles.title LIKE ? OR Articles.current_content LIKE ?)');
    bindings.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY Articles.category_id, Articles.id';

  const stmt = c.env.DB.prepare(query);
  const { results } = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
  return c.json({ success: true, data: results });
});

// GET single article by ID
app.get('/api/articles/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(`
    SELECT Articles.*, Categories.name as category_name
    FROM Articles
    LEFT JOIN Categories ON Articles.category_id = Categories.id
    WHERE Articles.id = ?
  `).bind(id).first();
  if (!result) return c.json({ success: false, error: 'Article not found' }, 404);
  return c.json({ success: true, data: result });
});

// GET articles by category
app.get('/api/categories/:id/articles', async (c) => {
  const id = c.req.param('id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM Articles WHERE category_id = ? ORDER BY id'
  ).bind(id).all();
  return c.json({ success: true, data: results });
});

// ============================================================
// USERS
// ============================================================

// GET all users
app.get('/api/users', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, email, role, created_at FROM Users').all();
  return c.json({ success: true, data: results });
});

// POST create user (or return existing)
app.post('/api/users', async (c) => {
  const body = await c.req.json<{ email: string }>();
  if (!body.email) return c.json({ success: false, error: 'Email is required' }, 400);

  // Check if user already exists
  const existing = await c.env.DB.prepare('SELECT id, email, role, created_at FROM Users WHERE email = ?')
    .bind(body.email).first();
  if (existing) {
    return c.json({ success: true, data: existing });
  }

  const info = await c.env.DB.prepare('INSERT INTO Users (email) VALUES (?)').bind(body.email).run();
  const user = await c.env.DB.prepare('SELECT id, email, role, created_at FROM Users WHERE id = ?')
    .bind(info.meta.last_row_id).first();
  return c.json({ success: true, data: user }, 201);
});

// GET user by email (login lookup)
app.get('/api/users/lookup', async (c) => {
  const email = c.req.query('email');
  if (!email) return c.json({ success: false, error: 'Email query param required' }, 400);

  const user = await c.env.DB.prepare('SELECT id, email, role, created_at FROM Users WHERE email = ?')
    .bind(email).first();
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);
  return c.json({ success: true, data: user });
});

// ============================================================
// SUBMISSIONS (Moderation Workflow)
// ============================================================

// GET all submissions (filterable by status)
app.get('/api/submissions', async (c) => {
  const status = c.req.query('status');

  let query = `
    SELECT Submissions.*, Users.email as author_email, Articles.title as article_title
    FROM Submissions
    LEFT JOIN Users ON Submissions.author_id = Users.id
    LEFT JOIN Articles ON Submissions.article_id = Articles.id
  `;
  const bindings: any[] = [];

  if (status) {
    query += ' WHERE Submissions.status = ?';
    bindings.push(status);
  }

  query += ' ORDER BY Submissions.submitted_at DESC';

  const stmt = c.env.DB.prepare(query);
  const { results } = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
  return c.json({ success: true, data: results });
});

// GET single submission
app.get('/api/submissions/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(`
    SELECT Submissions.*, Users.email as author_email, Articles.title as article_title
    FROM Submissions
    LEFT JOIN Users ON Submissions.author_id = Users.id
    LEFT JOIN Articles ON Submissions.article_id = Articles.id
    WHERE Submissions.id = ?
  `).bind(id).first();
  if (!result) return c.json({ success: false, error: 'Submission not found' }, 404);
  return c.json({ success: true, data: result });
});

// POST create a new submission
app.post('/api/submissions', async (c) => {
  const body = await c.req.json<{
    author_id: number;
    article_id?: number;
    proposed_title?: string;
    proposed_content: string;
  }>();

  if (!body.author_id || !body.proposed_content) {
    return c.json({ success: false, error: 'author_id and proposed_content are required' }, 400);
  }

  const info = await c.env.DB.prepare(
    'INSERT INTO Submissions (article_id, author_id, proposed_title, proposed_content) VALUES (?,?,?,?)'
  ).bind(body.article_id ?? null, body.author_id, body.proposed_title ?? null, body.proposed_content).run();

  return c.json({ success: true, message: 'Submission queued for moderation.', id: info.meta.last_row_id }, 201);
});

// PUT approve a submission (moderator action)
app.put('/api/submissions/:id/approve', async (c) => {
  const submissionId = c.req.param('id');
  const body = await c.req.json<{ reviewed_by: number; review_notes?: string }>();

  if (!body.reviewed_by) {
    return c.json({ success: false, error: 'reviewed_by is required' }, 400);
  }

  // Fetch the submission
  const submission = await c.env.DB.prepare('SELECT * FROM Submissions WHERE id = ? AND status = ?')
    .bind(submissionId, 'pending').first<{
      id: number; article_id: number | null; proposed_title: string | null;
      proposed_content: string; author_id: number;
    }>();

  if (!submission) {
    return c.json({ success: false, error: 'Submission not found or already reviewed' }, 404);
  }

  const now = new Date().toISOString();

  if (submission.article_id) {
    // Update existing article
    await c.env.DB.batch([
      c.env.DB.prepare('UPDATE Articles SET current_content = ?, last_updated = ? WHERE id = ?')
        .bind(submission.proposed_content, now, submission.article_id),
      c.env.DB.prepare('UPDATE Submissions SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ?')
        .bind('approved', body.reviewed_by, body.review_notes ?? null, submissionId),
    ]);
  } else {
    // Create new article — need a category_id from the body or default
    const categoryId = (await c.req.json<{ category_id?: number }>()).category_id ?? 1;
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO Articles (category_id, title, current_content, last_updated) VALUES (?,?,?,?)')
        .bind(categoryId, submission.proposed_title ?? 'Untitled', submission.proposed_content, now),
      c.env.DB.prepare('UPDATE Submissions SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ?')
        .bind('approved', body.reviewed_by, body.review_notes ?? null, submissionId),
    ]);
  }

  return c.json({ success: true, message: 'Submission approved and published.' });
});

// PUT reject a submission (moderator action)
app.put('/api/submissions/:id/reject', async (c) => {
  const submissionId = c.req.param('id');
  const body = await c.req.json<{ reviewed_by: number; review_notes?: string }>();

  if (!body.reviewed_by) {
    return c.json({ success: false, error: 'reviewed_by is required' }, 400);
  }

  const result = await c.env.DB.prepare(
    'UPDATE Submissions SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ? AND status = ?'
  ).bind('rejected', body.reviewed_by, body.review_notes ?? null, submissionId, 'pending').run();

  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Submission not found or already reviewed' }, 404);
  }

  return c.json({ success: true, message: 'Submission rejected.' });
});

// ============================================================
// SEARCH
// ============================================================

app.get('/api/search', async (c) => {
  const q = c.req.query('q');
  if (!q) return c.json({ success: false, error: 'Query parameter q is required' }, 400);

  const { results } = await c.env.DB.prepare(`
    SELECT Articles.*, Categories.name as category_name
    FROM Articles
    LEFT JOIN Categories ON Articles.category_id = Categories.id
    WHERE Articles.title LIKE ? OR Articles.current_content LIKE ?
    ORDER BY
      CASE WHEN Articles.title LIKE ? THEN 0 ELSE 1 END,
      Articles.category_id, Articles.id
  `).bind(`%${q}%`, `%${q}%`, `%${q}%`).all();

  return c.json({ success: true, data: results, query: q });
});

// ============================================================
// STATS (for dashboard)
// ============================================================

app.get('/api/stats', async (c) => {
  const [articles, categories, pendingSubmissions, totalUsers] = await c.env.DB.batch([
    c.env.DB.prepare('SELECT COUNT(*) as count FROM Articles'),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM Categories'),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM Submissions WHERE status = 'pending'"),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM Users'),
  ]);

  return c.json({
    success: true,
    data: {
      articles: (articles.results[0] as any).count,
      categories: (categories.results[0] as any).count,
      pending_submissions: (pendingSubmissions.results[0] as any).count,
      total_users: (totalUsers.results[0] as any).count,
    },
  });
});

// ============================================================
// Serve frontend static files (SPA fallback)
// ============================================================

// For any non-API route, serve the SPA
app.get('*', async (c) => {
  // In production with Pages, this won't be hit.
  // For Worker-only deployment, return a basic HTML shell that loads the SPA
  return c.html(getIndexHtml());
});

function getIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Toledo Athletics Onboarding</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.26.9/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'toledo-blue': '#003E7E',
            'toledo-gold': '#FFCE00',
            'toledo-dark': '#002855',
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .prose p { margin-bottom: 1rem; line-height: 1.75; }
    .prose a { color: #003E7E; text-decoration: underline; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-gray-50">
  <div id="root"></div>
  <script type="text/babel" data-type="module">
${getFrontendCode()}
  </script>
</body>
</html>`;
}

function getFrontendCode(): string {
  return `
const { useState, useEffect, useCallback, useMemo } = React;

// ============================================================
// API Helper
// ============================================================
const API_BASE = '/api';

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res.json();
}

// ============================================================
// Icons (inline SVG components)
// ============================================================
function IconSearch() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' })
  );
}

function IconBook() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
  );
}

function IconPlus() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 4v16m8-8H4' })
  );
}

function IconShield() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
  );
}

function IconCheck() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M5 13l4 4L19 7' })
  );
}

function IconX() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
  );
}

function IconArrowLeft() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M10 19l-7-7m0 0l7-7m-7 7h18' })
  );
}

function IconHome() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' })
  );
}

// Category icons mapping
const CATEGORY_ICONS = {
  'Department Overview': '🏛️',
  'NCAA Compliance': '📋',
  'Title IX & Gender Equity': '⚖️',
  'NIL (Name, Image & Likeness)': '💼',
  'HR & Benefits': '👤',
  'IT & Campus Access': '💻',
  'Parking & Transportation': '🅿️',
  'Student-Athlete Development': '🎓',
  'Relocation & Toledo Life': '🏠',
};

// ============================================================
// Components
// ============================================================

// --- Header ---
function Header({ currentUser, onNavigate, currentView }) {
  return React.createElement('header', { className: 'bg-toledo-blue text-white shadow-lg sticky top-0 z-50' },
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
      React.createElement('div', { className: 'flex items-center justify-between h-16' },
        React.createElement('div', { className: 'flex items-center gap-3 cursor-pointer', onClick: () => onNavigate('home') },
          React.createElement('div', { className: 'bg-toledo-gold text-toledo-blue font-extrabold text-lg w-10 h-10 rounded-lg flex items-center justify-center' }, 'UT'),
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-lg font-bold leading-tight' }, 'Toledo Athletics'),
            React.createElement('p', { className: 'text-xs text-blue-200 leading-tight' }, 'Onboarding Portal')
          )
        ),
        React.createElement('nav', { className: 'hidden md:flex items-center gap-1' },
          React.createElement('button', {
            onClick: () => onNavigate('home'),
            className: 'px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
              (currentView === 'home' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'Home'),
          React.createElement('button', {
            onClick: () => onNavigate('categories'),
            className: 'px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
              (currentView === 'categories' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'Browse'),
          React.createElement('button', {
            onClick: () => onNavigate('submit'),
            className: 'px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
              (currentView === 'submit' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'Contribute'),
          currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator') &&
            React.createElement('button', {
              onClick: () => onNavigate('moderate'),
              className: 'px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
                (currentView === 'moderate' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
            }, 'Moderate')
        ),
        React.createElement('div', { className: 'flex items-center gap-3' },
          currentUser
            ? React.createElement('div', { className: 'flex items-center gap-2' },
                React.createElement('div', { className: 'w-8 h-8 bg-toledo-gold text-toledo-blue rounded-full flex items-center justify-center text-sm font-bold' },
                  currentUser.email[0].toUpperCase()
                ),
                React.createElement('span', { className: 'text-sm text-blue-200 hidden sm:inline' }, currentUser.email)
              )
            : null
        )
      )
    )
  );
}

// --- Search Bar ---
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }

  return React.createElement('form', { onSubmit: handleSubmit, className: 'relative' },
    React.createElement('div', { className: 'relative' },
      React.createElement('div', { className: 'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400' },
        React.createElement(IconSearch)
      ),
      React.createElement('input', {
        type: 'text',
        value: query,
        onChange: (e) => setQuery(e.target.value),
        placeholder: 'Search articles, policies, procedures...',
        className: 'w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-toledo-blue focus:border-transparent shadow-sm text-sm'
      })
    )
  );
}

// --- Home Page ---
function HomePage({ categories, stats, onNavigate, onSearch }) {
  return React.createElement('div', { className: 'fade-in' },
    // Hero
    React.createElement('div', { className: 'bg-gradient-to-br from-toledo-blue via-toledo-dark to-toledo-blue text-white py-16' },
      React.createElement('div', { className: 'max-w-4xl mx-auto px-4 text-center' },
        React.createElement('h1', { className: 'text-4xl md:text-5xl font-extrabold mb-4 tracking-tight' }, 'Welcome to Toledo Athletics'),
        React.createElement('p', { className: 'text-xl text-blue-200 mb-8 max-w-2xl mx-auto' },
          'Your complete onboarding guide — everything you need to succeed from day one.'
        ),
        React.createElement('div', { className: 'max-w-xl mx-auto' },
          React.createElement(SearchBar, { onSearch })
        )
      )
    ),

    // Stats bar
    stats && React.createElement('div', { className: 'bg-white border-b' },
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-4' },
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
          [
            { label: 'Categories', value: stats.categories, color: 'text-toledo-blue' },
            { label: 'Articles', value: stats.articles, color: 'text-green-600' },
            { label: 'Team Members', value: stats.total_users, color: 'text-purple-600' },
            { label: 'Pending Reviews', value: stats.pending_submissions, color: 'text-orange-500' },
          ].map((s, i) =>
            React.createElement('div', { key: i, className: 'text-center' },
              React.createElement('div', { className: 'text-2xl font-bold ' + s.color }, s.value),
              React.createElement('div', { className: 'text-xs text-gray-500 mt-0.5' }, s.label)
            )
          )
        )
      )
    ),

    // Categories grid
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-12' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, 'Onboarding Categories'),
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
        categories.map((cat) =>
          React.createElement('button', {
            key: cat.id,
            onClick: () => onNavigate('category', cat.id),
            className: 'bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all group'
          },
            React.createElement('div', { className: 'flex items-start gap-3' },
              React.createElement('span', { className: 'text-2xl' }, CATEGORY_ICONS[cat.name] || '📄'),
              React.createElement('div', null,
                React.createElement('h3', { className: 'font-semibold text-gray-900 group-hover:text-toledo-blue transition-colors' }, cat.name),
                React.createElement('p', { className: 'text-sm text-gray-500 mt-1 line-clamp-2' }, cat.description)
              )
            )
          )
        )
      )
    )
  );
}

// --- Category Detail View ---
function CategoryView({ categoryId, onNavigate }) {
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api('/categories/' + categoryId).then(r => r.success && setCategory(r.data));
    api('/categories/' + categoryId + '/articles').then(r => r.success && setArticles(r.data));
  }, [categoryId]);

  if (!category) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', {
      onClick: () => onNavigate('home'),
      className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium'
    }, React.createElement(IconArrowLeft), 'Back to Home'),

    React.createElement('div', { className: 'flex items-center gap-3 mb-8' },
      React.createElement('span', { className: 'text-3xl' }, CATEGORY_ICONS[category.name] || '📄'),
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, category.name),
        React.createElement('p', { className: 'text-gray-500 mt-1' }, category.description)
      )
    ),

    articles.length === 0
      ? React.createElement('p', { className: 'text-gray-500 text-center py-8' }, 'No articles in this category yet.')
      : React.createElement('div', { className: 'space-y-3' },
          articles.map((article) =>
            React.createElement('button', {
              key: article.id,
              onClick: () => onNavigate('article', article.id),
              className: 'w-full bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all'
            },
              React.createElement('h3', { className: 'font-semibold text-gray-900' }, article.title),
              React.createElement('p', { className: 'text-sm text-gray-500 mt-1 line-clamp-2' },
                article.current_content ? article.current_content.substring(0, 200) + '...' : ''
              ),
              React.createElement('p', { className: 'text-xs text-gray-400 mt-2' },
                'Last updated: ' + new Date(article.last_updated).toLocaleDateString()
              )
            )
          )
        )
  );
}

// --- Article Detail View ---
function ArticleView({ articleId, onNavigate }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    api('/articles/' + articleId).then(r => r.success && setArticle(r.data));
  }, [articleId]);

  if (!article) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');

  // Format content: convert URLs to links and preserve line breaks
  function formatContent(text) {
    if (!text) return [];
    const paragraphs = text.split('\\n\\n');
    return paragraphs.map((p, i) => {
      const lines = p.split('\\n');
      const children = [];
      lines.forEach((line, j) => {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
        const parts = line.split(urlRegex);
        parts.forEach((part, k) => {
          if (urlRegex.test(part)) {
            children.push(React.createElement('a', {
              key: j + '-' + k,
              href: part,
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'text-toledo-blue underline hover:text-toledo-dark break-all'
            }, part));
          } else {
            children.push(part);
          }
        });
        if (j < lines.length - 1) children.push(React.createElement('br', { key: 'br-' + j }));
      });
      return React.createElement('p', { key: i, className: 'mb-4 leading-relaxed text-gray-700' }, ...children);
    });
  }

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', {
      onClick: () => article.category_id ? onNavigate('category', article.category_id) : onNavigate('home'),
      className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium'
    }, React.createElement(IconArrowLeft), 'Back'),

    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 shadow-sm' },
      React.createElement('div', { className: 'p-6 md:p-8 border-b' },
        article.category_name && React.createElement('span', {
          className: 'inline-block px-3 py-1 bg-toledo-blue/10 text-toledo-blue text-xs font-medium rounded-full mb-3'
        }, article.category_name),
        React.createElement('h1', { className: 'text-2xl md:text-3xl font-bold text-gray-900' }, article.title),
        React.createElement('p', { className: 'text-sm text-gray-400 mt-2' },
          'Last updated: ' + new Date(article.last_updated).toLocaleDateString()
        )
      ),
      React.createElement('div', { className: 'p-6 md:p-8 prose max-w-none' },
        ...formatContent(article.current_content)
      )
    )
  );
}

// --- Search Results ---
function SearchResults({ query, onNavigate }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api('/search?q=' + encodeURIComponent(query)).then(r => {
      if (r.success) setResults(r.data);
      setLoading(false);
    });
  }, [query]);

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', {
      onClick: () => onNavigate('home'),
      className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium'
    }, React.createElement(IconArrowLeft), 'Back to Home'),

    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Search Results'),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, 'Showing results for "' + query + '"'),

    loading
      ? React.createElement('p', { className: 'text-center text-gray-500 py-8' }, 'Searching...')
      : results.length === 0
        ? React.createElement('p', { className: 'text-center text-gray-500 py-8' }, 'No results found. Try a different search term.')
        : React.createElement('div', { className: 'space-y-3' },
            results.map((article) =>
              React.createElement('button', {
                key: article.id,
                onClick: () => onNavigate('article', article.id),
                className: 'w-full bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all'
              },
                React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
                  article.category_name && React.createElement('span', {
                    className: 'px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full'
                  }, article.category_name)
                ),
                React.createElement('h3', { className: 'font-semibold text-gray-900' }, article.title),
                React.createElement('p', { className: 'text-sm text-gray-500 mt-1 line-clamp-2' },
                  article.current_content ? article.current_content.substring(0, 200) + '...' : ''
                )
              )
            )
          )
  );
}

// --- Submit Contribution Form ---
function SubmitForm({ currentUser, categories, onNavigate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [articleId, setArticleId] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [articles, setArticles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api('/articles').then(r => r.success && setArticles(r.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);

    const payload = {
      author_id: currentUser.id,
      proposed_content: content,
      proposed_title: isNew ? title : undefined,
      article_id: !isNew && articleId ? parseInt(articleId) : undefined,
    };

    const res = await api('/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.success) {
      setSubmitted(true);
      setTitle('');
      setContent('');
      setArticleId('');
    }
  }

  if (!currentUser) {
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 text-center' },
      React.createElement('p', { className: 'text-gray-500' }, 'Please log in to contribute.')
    );
  }

  if (submitted) {
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 text-center fade-in' },
      React.createElement('div', { className: 'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4' },
        React.createElement(IconCheck)
      ),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Submission Received!'),
      React.createElement('p', { className: 'text-gray-500 mb-6' }, 'Your contribution has been queued for moderation. Thank you for helping improve our onboarding resources.'),
      React.createElement('button', {
        onClick: () => setSubmitted(false),
        className: 'px-6 py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium'
      }, 'Submit Another')
    );
  }

  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', {
      onClick: () => onNavigate('home'),
      className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium'
    }, React.createElement(IconArrowLeft), 'Back to Home'),

    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Contribute Knowledge'),
    React.createElement('p', { className: 'text-gray-500 mb-8' }, 'Share your insights to improve onboarding for future staff members. Submissions are reviewed by moderators before publishing.'),

    React.createElement('form', { onSubmit: handleSubmit, className: 'bg-white rounded-xl border border-gray-200 p-6 space-y-6' },
      // New vs Edit toggle
      React.createElement('div', { className: 'flex gap-4' },
        React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer' },
          React.createElement('input', { type: 'radio', checked: isNew, onChange: () => setIsNew(true), className: 'text-toledo-blue' }),
          React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Propose new article')
        ),
        React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer' },
          React.createElement('input', { type: 'radio', checked: !isNew, onChange: () => setIsNew(false), className: 'text-toledo-blue' }),
          React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Suggest edit to existing')
        )
      ),

      // Title (for new articles)
      isNew && React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Article Title'),
        React.createElement('input', {
          type: 'text', value: title, onChange: (e) => setTitle(e.target.value), required: isNew,
          placeholder: 'Enter a descriptive title',
          className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue focus:border-transparent text-sm'
        })
      ),

      // Article selector (for edits)
      !isNew && React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Select Article to Edit'),
        React.createElement('select', {
          value: articleId, onChange: (e) => setArticleId(e.target.value), required: !isNew,
          className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue focus:border-transparent text-sm'
        },
          React.createElement('option', { value: '' }, '-- Select an article --'),
          articles.map(a => React.createElement('option', { key: a.id, value: a.id }, a.title))
        )
      ),

      // Content
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' },
          isNew ? 'Article Content' : 'Proposed Changes'
        ),
        React.createElement('textarea', {
          value: content, onChange: (e) => setContent(e.target.value), required: true, rows: 10,
          placeholder: isNew ? 'Write the article content here...' : 'Describe your proposed changes or provide the updated content...',
          className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue focus:border-transparent text-sm resize-y'
        })
      ),

      React.createElement('button', {
        type: 'submit', disabled: submitting,
        className: 'w-full py-3 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium disabled:opacity-50'
      }, submitting ? 'Submitting...' : 'Submit for Review')
    )
  );
}

// --- Moderation Dashboard ---
function ModerationDashboard({ currentUser, onNavigate }) {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const loadSubmissions = useCallback(() => {
    api('/submissions?status=' + filter).then(r => r.success && setSubmissions(r.data));
  }, [filter]);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  async function handleAction(id, action) {
    setProcessing(id);
    await api('/submissions/' + id + '/' + action, {
      method: 'PUT',
      body: JSON.stringify({ reviewed_by: currentUser.id, review_notes: reviewNotes }),
    });
    setReviewNotes('');
    setProcessing(null);
    loadSubmissions();
  }

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', {
      onClick: () => onNavigate('home'),
      className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium'
    }, React.createElement(IconArrowLeft), 'Back to Home'),

    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Moderation Queue'),
        React.createElement('p', { className: 'text-gray-500 text-sm mt-1' }, 'Review and manage employee submissions')
      )
    ),

    // Filter tabs
    React.createElement('div', { className: 'flex gap-2 mb-6' },
      ['pending', 'approved', 'rejected'].map(s =>
        React.createElement('button', {
          key: s,
          onClick: () => setFilter(s),
          className: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
            (filter === s
              ? s === 'pending' ? 'bg-orange-100 text-orange-700' : s === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
        }, s.charAt(0).toUpperCase() + s.slice(1))
      )
    ),

    submissions.length === 0
      ? React.createElement('div', { className: 'text-center py-12 text-gray-500' },
          React.createElement('p', null, 'No ' + filter + ' submissions.')
        )
      : React.createElement('div', { className: 'space-y-4' },
          submissions.map(sub =>
            React.createElement('div', { key: sub.id, className: 'bg-white rounded-xl border border-gray-200 p-5' },
              React.createElement('div', { className: 'flex items-start justify-between mb-3' },
                React.createElement('div', null,
                  React.createElement('h3', { className: 'font-semibold text-gray-900' },
                    sub.proposed_title || (sub.article_title ? 'Edit: ' + sub.article_title : 'Submission #' + sub.id)
                  ),
                  React.createElement('div', { className: 'flex items-center gap-3 mt-1 text-xs text-gray-500' },
                    React.createElement('span', null, 'By: ' + (sub.author_email || 'Unknown')),
                    React.createElement('span', null, new Date(sub.submitted_at).toLocaleString()),
                    sub.article_id
                      ? React.createElement('span', { className: 'px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full' }, 'Edit')
                      : React.createElement('span', { className: 'px-2 py-0.5 bg-green-100 text-green-700 rounded-full' }, 'New')
                  )
                ),
                React.createElement('span', {
                  className: 'px-2 py-0.5 rounded-full text-xs font-medium ' +
                    (sub.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                     sub.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                }, sub.status)
              ),
              React.createElement('div', { className: 'bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto mb-3' },
                sub.proposed_content
              ),
              sub.review_notes && React.createElement('div', { className: 'bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mb-3' },
                React.createElement('strong', null, 'Review notes: '), sub.review_notes
              ),
              filter === 'pending' && React.createElement('div', { className: 'space-y-3' },
                React.createElement('textarea', {
                  value: processing === sub.id ? reviewNotes : '',
                  onChange: (e) => { setProcessing(sub.id); setReviewNotes(e.target.value); },
                  placeholder: 'Optional review notes...',
                  rows: 2,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue'
                }),
                React.createElement('div', { className: 'flex gap-2' },
                  React.createElement('button', {
                    onClick: () => handleAction(sub.id, 'approve'),
                    disabled: processing === sub.id,
                    className: 'flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50'
                  }, React.createElement(IconCheck), 'Approve & Publish'),
                  React.createElement('button', {
                    onClick: () => handleAction(sub.id, 'reject'),
                    disabled: processing === sub.id,
                    className: 'flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50'
                  }, React.createElement(IconX), 'Reject')
                )
              )
            )
          )
        )
  );
}

// --- Login Screen ---
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Try to find or create user
    const res = await api('/users', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    if (res.success) {
      onLogin(res.data);
    } else {
      setError(res.error || 'Login failed');
    }
  }

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-toledo-blue via-toledo-dark to-toledo-blue flex items-center justify-center px-4' },
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in' },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('div', { className: 'w-16 h-16 bg-toledo-gold text-toledo-blue font-extrabold text-2xl rounded-xl flex items-center justify-center mx-auto mb-4' }, 'UT'),
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Toledo Athletics'),
        React.createElement('p', { className: 'text-gray-500 mt-1' }, 'Onboarding Portal')
      ),
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'University Email'),
          React.createElement('input', {
            type: 'email', value: email, onChange: (e) => setEmail(e.target.value), required: true,
            placeholder: 'your.name@utoledo.edu',
            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue focus:border-transparent'
          })
        ),
        error && React.createElement('p', { className: 'text-red-500 text-sm' }, error),
        React.createElement('button', {
          type: 'submit', disabled: loading,
          className: 'w-full py-3 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors font-medium disabled:opacity-50'
        }, loading ? 'Signing in...' : 'Sign In'),
        React.createElement('p', { className: 'text-xs text-gray-400 text-center mt-4' },
          'Enter your university email to access the onboarding portal.'
        )
      )
    )
  );
}

// ============================================================
// App (Router)
// ============================================================
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('home');
  const [viewParam, setViewParam] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api('/categories').then(r => r.success && setCategories(r.data));
    api('/stats').then(r => r.success && setStats(r.data));
  }, []);

  function navigate(newView, param = null) {
    setView(newView);
    setViewParam(param);
    window.scrollTo(0, 0);
  }

  function handleSearch(query) {
    navigate('search', query);
  }

  if (!currentUser) {
    return React.createElement(LoginScreen, { onLogin: setCurrentUser });
  }

  let content;
  switch (view) {
    case 'home':
      content = React.createElement(HomePage, { categories, stats, onNavigate: navigate, onSearch: handleSearch });
      break;
    case 'categories':
      content = React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-8 fade-in' },
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-6' }, 'All Categories'),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
          categories.map((cat) =>
            React.createElement('button', {
              key: cat.id,
              onClick: () => navigate('category', cat.id),
              className: 'bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all group'
            },
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('span', { className: 'text-2xl' }, CATEGORY_ICONS[cat.name] || '📄'),
                React.createElement('div', null,
                  React.createElement('h3', { className: 'font-semibold text-gray-900 group-hover:text-toledo-blue' }, cat.name),
                  React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, cat.description)
                )
              )
            )
          )
        )
      );
      break;
    case 'category':
      content = React.createElement(CategoryView, { categoryId: viewParam, onNavigate: navigate });
      break;
    case 'article':
      content = React.createElement(ArticleView, { articleId: viewParam, onNavigate: navigate });
      break;
    case 'search':
      content = React.createElement(SearchResults, { query: viewParam, onNavigate: navigate });
      break;
    case 'submit':
      content = React.createElement(SubmitForm, { currentUser, categories, onNavigate: navigate });
      break;
    case 'moderate':
      content = React.createElement(ModerationDashboard, { currentUser, onNavigate: navigate });
      break;
    default:
      content = React.createElement(HomePage, { categories, stats, onNavigate: navigate, onSearch: handleSearch });
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
    React.createElement(Header, { currentUser, onNavigate: navigate, currentView: view }),
    content
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
`;
}

export default app;
