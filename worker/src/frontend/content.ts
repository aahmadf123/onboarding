// Content views: HomePage, CategoryView, ArticleView, SearchResults, SubmitForm, ModerationDashboard

export function getContentCode(): string {
  return `
// ── HomePage ──────────────────────────────────────────────────────────────────
function HomePage({ categories, stats, onNavigate, onSearch, currentUser }) {

  // Read checklist progress from localStorage
  var storageKey = 'checklist_' + (currentUser ? currentUser.email : 'guest');
  var checklistProgress = (function() {
    try {
      var saved = localStorage.getItem(storageKey);
      var checked = saved ? JSON.parse(saved) : {};
      var total = 16;
      var done = Object.values(checked).filter(Boolean).length;
      return { done: done, total: total, pct: Math.round((done / total) * 100) };
    } catch (e) { return { done: 0, total: 16, pct: 0 }; }
  })();

  return React.createElement('div', { className: 'fade-in' },
    // Hero banner
    React.createElement('div', { className: 'bg-gradient-to-br from-toledo-blue via-toledo-dark to-toledo-blue text-white py-16' },
      React.createElement('div', { className: 'max-w-4xl mx-auto px-4 text-center' },
        React.createElement('img', { src: '/branding/Primary_Logo_for_Dark_Background.png', alt: 'Toledo Athletics', className: 'h-20 w-auto mx-auto mb-6' }),
        React.createElement('h1', { className: 'text-4xl md:text-5xl font-extrabold mb-4 tracking-tight' }, 'Welcome to Toledo Athletics'),
        React.createElement('p', { className: 'text-xl text-blue-200 mb-8 max-w-2xl mx-auto' }, 'Your complete onboarding guide — everything you need to succeed from day one.'),
        React.createElement('div', { className: 'max-w-xl mx-auto' }, React.createElement(SearchBar, { onSearch }))
      )
    ),

    // Quick Actions
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 -mt-8 relative z-10' },
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
        [
          { id: 'guide', icon: '🗺️', label: 'My Onboarding', desc: 'Guide + checklist' },
          { id: 'resources', icon: '🔗', label: 'Resources & Systems', desc: 'Links and tools' },
          { id: 'contacts', icon: '👥', label: 'Key Contacts', desc: 'Who to reach out to' },
          { id: 'orgchart', icon: '🏛️', label: 'Org Chart', desc: 'Department structure' },
        ].map(function (action) {
          return React.createElement('button', {
            key: action.id, onClick: function () { onNavigate(action.id); },
            className: 'bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-lg hover:border-toledo-blue/30 transition-all group shadow-md',
          },
            React.createElement('span', { className: 'text-3xl block mb-2' }, action.icon),
            React.createElement('h3', { className: 'font-semibold text-gray-900 group-hover:text-toledo-blue transition-colors text-sm' }, action.label),
            React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, action.desc)
          );
        })
      )
    ),

    // Onboarding Progress Widget
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-10' },
      React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 shadow-sm p-6' },
        React.createElement('div', { className: 'flex items-center justify-between mb-3' },
          React.createElement('div', null,
            React.createElement('h2', { className: 'text-lg font-bold text-gray-900' }, 'Your Onboarding Progress'),
            React.createElement('p', { className: 'text-sm text-gray-500 mt-0.5' },
              checklistProgress.done + ' of ' + checklistProgress.total + ' tasks completed'
            )
          ),
          React.createElement('span', { className: 'text-2xl font-bold text-toledo-blue' }, checklistProgress.pct + '%')
        ),
        React.createElement('div', { className: 'w-full bg-gray-100 rounded-full h-3 mb-4' },
          React.createElement('div', {
            className: 'bg-toledo-blue h-3 rounded-full transition-all duration-500',
            style: { width: checklistProgress.pct + '%' },
          })
        ),
        checklistProgress.done === checklistProgress.total
          ? React.createElement('p', { className: 'text-green-600 font-semibold text-sm mb-3' }, "🎉 You've completed all onboarding tasks!")
          : React.createElement('p', { className: 'text-sm text-gray-400 mb-3' },
              checklistProgress.done === 0 ? "Start by clicking 'My Onboarding' above." : "Keep going — you're making great progress!"
            ),
        React.createElement('button', {
          onClick: function () { onNavigate('guide'); },
          className: 'px-5 py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors font-medium text-sm',
        }, checklistProgress.done === 0 ? '▶ Start Onboarding' : '▶ Continue Onboarding')
      )
    ),

    // Explore by Category
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 pb-12' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, 'Explore by Topic'),
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
        categories.map((cat) => React.createElement('button', {
          key: cat.id, onClick: () => onNavigate('category', cat.id),
          className: 'bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all group'
        },
          React.createElement('div', { className: 'flex items-start gap-3' },
            React.createElement('span', { className: 'text-2xl' }, CATEGORY_ICONS[cat.name] || '📄'),
            React.createElement('div', null,
              React.createElement('h3', { className: 'font-semibold text-gray-900 group-hover:text-toledo-blue transition-colors' }, cat.name),
              React.createElement('p', { className: 'text-sm text-gray-500 mt-1 line-clamp-2' }, cat.description)
            )
          )
        ))
      )
    )
  );
}

// ── CategoryView ──────────────────────────────────────────────────────────────
function CategoryView({ categoryId, onNavigate }) {
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  useEffect(() => {
    api('/categories/' + categoryId).then(r => r.success && setCategory(r.data));
    api('/categories/' + categoryId + '/articles').then(r => r.success && setArticles(r.data));
  }, [categoryId]);
  if (!category) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');
  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: () => onNavigate('home'), className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
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
          articles.map((article) => React.createElement('button', {
            key: article.id, onClick: () => onNavigate('article', article.id),
            className: 'w-full bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all'
          },
            React.createElement('h3', { className: 'font-semibold text-gray-900' }, article.title),
            React.createElement('p', { className: 'text-sm text-gray-500 mt-1 line-clamp-2' },
              article.current_content
                ? article.current_content.replace(/[#*_~>|!\\[\\]]/g,'').replace(/\\s+/g,' ').substring(0, 200) + '...'
                : ''
            ),
            React.createElement('p', { className: 'text-xs text-gray-400 mt-2' }, 'Last updated: ' + new Date(article.last_updated).toLocaleDateString())
          ))
        )
  );
}

// ── ArticleView ───────────────────────────────────────────────────────────────
function ArticleView({ articleId, onNavigate }) {
  const [article, setArticle] = useState(null);
  useEffect(() => {
    api('/articles/' + articleId).then(r => r.success && setArticle(r.data));
  }, [articleId]);
  if (!article) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');
  function renderMarkdown(text) {
    if (!text) return '';
    if (typeof marked !== 'undefined') {
      try { return marked.parse(text); } catch (e) {}
    }
    // Fallback: preserve line breaks
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\n/g,'<br>');
  }
  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: () => article.category_id ? onNavigate('category', article.category_id) : onNavigate('home'), className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back'),
    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 shadow-sm' },
      React.createElement('div', { className: 'p-6 md:p-8 border-b' },
        article.category_name && React.createElement('span', { className: 'inline-block px-3 py-1 bg-toledo-blue/10 text-toledo-blue text-xs font-medium rounded-full mb-3' }, article.category_name),
        React.createElement('h1', { className: 'text-2xl md:text-3xl font-bold text-gray-900' }, article.title),
        React.createElement('p', { className: 'text-sm text-gray-400 mt-2' }, 'Last updated: ' + new Date(article.last_updated).toLocaleDateString())
      ),
      React.createElement('div', { className: 'p-6 md:p-8 prose max-w-none', dangerouslySetInnerHTML: { __html: renderMarkdown(article.current_content) } })
    )
  );
}

// ── SearchResults ─────────────────────────────────────────────────────────────
function SearchResults({ query, onNavigate }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api('/search?q=' + encodeURIComponent(query)).then(r => { if (r.success) setResults(r.data); setLoading(false); });
  }, [query]);
  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: () => onNavigate('home'), className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Search Results'),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, 'Showing results for "' + query + '"'),
    loading
      ? React.createElement('p', { className: 'text-center text-gray-500 py-8' }, 'Searching...')
      : results.length === 0
        ? React.createElement('p', { className: 'text-center text-gray-500 py-8' }, 'No results found. Try a different search term.')
        : React.createElement('div', { className: 'space-y-3' },
            results.map((article) => React.createElement('button', {
              key: article.id, onClick: () => onNavigate('article', article.id),
              className: 'w-full bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all'
            },
              article.category_name && React.createElement('span', { className: 'px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full mb-1 inline-block' }, article.category_name),
              React.createElement('h3', { className: 'font-semibold text-gray-900' }, article.title),
              React.createElement('p', { className: 'text-sm text-gray-500 mt-1 line-clamp-2' },
                article.current_content ? article.current_content.substring(0, 200) + '...' : ''
              )
            ))
          )
  );
}

// ── SubmitForm ────────────────────────────────────────────────────────────────
function SubmitForm({ currentUser, categories, onNavigate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [articleId, setArticleId] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [articles, setArticles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { api('/articles').then(r => r.success && setArticles(r.data)); }, []);
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
    const res = await api('/submissions', { method: 'POST', body: JSON.stringify(payload) });
    setSubmitting(false);
    if (res.success) { setSubmitted(true); setTitle(''); setContent(''); setArticleId(''); }
  }
  if (!currentUser) return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 text-center' },
    React.createElement('p', { className: 'text-gray-500' }, 'Please log in to contribute.')
  );
  if (submitted) return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 text-center fade-in' },
    React.createElement('div', { className: 'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4' }, React.createElement(IconCheck)),
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Submission Received!'),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, 'Your contribution has been queued for moderation. Thank you!'),
    React.createElement('button', { onClick: () => setSubmitted(false), className: 'px-6 py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium' }, 'Submit Another')
  );
  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: () => onNavigate('home'), className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Contribute Knowledge'),
    React.createElement('p', { className: 'text-gray-500 mb-8' }, 'Share your insights to improve onboarding. Submissions are reviewed before publishing.'),
    React.createElement('form', { onSubmit: handleSubmit, className: 'bg-white rounded-xl border border-gray-200 p-6 space-y-6' },
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
      isNew && React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Article Title'),
        React.createElement('input', { type: 'text', value: title, onChange: (e) => setTitle(e.target.value), required: isNew, placeholder: 'Enter a descriptive title', className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm' })
      ),
      !isNew && React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Select Article to Edit'),
        React.createElement('select', { value: articleId, onChange: (e) => setArticleId(e.target.value), required: !isNew, className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm' },
          React.createElement('option', { value: '' }, '-- Select an article --'),
          articles.map(a => React.createElement('option', { key: a.id, value: a.id }, a.title))
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, isNew ? 'Article Content' : 'Proposed Changes'),
        React.createElement('textarea', { value: content, onChange: (e) => setContent(e.target.value), required: true, rows: 10, placeholder: isNew ? 'Write the article content here...' : 'Describe your proposed changes...', className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm resize-y' })
      ),
      React.createElement('button', { type: 'submit', disabled: submitting, className: 'w-full py-3 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium disabled:opacity-50' },
        submitting ? 'Submitting...' : 'Submit for Review'
      )
    )
  );
}

// ── ModerationDashboard (with Submissions + Tips tabs) ───────────────────────
function ModerationDashboard({ currentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('submissions');
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const loadData = useCallback(() => {
    if (activeTab === 'submissions') {
      api('/submissions?status=' + filter).then(r => r.success && setItems(r.data));
    } else {
      api('/tips/queue?status=' + filter).then(r => r.success && setItems(r.data));
    }
  }, [activeTab, filter]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleAction(id, action) {
    setProcessing(id);
    const base = activeTab === 'submissions' ? '/submissions/' : '/tips/';
    await api(base + id + '/' + action, {
      method: 'PUT',
      body: JSON.stringify({ reviewed_by: currentUser.id, review_notes: reviewNotes }),
    });
    setReviewNotes('');
    setProcessing(null);
    loadData();
  }

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: () => onNavigate('home'), className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-1' }, 'Moderation Queue'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-5' }, 'Review and manage community submissions'),
    React.createElement('div', { className: 'flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit' },
      ['submissions', 'tips'].map(t => React.createElement('button', {
        key: t,
        onClick: () => { setActiveTab(t); setFilter('pending'); setItems([]); },
        className: 'px-4 py-1.5 rounded-md text-sm font-medium transition-colors ' + (activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')
      }, t === 'submissions' ? 'Submissions' : 'Tips'))
    ),
    React.createElement('div', { className: 'flex gap-2 mb-6' },
      ['pending', 'approved', 'rejected'].map(s => React.createElement('button', {
        key: s, onClick: () => setFilter(s),
        className: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
          (filter === s
            ? (s === 'pending' ? 'bg-orange-100 text-orange-700' : s === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
      }, s.charAt(0).toUpperCase() + s.slice(1)))
    ),
    items.length === 0
      ? React.createElement('div', { className: 'text-center py-12 text-gray-400' }, 'No ' + filter + ' ' + activeTab + '.')
      : React.createElement('div', { className: 'space-y-4' },
          items.map(item => React.createElement('div', { key: item.id, className: 'bg-white rounded-xl border border-gray-200 p-5' },
            React.createElement('div', { className: 'flex items-start justify-between mb-3' },
              React.createElement('div', { className: 'flex-1 min-w-0' },
                React.createElement('h3', { className: 'font-semibold text-gray-900' },
                  item.proposed_title || item.title || (item.article_title ? 'Edit: ' + item.article_title : 'Item #' + item.id)
                ),
                React.createElement('div', { className: 'flex flex-wrap gap-3 mt-1 text-xs text-gray-500' },
                  React.createElement('span', null, 'By: ' + (item.author_email || 'Unknown')),
                  React.createElement('span', null, new Date(item.submitted_at).toLocaleString())
                )
              ),
              React.createElement('span', {
                className: 'ml-3 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ' +
                  (item.status === 'pending' ? 'bg-orange-100 text-orange-700' : item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
              }, item.status)
            ),
            React.createElement('div', { className: 'bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto mb-3' },
              item.proposed_content || item.content
            ),
            item.review_notes && React.createElement('div', { className: 'bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mb-3' },
              React.createElement('strong', null, 'Review notes: '), item.review_notes
            ),
            filter === 'pending' && React.createElement('div', { className: 'space-y-3' },
              React.createElement('textarea', {
                value: processing === item.id ? reviewNotes : '',
                onChange: (e) => { setProcessing(item.id); setReviewNotes(e.target.value); },
                placeholder: 'Optional review notes...',
                rows: 2,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue'
              }),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('button', {
                  onClick: () => handleAction(item.id, 'approve'),
                  disabled: !!processing,
                  className: 'flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50'
                }, React.createElement(IconCheck), 'Approve & Publish'),
                React.createElement('button', {
                  onClick: () => handleAction(item.id, 'reject'),
                  disabled: !!processing,
                  className: 'flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50'
                }, React.createElement(IconX), 'Reject')
              )
            )
          ))
        )
  );
}
`;
}
