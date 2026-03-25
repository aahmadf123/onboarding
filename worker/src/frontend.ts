// HTML shell that serves the React SPA from the Worker.
// Toledo branding colors: #003E7E (blue), #FFCE00 (gold), #002855 (dark)

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
const { useState, useEffect, useCallback, useMemo, useRef } = React;

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

function IconChat() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' })
  );
}

function IconVideo() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' })
  );
}

function IconOrg() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
  );
}

function IconLightbulb() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' })
  );
}

function IconBrain() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2' })
  );
}

function IconBookmark() {
  return React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' })
  );
}

function IconFlag() {
  return React.createElement('svg', { className: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' })
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
        React.createElement('nav', { className: 'hidden md:flex items-center gap-0.5' },
          React.createElement('button', {
            onClick: () => onNavigate('home'),
            className: 'px-2 py-2 rounded-lg text-xs font-medium transition-colors ' +
              (currentView === 'home' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'Home'),
          React.createElement('button', {
            onClick: () => onNavigate('categories'),
            className: 'px-2 py-2 rounded-lg text-xs font-medium transition-colors ' +
              (currentView === 'categories' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'Browse'),
          React.createElement('button', {
            onClick: () => onNavigate('tips'),
            className: 'px-2 py-2 rounded-lg text-xs font-medium transition-colors ' +
              (currentView === 'tips' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'Tips'),
          React.createElement('button', {
            onClick: () => onNavigate('orgchart'),
            className: 'px-2 py-2 rounded-lg text-xs font-medium transition-colors ' +
              (currentView === 'orgchart' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'Org Chart'),
          React.createElement('button', {
            onClick: () => onNavigate('ai-hub'),
            className: 'px-2 py-2 rounded-lg text-xs font-medium transition-colors ' +
              (currentView === 'ai-hub' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'AI Hub'),
          React.createElement('button', {
            onClick: () => onNavigate('youtube'),
            className: 'px-2 py-2 rounded-lg text-xs font-medium transition-colors ' +
              (currentView === 'youtube' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'Videos'),
          React.createElement('button', {
            onClick: () => onNavigate('submit'),
            className: 'px-2 py-2 rounded-lg text-xs font-medium transition-colors ' +
              (currentView === 'submit' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white')
          }, 'Contribute'),
          currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator') &&
            React.createElement('button', {
              onClick: () => onNavigate('moderate'),
              className: 'px-2 py-2 rounded-lg text-xs font-medium transition-colors ' +
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
        React.createElement('p', { className: 'text-gray-500 text-sm mt-1' }, 'Review and manage article submissions')
      ),
      React.createElement('button', {
        onClick: () => onNavigate('tips-moderate'),
        className: 'flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'
      }, React.createElement(IconLightbulb), 'Tips Queue')
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

// --- Org Chart ---
function OrgChartNodeItem({ node, depth }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return React.createElement('div', { className: 'select-none' },
    React.createElement('div', {
      className: 'flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer group',
      style: { marginLeft: (depth * 24) + 'px' },
      onClick: () => hasChildren && setExpanded(!expanded)
    },
      React.createElement('div', { className: 'w-5 flex-shrink-0 text-center text-gray-400 text-xs' },
        hasChildren ? (expanded ? '▼' : '▶') : ''
      ),
      React.createElement('div', { className: 'w-9 h-9 bg-toledo-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0' },
        node.name.charAt(0).toUpperCase()
      ),
      React.createElement('div', { className: 'min-w-0 flex-1' },
        React.createElement('div', { className: 'font-medium text-gray-900 text-sm truncate' }, node.name),
        React.createElement('div', { className: 'text-xs text-gray-500 truncate' }, node.title),
        node.department && React.createElement('div', { className: 'text-xs text-toledo-blue truncate' }, node.department)
      ),
      node.email && React.createElement('a', {
        href: 'mailto:' + node.email,
        onClick: (e) => e.stopPropagation(),
        className: 'hidden group-hover:inline ml-2 text-xs text-toledo-blue hover:underline flex-shrink-0'
      }, node.email),
      node.phone && React.createElement('span', { className: 'hidden group-hover:inline ml-2 text-xs text-gray-400 flex-shrink-0' }, node.phone)
    ),
    expanded && hasChildren && React.createElement('div', null,
      node.children.map(child =>
        React.createElement(OrgChartNodeItem, { key: child.id, node: child, depth: depth + 1 })
      )
    )
  );
}

function OrgChartPage({ onNavigate }) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orgchart').then(r => {
      if (r.success) setNodes(r.data);
      else setError('Failed to load org chart.');
      setLoading(false);
    });
  }, []);

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', {
      onClick: () => onNavigate('home'),
      className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium'
    }, React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('div', { className: 'flex items-center gap-3 mb-1' },
      React.createElement(IconOrg),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Organizational Chart')
    ),
    React.createElement('p', { className: 'text-gray-500 mb-1 text-sm' }, 'Full Toledo Athletics staff structure. Click any row to expand or collapse. Hover to see contact details.'),
    React.createElement('p', { className: 'text-xs text-gray-400 mb-6' }, 'Last updated: ' + new Date().toLocaleDateString() + ' · Maintained by: Athletics Administration'),
    loading
      ? React.createElement('div', { className: 'text-center py-12 text-gray-500' }, 'Loading...')
      : error
        ? React.createElement('div', { className: 'text-center py-12 text-red-500' }, error)
        : nodes.length === 0
          ? React.createElement('div', { className: 'text-center py-12 text-gray-500' },
              React.createElement('p', { className: 'text-lg mb-2' }, '🏗️'),
              React.createElement('p', null, 'Org chart data is not yet populated.'),
              React.createElement('p', { className: 'text-xs text-gray-400 mt-2' }, 'An admin can seed initial data via the database.')
            )
          : React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-4' },
              nodes.map(node =>
                React.createElement(OrgChartNodeItem, { key: node.id, node: node, depth: 0 })
              )
            )
  );
}

// --- Employee Tips ---
function TipsPage({ currentUser, categories, onNavigate }) {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [feedbackTipId, setFeedbackTipId] = useState(null);
  const [feedbackReason, setFeedbackReason] = useState('');
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [feedbackDone, setFeedbackDone] = useState(false);

  function loadTips() {
    setLoading(true);
    let path = '/tips?status=approved';
    if (selectedCategory) path += '&category_id=' + selectedCategory;
    if (selectedTag) path += '&tag=' + encodeURIComponent(selectedTag);
    api(path).then(r => { if (r.success) setTips(r.data); setLoading(false); });
  }

  useEffect(() => { loadTips(); }, [selectedCategory, selectedTag]);

  async function submitFeedback(tipId) {
    if (!feedbackReason || !currentUser) return;
    await api('/tips/' + tipId + '/feedback', {
      method: 'POST',
      body: JSON.stringify({ reporter_id: currentUser.id, reason: feedbackReason, details: feedbackDetails })
    });
    setFeedbackTipId(null);
    setFeedbackReason('');
    setFeedbackDetails('');
    setFeedbackDone(true);
    setTimeout(() => setFeedbackDone(false), 3000);
  }

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('div', { className: 'flex items-start justify-between mb-2' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement(IconLightbulb),
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Employee Tips & Advice'),
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Wisdom from your colleagues — reviewed by moderators before publishing')
        )
      ),
      React.createElement('button', {
        onClick: () => onNavigate('tip-submit'),
        className: 'flex items-center gap-2 px-4 py-2 bg-toledo-blue text-white rounded-lg text-sm font-medium hover:bg-toledo-dark transition-colors'
      }, React.createElement(IconPlus), 'Share a Tip')
    ),
    React.createElement('p', { className: 'text-xs text-gray-400 mb-5 ml-8' }, 'Last updated: ' + new Date().toLocaleDateString() + ' · Page owner: Staff Moderators · Use the 🚩 flag to report outdated info'),

    feedbackDone && React.createElement('div', { className: 'mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm' }, '✓ Feedback submitted. Thank you!'),

    React.createElement('div', { className: 'flex gap-3 mb-6 flex-wrap' },
      React.createElement('select', {
        value: selectedCategory, onChange: e => setSelectedCategory(e.target.value),
        className: 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue'
      },
        React.createElement('option', { value: '' }, 'All Categories'),
        categories.map(cat => React.createElement('option', { key: cat.id, value: cat.id }, cat.name))
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('input', {
          type: 'text', value: selectedTag, onChange: e => setSelectedTag(e.target.value),
          placeholder: 'Filter by tag...',
          className: 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue w-36'
        }),
        selectedTag && React.createElement('button', { onClick: () => setSelectedTag(''), className: 'text-gray-400 hover:text-gray-600 text-xs' }, React.createElement(IconX))
      )
    ),

    loading
      ? React.createElement('p', { className: 'text-center py-8 text-gray-500' }, 'Loading tips...')
      : tips.length === 0
        ? React.createElement('div', { className: 'text-center py-12 text-gray-500' },
            React.createElement('p', { className: 'text-4xl mb-3' }, '💡'),
            React.createElement('p', null, 'No tips found.'),
            React.createElement('button', {
              onClick: () => onNavigate('tip-submit'),
              className: 'mt-4 px-4 py-2 bg-toledo-blue text-white rounded-lg text-sm hover:bg-toledo-dark'
            }, 'Be the first to share a tip!')
          )
        : React.createElement('div', { className: 'space-y-4' },
            tips.map(tip =>
              React.createElement('div', { key: tip.id, className: 'bg-white rounded-xl border border-gray-200 p-5 shadow-sm' },
                React.createElement('div', { className: 'flex items-start justify-between mb-2' },
                  React.createElement('div', { className: 'flex-1 min-w-0 mr-3' },
                    React.createElement('h3', { className: 'font-semibold text-gray-900' }, tip.title),
                    React.createElement('div', { className: 'flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap' },
                      tip.category_name && React.createElement('span', { className: 'px-2 py-0.5 bg-toledo-blue/10 text-toledo-blue rounded-full' }, tip.category_name),
                      React.createElement('span', null, 'By: ' + (tip.author_email || 'Anonymous')),
                      tip.approved_at && React.createElement('span', null, new Date(tip.approved_at).toLocaleDateString())
                    )
                  ),
                  React.createElement('button', {
                    onClick: () => setFeedbackTipId(feedbackTipId === tip.id ? null : tip.id),
                    title: 'Report this tip',
                    className: 'text-gray-300 hover:text-orange-500 transition-colors flex-shrink-0 p-1'
                  }, React.createElement(IconFlag))
                ),
                React.createElement('p', { className: 'text-gray-700 text-sm leading-relaxed whitespace-pre-wrap' }, tip.content),
                tip.tags && React.createElement('div', { className: 'flex gap-1 mt-3 flex-wrap' },
                  tip.tags.split(',').map((tag, i) =>
                    React.createElement('span', {
                      key: i,
                      onClick: () => setSelectedTag(tag.trim()),
                      className: 'px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full cursor-pointer hover:bg-gray-200'
                    }, '#' + tag.trim())
                  )
                ),
                feedbackTipId === tip.id && React.createElement('div', { className: 'mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200' },
                  React.createElement('p', { className: 'text-xs font-medium text-orange-800 mb-2' }, 'Report this tip:'),
                  React.createElement('select', {
                    value: feedbackReason, onChange: e => setFeedbackReason(e.target.value),
                    className: 'w-full px-2 py-1 border border-orange-200 rounded text-xs mb-2'
                  },
                    React.createElement('option', { value: '' }, '-- Select reason --'),
                    React.createElement('option', { value: 'outdated' }, 'Information is outdated'),
                    React.createElement('option', { value: 'incorrect' }, 'Information is incorrect'),
                    React.createElement('option', { value: 'inappropriate' }, 'Inappropriate content'),
                    React.createElement('option', { value: 'other' }, 'Other')
                  ),
                  React.createElement('input', {
                    type: 'text', value: feedbackDetails, onChange: e => setFeedbackDetails(e.target.value),
                    placeholder: 'Additional details (optional)',
                    className: 'w-full px-2 py-1 border border-orange-200 rounded text-xs mb-2'
                  }),
                  React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('button', {
                      onClick: () => submitFeedback(tip.id),
                      disabled: !feedbackReason,
                      className: 'px-3 py-1 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 disabled:opacity-50'
                    }, 'Submit Report'),
                    React.createElement('button', {
                      onClick: () => setFeedbackTipId(null),
                      className: 'px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300'
                    }, 'Cancel')
                  )
                )
              )
            )
          )
  );
}

function TipSubmitForm({ currentUser, categories, onNavigate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) {
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 text-center' },
      React.createElement('p', { className: 'text-gray-500' }, 'Please log in to submit a tip.')
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return; }
    setSubmitting(true);
    setError('');
    const res = await api('/tips', {
      method: 'POST',
      body: JSON.stringify({
        author_id: currentUser.id,
        category_id: categoryId ? parseInt(categoryId) : undefined,
        title: title.trim(),
        content: content.trim(),
        tags: tags.trim() || undefined
      })
    });
    setSubmitting(false);
    if (res.success) setSubmitted(true);
    else setError(res.error || 'Submission failed.');
  }

  if (submitted) {
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 text-center fade-in' },
      React.createElement('div', { className: 'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4' },
        React.createElement(IconCheck)
      ),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Tip Submitted!'),
      React.createElement('p', { className: 'text-gray-500 mb-6' }, 'Your tip is under review by a moderator. Once approved, it will appear on the Tips page.'),
      React.createElement('div', { className: 'flex gap-3 justify-center' },
        React.createElement('button', {
          onClick: () => setSubmitted(false),
          className: 'px-6 py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark text-sm font-medium'
        }, 'Submit Another'),
        React.createElement('button', {
          onClick: () => onNavigate('tips'),
          className: 'px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium'
        }, 'View Tips')
      )
    );
  }

  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', {
      onClick: () => onNavigate('tips'),
      className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium'
    }, React.createElement(IconArrowLeft), 'Back to Tips'),
    React.createElement('div', { className: 'flex items-center gap-3 mb-1' },
      React.createElement(IconLightbulb),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Share a Tip')
    ),
    React.createElement('p', { className: 'text-gray-500 mb-1 text-sm' }, 'Share advice that would have helped you when you started. All tips are reviewed before publishing.'),
    React.createElement('p', { className: 'text-xs text-gray-400 mb-6' }, 'Good tips: practical, specific, experience-based. Avoid: personnel opinions, confidential information.'),
    error && React.createElement('p', { className: 'mb-4 text-red-500 text-sm' }, error),
    React.createElement('form', { onSubmit: handleSubmit, className: 'bg-white rounded-xl border border-gray-200 p-6 space-y-5' },
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Tip Title'),
        React.createElement('input', {
          type: 'text', value: title, onChange: e => setTitle(e.target.value), required: true,
          placeholder: 'e.g., Best way to get IT access set up quickly',
          className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm'
        })
      ),
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Category (optional)'),
        React.createElement('select', {
          value: categoryId, onChange: e => setCategoryId(e.target.value),
          className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm'
        },
          React.createElement('option', { value: '' }, '-- Select a category --'),
          categories.map(cat => React.createElement('option', { key: cat.id, value: cat.id }, cat.name))
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Your Tip'),
        React.createElement('textarea', {
          value: content, onChange: e => setContent(e.target.value), required: true, rows: 6,
          placeholder: 'Share your tip or advice in detail...',
          className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm resize-y'
        })
      ),
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Tags (optional)'),
        React.createElement('input', {
          type: 'text', value: tags, onChange: e => setTags(e.target.value),
          placeholder: 'e.g., IT, parking, compliance (comma-separated)',
          className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm'
        }),
        React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, 'Separate multiple tags with commas')
      ),
      React.createElement('button', {
        type: 'submit', disabled: submitting,
        className: 'w-full py-3 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium disabled:opacity-50'
      }, submitting ? 'Submitting...' : 'Submit Tip for Review')
    )
  );
}

function TipsModerationQueue({ currentUser, onNavigate }) {
  const [tips, setTips] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  function loadTips() {
    api('/tips?status=' + filter).then(r => r.success && setTips(r.data));
  }

  useEffect(() => { loadTips(); }, [filter]);

  async function handleAction(id, action) {
    setProcessing(id);
    await api('/tips/' + id + '/' + action, {
      method: 'PUT',
      body: JSON.stringify({ reviewed_by: currentUser.id, review_notes: reviewNotes })
    });
    setReviewNotes('');
    setProcessing(null);
    loadTips();
  }

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 text-center' },
      React.createElement('p', { className: 'text-gray-500' }, 'Access denied. Moderator or admin required.')
    );
  }

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', {
      onClick: () => onNavigate('moderate'),
      className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium'
    }, React.createElement(IconArrowLeft), 'Back to Moderation'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Tips Moderation Queue'),
    React.createElement('p', { className: 'text-gray-500 mb-6 text-sm' }, 'Review and manage employee tip submissions'),
    React.createElement('div', { className: 'flex gap-2 mb-6' },
      ['pending', 'approved', 'rejected'].map(s =>
        React.createElement('button', {
          key: s, onClick: () => setFilter(s),
          className: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
            (filter === s
              ? s === 'pending' ? 'bg-orange-100 text-orange-700' : s === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
        }, s.charAt(0).toUpperCase() + s.slice(1))
      )
    ),
    tips.length === 0
      ? React.createElement('div', { className: 'text-center py-12 text-gray-500' }, 'No ' + filter + ' tips.')
      : React.createElement('div', { className: 'space-y-4' },
          tips.map(tip =>
            React.createElement('div', { key: tip.id, className: 'bg-white rounded-xl border border-gray-200 p-5' },
              React.createElement('div', { className: 'flex items-start justify-between mb-2' },
                React.createElement('div', null,
                  React.createElement('h3', { className: 'font-semibold text-gray-900' }, tip.title),
                  React.createElement('div', { className: 'flex items-center gap-2 mt-1 text-xs text-gray-500' },
                    React.createElement('span', null, 'By: ' + (tip.author_email || 'Unknown')),
                    React.createElement('span', null, new Date(tip.submitted_at).toLocaleString()),
                    tip.category_name && React.createElement('span', { className: 'px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full' }, tip.category_name)
                  )
                ),
                React.createElement('span', {
                  className: 'px-2 py-0.5 rounded-full text-xs font-medium ' +
                    (tip.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                     tip.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                }, tip.status)
              ),
              React.createElement('p', { className: 'text-gray-700 text-sm mb-2 whitespace-pre-wrap' }, tip.content),
              tip.tags && React.createElement('p', { className: 'text-xs text-gray-400 mb-3' }, 'Tags: ' + tip.tags),
              filter === 'pending' && React.createElement('div', { className: 'space-y-3' },
                React.createElement('textarea', {
                  value: processing === tip.id ? reviewNotes : '',
                  onChange: e => { setProcessing(tip.id); setReviewNotes(e.target.value); },
                  placeholder: 'Optional review notes...',
                  rows: 2,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue'
                }),
                React.createElement('div', { className: 'flex gap-2' },
                  React.createElement('button', {
                    onClick: () => handleAction(tip.id, 'approve'),
                    disabled: processing === tip.id,
                    className: 'flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50'
                  }, React.createElement(IconCheck), 'Approve'),
                  React.createElement('button', {
                    onClick: () => handleAction(tip.id, 'reject'),
                    disabled: processing === tip.id,
                    className: 'flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50'
                  }, React.createElement(IconX), 'Reject')
                )
              )
            )
          )
        )
  );
}

// --- YouTube Video Finder ---
function YouTubeFinderPage({ currentUser, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());
  const [planView, setPlanView] = useState(false);
  const [plan, setPlan] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);

  function loadPlan() {
    if (!currentUser) return;
    setPlanLoading(true);
    api('/youtube/plan/' + currentUser.id).then(r => {
      if (r.success) { setPlan(r.data); setAddedIds(new Set(r.data.map(i => i.youtube_video_id))); }
      setPlanLoading(false);
    });
  }

  useEffect(() => { if (planView) loadPlan(); }, [planView]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setMessage('');
    const r = await api('/youtube/search?q=' + encodeURIComponent(query));
    setLoading(false);
    if (r.success) {
      setResults(r.data || []);
      if (r.message) setMessage(r.message);
      else if (!r.data || r.data.length === 0) setMessage('No videos found for that search. Try different keywords.');
    } else {
      setMessage(r.error || 'Search failed. Please try again.');
    }
  }

  async function addToPlan(video) {
    if (!currentUser) return;
    const res = await api('/youtube/plan', {
      method: 'POST',
      body: JSON.stringify({
        user_id: currentUser.id,
        youtube_video_id: video.videoId,
        video_title: video.title,
        video_channel: video.channelTitle,
        video_duration: video.duration,
        source: 'search'
      })
    });
    if (res.success) setAddedIds(new Set([...addedIds, video.videoId]));
  }

  async function markComplete(planItemId) {
    await api('/youtube/plan/' + planItemId + '/complete', { method: 'PUT' });
    loadPlan();
  }

  if (planView) {
    return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement(IconBookmark),
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'My Learning Plan')
        ),
        React.createElement('button', {
          onClick: () => setPlanView(false),
          className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark text-sm font-medium'
        }, React.createElement(IconVideo), 'Find Videos')
      ),
      planLoading
        ? React.createElement('p', { className: 'text-center py-8 text-gray-500' }, 'Loading...')
        : plan.length === 0
          ? React.createElement('div', { className: 'text-center py-12 text-gray-500' },
              React.createElement('p', { className: 'text-4xl mb-3' }, '📚'),
              React.createElement('p', null, 'Your learning plan is empty.'),
              React.createElement('button', {
                onClick: () => setPlanView(false),
                className: 'mt-4 px-4 py-2 bg-toledo-blue text-white rounded-lg text-sm hover:bg-toledo-dark'
              }, 'Find Videos to Add')
            )
          : React.createElement('div', { className: 'space-y-3' },
              plan.map(item =>
                React.createElement('div', { key: item.id, className: 'bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4' },
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('a', {
                      href: 'https://www.youtube.com/watch?v=' + item.youtube_video_id,
                      target: '_blank', rel: 'noopener noreferrer',
                      className: 'font-medium text-gray-900 hover:text-toledo-blue text-sm line-clamp-2'
                    }, item.video_title),
                    React.createElement('div', { className: 'flex items-center gap-3 mt-1 text-xs text-gray-500' },
                      item.video_channel && React.createElement('span', null, item.video_channel),
                      item.video_duration && React.createElement('span', null, '⏱ ' + item.video_duration),
                      item.category && React.createElement('span', { className: 'px-2 py-0.5 bg-gray-100 rounded-full' }, item.category)
                    )
                  ),
                  item.is_completed
                    ? React.createElement('span', { className: 'px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex-shrink-0' }, '✓ Done')
                    : React.createElement('button', {
                        onClick: () => markComplete(item.id),
                        className: 'px-3 py-1 bg-toledo-blue text-white rounded-lg text-xs font-medium hover:bg-toledo-dark flex-shrink-0'
                      }, 'Mark Done')
                )
              )
            )
    );
  }

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('div', { className: 'flex items-start justify-between mb-6' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement(IconVideo),
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Video Finder'),
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Search AI literacy training videos from approved channels only')
        )
      ),
      currentUser && React.createElement('button', {
        onClick: () => { setPlanView(true); loadPlan(); },
        className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark text-sm font-medium'
      }, React.createElement(IconBookmark), 'My Learning Plan')
    ),
    React.createElement('form', { onSubmit: handleSearch, className: 'mb-6' },
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement('input', {
          type: 'text', value: query, onChange: e => setQuery(e.target.value),
          placeholder: 'Search training videos (e.g., AI basics, prompt engineering, data literacy...)',
          className: 'flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm'
        }),
        React.createElement('button', {
          type: 'submit', disabled: loading || !query.trim(),
          className: 'px-6 py-3 bg-toledo-blue text-white rounded-xl hover:bg-toledo-dark transition-colors text-sm font-medium disabled:opacity-50'
        }, loading ? 'Searching...' : 'Search')
      )
    ),
    message && React.createElement('div', { className: 'mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm' }, message),
    results.length > 0 && React.createElement('div', { className: 'space-y-4' },
      React.createElement('p', { className: 'text-sm text-gray-500' }, results.length + ' result(s) from approved channels'),
      results.map(video =>
        React.createElement('div', { key: video.videoId, className: 'bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start' },
          React.createElement('img', {
            src: video.thumbnail, alt: '',
            className: 'w-32 h-20 object-cover rounded-lg flex-shrink-0 bg-gray-100'
          }),
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('a', {
              href: 'https://www.youtube.com/watch?v=' + video.videoId,
              target: '_blank', rel: 'noopener noreferrer',
              className: 'font-semibold text-gray-900 hover:text-toledo-blue text-sm line-clamp-2'
            }, video.title),
            React.createElement('div', { className: 'flex items-center gap-3 mt-1 text-xs text-gray-500' },
              React.createElement('span', null, video.channelTitle),
              video.duration && React.createElement('span', null, '⏱ ' + video.duration)
            ),
            video.description && React.createElement('p', { className: 'text-xs text-gray-500 mt-1 line-clamp-2' }, video.description),
            currentUser && React.createElement('button', {
              onClick: () => addToPlan(video),
              disabled: addedIds.has(video.videoId),
              className: 'mt-2 flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg transition-colors ' +
                (addedIds.has(video.videoId)
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-toledo-blue text-white hover:bg-toledo-dark')
            }, React.createElement(IconBookmark), addedIds.has(video.videoId) ? 'Added to Plan' : 'Add to My Plan')
          )
        )
      )
    )
  );
}

// --- AI Hub (Literacy Assessment) ---
const ROLE_ARCHETYPES = [
  'Coach / Athletic Staff',
  'Academic Advisor',
  'Athletic Trainer / Sports Medicine',
  'Marketing & Communications',
  'Compliance Officer',
  'Operations & Events',
  'Administrative Staff',
  'IT / Technology Staff',
];

function AIHubPage({ currentUser, onNavigate }) {
  const [phase, setPhase] = useState('select');
  const [role, setRole] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const MAX_QUESTIONS = 5;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentQuestion]);

  if (!currentUser) {
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 text-center' },
      React.createElement('p', { className: 'text-gray-500' }, 'Please log in to access the AI Hub.')
    );
  }

  async function startAssessment() {
    if (!role) return;
    setLoading(true);
    setPhase('chat');
    const r = await api('/ai/assessment/start', {
      method: 'POST',
      body: JSON.stringify({ role_archetype: role })
    });
    setLoading(false);
    if (r.success) {
      setCurrentQuestion(r.data.question);
      setQuestionCount(1);
    } else {
      setCurrentQuestion('Unable to start assessment. Please try again.');
    }
  }

  async function submitAnswer() {
    if (!userInput.trim()) return;
    const answer = userInput.trim();
    setUserInput('');
    setLoading(true);
    const isLast = questionCount >= MAX_QUESTIONS;
    const fullMessages = [
      { role: 'assistant', content: currentQuestion },
      ...messages,
      { role: 'user', content: answer }
    ];
    const newMessages = [...messages, { role: 'user', content: answer }];
    setMessages(newMessages);
    const r = await api('/ai/assessment/answer', {
      method: 'POST',
      body: JSON.stringify({ role_archetype: role, messages: fullMessages, is_last_answer: isLast })
    });
    setLoading(false);
    if (r.success) {
      if (r.data.done) {
        setEvaluation(r.data.evaluation);
        setPhase('results');
      } else {
        const nextQ = r.data.question;
        setCurrentQuestion(nextQ);
        setQuestionCount(questionCount + 1);
        setMessages([...newMessages, { role: 'assistant', content: nextQ }]);
      }
    }
  }

  async function saveResults() {
    if (!evaluation || !currentUser) return;
    setSaving(true);
    await api('/ai/assessment/save', {
      method: 'POST',
      body: JSON.stringify({
        user_id: currentUser.id,
        role_archetype: role,
        overall_level: evaluation.overall_level,
        score_data: evaluation.score_data,
        learning_plan: evaluation.learning_plan
      })
    });
    setSaving(false);
    setSaved(true);
  }

  if (phase === 'select') {
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8 fade-in' },
      React.createElement('div', { className: 'flex items-center gap-3 mb-2' },
        React.createElement(IconBrain),
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'AI Literacy Hub')
      ),
      React.createElement('div', { className: 'p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 mb-5' },
        React.createElement('strong', null, '📋 Self-Development Note: '),
        'This assessment is for your own professional growth. It is NOT an HR evaluation and will not affect your employment status or be shared with management.'
      ),
      React.createElement('p', { className: 'text-gray-600 mb-6' }, 'Discover your AI literacy level and get personalized video recommendations. Select your role to begin a ' + MAX_QUESTIONS + '-question scenario assessment.'),
      React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-6' },
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-3' }, 'Select Your Role / Archetype'),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6' },
          ROLE_ARCHETYPES.map(r =>
            React.createElement('button', {
              key: r, onClick: () => setRole(r),
              className: 'px-4 py-3 rounded-lg border text-sm text-left transition-all ' +
                (role === r
                  ? 'border-toledo-blue bg-toledo-blue/10 text-toledo-blue font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-toledo-blue/50 hover:bg-gray-50')
            }, r)
          )
        ),
        React.createElement('button', {
          onClick: startAssessment,
          disabled: !role || loading,
          className: 'w-full py-3 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium disabled:opacity-50'
        }, loading ? 'Starting...' : 'Start Assessment →')
      )
    );
  }

  if (phase === 'results' && evaluation) {
    const levelColors = { beginner: 'bg-yellow-100 text-yellow-800', intermediate: 'bg-blue-100 text-blue-800', advanced: 'bg-green-100 text-green-800' };
    const levelColor = levelColors[evaluation.overall_level] || 'bg-gray-100 text-gray-700';
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8 fade-in' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-1' }, 'Assessment Complete!'),
      React.createElement('p', { className: 'text-gray-500 mb-5 text-sm' }, 'Role assessed: ' + role),
      React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-6 mb-4' },
        React.createElement('div', { className: 'flex items-center gap-3 mb-5' },
          React.createElement('span', { className: 'px-4 py-2 rounded-full text-base font-bold ' + levelColor },
            evaluation.overall_level
              ? evaluation.overall_level.charAt(0).toUpperCase() + evaluation.overall_level.slice(1)
              : 'N/A'
          ),
          React.createElement('span', { className: 'text-gray-700 font-medium' }, 'Overall AI Literacy Level')
        ),
        Object.entries(evaluation.score_data || {}).length > 0 && React.createElement('div', { className: 'space-y-3 mb-5' },
          React.createElement('h3', { className: 'font-medium text-gray-900 text-sm' }, 'Category Scores:'),
          Object.entries(evaluation.score_data).map(([category, data]) =>
            React.createElement('div', { key: category, className: 'p-3 bg-gray-50 rounded-lg' },
              React.createElement('div', { className: 'flex items-center justify-between mb-1' },
                React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, category),
                React.createElement('span', { className: 'text-sm text-gray-500' }, (data.score || 0) + '/5')
              ),
              React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-1.5 mb-1' },
                React.createElement('div', {
                  className: 'bg-toledo-blue h-1.5 rounded-full',
                  style: { width: ((data.score || 0) / 5 * 100) + '%' }
                })
              ),
              data.feedback && React.createElement('p', { className: 'text-xs text-gray-500' }, data.feedback)
            )
          )
        ),
        React.createElement('div', { className: 'p-4 bg-blue-50 rounded-lg' },
          React.createElement('h3', { className: 'font-medium text-gray-900 text-sm mb-2' }, '📚 Recommended Next Steps:'),
          React.createElement('p', { className: 'text-sm text-gray-700 whitespace-pre-wrap leading-relaxed' }, evaluation.learning_plan)
        )
      ),
      React.createElement('div', { className: 'p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 mb-4' },
        '⚠️ Reminder: This is self-development only. Results are not shared with HR or management unless you choose to share them.'
      ),
      React.createElement('div', { className: 'flex gap-3 flex-wrap' },
        !saved
          ? React.createElement('button', {
              onClick: saveResults,
              disabled: saving,
              className: 'flex items-center gap-2 px-4 py-2 bg-toledo-blue text-white rounded-lg text-sm font-medium hover:bg-toledo-dark disabled:opacity-50'
            }, React.createElement(IconCheck), saving ? 'Saving...' : 'Save to My Profile')
          : React.createElement('span', { className: 'flex items-center gap-1 text-green-600 text-sm font-medium' }, React.createElement(IconCheck), 'Saved!'),
        React.createElement('button', {
          onClick: () => onNavigate('youtube'),
          className: 'flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200'
        }, React.createElement(IconVideo), 'Find Training Videos'),
        React.createElement('button', {
          onClick: () => { setPhase('select'); setMessages([]); setEvaluation(null); setSaved(false); setQuestionCount(0); setCurrentQuestion(''); },
          className: 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200'
        }, 'Retake Assessment')
      )
    );
  }

  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8 fade-in' },
    React.createElement('div', { className: 'flex items-center gap-3 mb-2' },
      React.createElement(IconBrain),
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-xl font-bold text-gray-900' }, 'AI Literacy Assessment'),
        React.createElement('p', { className: 'text-xs text-gray-500' }, 'Question ' + questionCount + ' of ' + MAX_QUESTIONS + ' · Role: ' + role)
      )
    ),
    React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-1.5 mb-5' },
      React.createElement('div', {
        className: 'bg-toledo-blue h-1.5 rounded-full transition-all',
        style: { width: (questionCount / MAX_QUESTIONS * 100) + '%' }
      })
    ),
    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-4 mb-4 overflow-y-auto', style: { minHeight: '200px', maxHeight: '320px' } },
      currentQuestion && React.createElement('div', { className: 'p-3 bg-toledo-blue/5 rounded-lg text-sm text-gray-800 mb-3 leading-relaxed' },
        React.createElement('p', { className: 'text-xs font-medium text-toledo-blue mb-1' }, '🤖 Assessment Question'),
        currentQuestion
      ),
      messages.filter(m => m.role === 'user').map((m, i) =>
        React.createElement('div', { key: i, className: 'flex justify-end mb-2' },
          React.createElement('div', { className: 'bg-gray-100 px-3 py-2 rounded-xl text-sm text-gray-700 max-w-sm' }, m.content)
        )
      ),
      loading && React.createElement('div', { className: 'flex justify-start mt-2' },
        React.createElement('div', { className: 'bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-400' }, 'Thinking...')
      ),
      React.createElement('div', { ref: messagesEndRef })
    ),
    !loading && React.createElement('div', { className: 'flex gap-2' },
      React.createElement('textarea', {
        value: userInput,
        onChange: e => setUserInput(e.target.value),
        onKeyDown: e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); } },
        placeholder: 'Type your answer... (Enter to submit, Shift+Enter for new line)',
        rows: 3,
        className: 'flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm resize-none'
      }),
      React.createElement('button', {
        onClick: submitAnswer,
        disabled: !userInput.trim() || loading,
        className: 'px-4 py-3 bg-toledo-blue text-white rounded-xl hover:bg-toledo-dark transition-colors disabled:opacity-50 self-end'
      }, questionCount >= MAX_QUESTIONS ? 'Finish →' : 'Next →')
    )
  );
}

// --- Site-wide AI Chat Widget ---
function AIChatWidget({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUser) return null;

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    const r = await api('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages })
    });
    setLoading(false);
    if (r.success) {
      setMessages([...newMessages, { role: 'assistant', content: r.data.reply }]);
    } else {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
  }

  return React.createElement('div', { className: 'fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3' },
    open && React.createElement('div', {
      className: 'w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col fade-in',
      style: { height: '480px' }
    },
      React.createElement('div', { className: 'bg-toledo-blue text-white px-4 py-3 rounded-t-2xl flex items-center justify-between flex-shrink-0' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(IconChat),
          React.createElement('div', null,
            React.createElement('p', { className: 'font-semibold text-sm' }, 'Toledo Athletics Assistant'),
            React.createElement('p', { className: 'text-xs text-blue-200' }, 'Ask anything about onboarding')
          )
        ),
        React.createElement('button', {
          onClick: () => setOpen(false),
          className: 'text-blue-200 hover:text-white transition-colors'
        }, React.createElement(IconX))
      ),
      React.createElement('div', { className: 'flex-1 overflow-y-auto p-4 space-y-3' },
        messages.length === 0 && React.createElement('div', { className: 'text-center py-6' },
          React.createElement('div', { className: 'text-4xl mb-2' }, '👋'),
          React.createElement('p', { className: 'text-sm text-gray-500 mb-1' }, 'Hi ' + currentUser.email.split('@')[0] + '!'),
          React.createElement('p', { className: 'text-xs text-gray-400' }, 'Ask me anything about Toledo Athletics onboarding — policies, contacts, procedures, and more.')
        ),
        messages.map((m, i) =>
          React.createElement('div', {
            key: i,
            className: 'flex ' + (m.role === 'user' ? 'justify-end' : 'justify-start')
          },
            React.createElement('div', {
              className: 'max-w-xs px-3 py-2 rounded-xl text-sm leading-relaxed ' +
                (m.role === 'user' ? 'bg-toledo-blue text-white' : 'bg-gray-100 text-gray-800')
            }, m.content)
          )
        ),
        loading && React.createElement('div', { className: 'flex justify-start' },
          React.createElement('div', { className: 'bg-gray-100 px-3 py-2 rounded-xl' },
            React.createElement('div', { className: 'flex gap-1 items-center' },
              React.createElement('div', { className: 'w-2 h-2 bg-gray-400 rounded-full animate-bounce', style: { animationDelay: '0ms' } }),
              React.createElement('div', { className: 'w-2 h-2 bg-gray-400 rounded-full animate-bounce', style: { animationDelay: '150ms' } }),
              React.createElement('div', { className: 'w-2 h-2 bg-gray-400 rounded-full animate-bounce', style: { animationDelay: '300ms' } })
            )
          )
        ),
        React.createElement('div', { ref: messagesEndRef })
      ),
      React.createElement('div', { className: 'p-3 border-t border-gray-200 flex-shrink-0' },
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('input', {
            type: 'text', value: input, onChange: e => setInput(e.target.value),
            onKeyDown: e => e.key === 'Enter' && sendMessage(),
            placeholder: 'Ask a question...',
            className: 'flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue'
          }),
          React.createElement('button', {
            onClick: sendMessage,
            disabled: !input.trim() || loading,
            className: 'p-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark disabled:opacity-50 transition-colors'
          }, React.createElement(IconChat))
        )
      )
    ),
    React.createElement('button', {
      onClick: () => setOpen(!open),
      className: 'w-14 h-14 bg-toledo-blue text-white rounded-full shadow-lg hover:bg-toledo-dark transition-all flex items-center justify-center hover:scale-105',
      title: 'Chat with AI assistant'
    },
      open ? React.createElement(IconX) : React.createElement(IconChat)
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
    case 'orgchart':
      content = React.createElement(OrgChartPage, { onNavigate: navigate });
      break;
    case 'tips':
      content = React.createElement(TipsPage, { currentUser, categories, onNavigate: navigate });
      break;
    case 'tip-submit':
      content = React.createElement(TipSubmitForm, { currentUser, categories, onNavigate: navigate });
      break;
    case 'tips-moderate':
      content = React.createElement(TipsModerationQueue, { currentUser, onNavigate: navigate });
      break;
    case 'youtube':
      content = React.createElement(YouTubeFinderPage, { currentUser, onNavigate: navigate });
      break;
    case 'ai-hub':
      content = React.createElement(AIHubPage, { currentUser, onNavigate: navigate });
      break;
    default:
      content = React.createElement(HomePage, { categories, stats, onNavigate: navigate, onSearch: handleSearch });
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
    React.createElement(Header, { currentUser, onNavigate: navigate, currentView: view }),
    content,
    React.createElement(AIChatWidget, { currentUser })
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
`;
}

export { getIndexHtml };
