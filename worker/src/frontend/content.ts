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
        React.createElement('div', { className: 'max-w-xl mx-auto' }, React.createElement(SearchBar, { onSearch, onNavigate }))
      )
    ),

    // Quick Actions
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 -mt-8 relative z-10' },
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
        [
          { id: 'guide', icon: '🗺️', label: 'My Onboarding', desc: 'Guide + checklist' },
          { id: 'resources', icon: '🔗', label: 'Resources & Systems', desc: 'Links and tools' },
          { id: 'contacts', icon: '👥', label: 'Key Contacts', desc: 'Who to reach out to' },
          { id: 'policies', icon: '📋', label: 'Policies', desc: 'Compliance & procedures' },
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
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    setLoading(true);
    setActiveType('all');
    api('/search?q=' + encodeURIComponent(query)).then(r => {
      if (r.success) setResults(r.data || []);
      setLoading(false);
    });
  }, [query]);

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^{}()|[\]\\$]/g, '\\$&');
  }

  function highlightText(text, q) {
    if (!text || !q) return escapeHtml(text);
    let escaped = escapeHtml(text);
    const terms = q.split(/\s+/).filter(function (t) { return t.length > 1; });
    terms.forEach(function (term) {
      const re = new RegExp('(' + escapeRegex(term) + ')', 'gi');
      escaped = escaped.replace(re, '<mark>$1</mark>');
    });
    return escaped;
  }

  function getSnippet(item, q) {
    const raw = item.current_content || item.description || item.summary || item.notes || '';
    if (!raw) return '';
    const firstTerm = (q || '').split(/\s+/)[0] || '';
    const idx = firstTerm ? raw.toLowerCase().indexOf(firstTerm.toLowerCase()) : -1;
    const start = idx > 60 ? idx - 60 : 0;
    const end = Math.min(raw.length, start + 220);
    let snippet = raw.substring(start, end).replace(/[#*_~>|!\\[\]]/g, '').replace(/\s+/g, ' ').trim();
    if (start > 0) snippet = '\u2026' + snippet;
    if (end < raw.length) snippet = snippet + '\u2026';
    return snippet;
  }

  function handleItemClick(item) {
    const type = item.result_type || 'article';
    if (type === 'article') onNavigate('article', item.id);
    else if (type === 'contact') onNavigate('contacts');
    else if (type === 'system') onNavigate('resources');
    else if (type === 'policy') onNavigate('policies');
  }

  const typeLabels = { all: 'All', article: '\uD83D\uDCC4 Articles', contact: '\uD83D\uDC64 Contacts', system: '\uD83D\uDCBB Systems', policy: '\uD83D\uDCCB Policies' };
  const typeBadgeColor = { article: 'bg-blue-50 text-blue-600', contact: 'bg-purple-50 text-purple-700', system: 'bg-green-50 text-green-700', policy: 'bg-orange-50 text-orange-700' };
  const typeOrder = ['all', 'article', 'contact', 'system', 'policy'];

  const typeCounts = results.reduce(function (acc, r) {
    const t = r.result_type || 'article';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const filtered = activeType === 'all' ? results : results.filter(function (r) { return (r.result_type || 'article') === activeType; });

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: () => onNavigate('home'), className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-1' }, 'Search Results'),
    React.createElement('p', { className: 'text-gray-500 mb-5' }, 'Results for "' + query + '"'),

    // Type filter chips
    !loading && results.length > 0 && React.createElement('div', { className: 'flex flex-wrap gap-2 mb-6' },
      typeOrder.filter(function (t) { return t === 'all' || typeCounts[t]; }).map(function (type) {
        const count = type === 'all' ? results.length : (typeCounts[type] || 0);
        const active = activeType === type;
        return React.createElement('button', {
          key: type,
          onClick: function () { setActiveType(type); },
          className: 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ' +
            (active ? 'bg-toledo-blue text-white border-toledo-blue' : 'bg-white text-gray-600 border-gray-200 hover:border-toledo-blue/40 hover:text-toledo-blue'),
        }, typeLabels[type] + ' (' + count + ')');
      })
    ),

    loading
      ? React.createElement('p', { className: 'text-center text-gray-500 py-8' }, 'Searching...')
      : filtered.length === 0
        ? React.createElement('p', { className: 'text-center text-gray-500 py-8' }, 'No results found. Try a different search term.')
        : React.createElement('div', { className: 'space-y-3' },
            filtered.map(function (item, idx) {
              const type = item.result_type || 'article';
              const title = item.title || '';
              const snippet = getSnippet(item, query);
              return React.createElement('button', {
                key: idx, onClick: function () { handleItemClick(item); },
                className: 'w-full bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all',
              },
                React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
                  React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full font-medium ' + (typeBadgeColor[type] || 'bg-gray-100 text-gray-600') }, typeLabels[type] || type),
                  type === 'article' && item.category_name && React.createElement('span', { className: 'text-xs text-gray-400' }, item.category_name)
                ),
                React.createElement('h3', { className: 'font-semibold text-gray-900 mb-1', dangerouslySetInnerHTML: { __html: highlightText(title, query) } }),
                snippet && React.createElement('p', { className: 'text-sm text-gray-500 line-clamp-2', dangerouslySetInnerHTML: { __html: highlightText(snippet, query) } }),
                type === 'contact' && React.createElement('div', { className: 'mt-2 flex flex-wrap gap-3 text-xs text-gray-400' },
                  item.email && React.createElement('span', null, '\u2709\uFE0F ' + item.email),
                  item.phone && React.createElement('span', null, '\uD83D\uDCDE ' + item.phone)
                )
              );
            })
          )
  );
}

// ── SubmitForm ────────────────────────────────────────────────────────────────
function SubmitForm({ currentUser, categories, onNavigate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [articleId, setArticleId] = useState('');
  const [requestType, setRequestType] = useState('content_update');
  const [priority, setPriority] = useState('normal');
  const [topicArea, setTopicArea] = useState('');
  const [sourceContext, setSourceContext] = useState('');
  const [articles, setArticles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [assignmentPreview, setAssignmentPreview] = useState(null);
  useEffect(() => { api('/articles').then(r => r.success && setArticles(r.data)); }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (!title.trim() && !content.trim() && !articleId && !topicArea && !sourceContext.trim()) {
      setAssignmentPreview(null);
      return;
    }

    const timer = setTimeout(() => {
      api('/submissions/assignment-preview', {
        method: 'POST',
        body: JSON.stringify({
          article_id: articleId ? parseInt(articleId, 10) : undefined,
          proposed_title: title,
          proposed_content: content,
          request_type: requestType,
          topic_area: topicArea || undefined,
          source_context: sourceContext || undefined,
        })
      }).then(r => {
        if (r.success) setAssignmentPreview(r.data);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [articleId, content, currentUser, requestType, sourceContext, title, topicArea]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    const payload = {
      author_id: currentUser.id,
      proposed_content: content,
      proposed_title: requestType === 'content_update' ? undefined : title,
      article_id: requestType === 'content_update' && articleId ? parseInt(articleId, 10) : undefined,
      request_type: requestType,
      priority,
      topic_area: topicArea || undefined,
      source_context: sourceContext || undefined,
    };
    const res = await api('/submissions', { method: 'POST', body: JSON.stringify(payload) });
    setSubmitting(false);
    if (res.success) {
      setSubmittedTicket(res.data || { id: res.id, assignment: assignmentPreview });
      setTitle('');
      setContent('');
      setArticleId('');
      setSourceContext('');
      setPriority('normal');
      setTopicArea('');
      setAssignmentPreview(null);
    }
  }

  const isEditFlow = requestType === 'content_update';
  const requestTypes = [
    { id: 'content_update', label: 'Edit existing content', desc: 'Route a correction or rewrite request' },
    { id: 'new_article', label: 'New knowledge article', desc: 'Add missing onboarding information' },
    { id: 'access_request', label: 'Access or setup issue', desc: 'Account, door, or system access gaps' },
    { id: 'policy_question', label: 'Policy clarification', desc: 'Rules, compliance, or process interpretation' },
    { id: 'process_gap', label: 'Workflow gap', desc: 'Something in onboarding is missing or confusing' },
    { id: 'bug_report', label: 'Portal bug', desc: 'Broken page, wrong link, or bad data' },
  ];

  if (!currentUser) return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 text-center' },
    React.createElement('p', { className: 'text-gray-500' }, 'Please log in to contribute.')
  );
  if (submittedTicket) return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-12 fade-in' },
    React.createElement('div', { className: 'bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm' },
      React.createElement('div', { className: 'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4' }, React.createElement(IconCheck)),
      React.createElement('p', { className: 'text-xs uppercase tracking-[0.2em] text-green-600 font-semibold mb-2' }, 'Ticket queued'),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Contribution Ticket #' + submittedTicket.id),
      React.createElement('p', { className: 'text-gray-500 mb-6' }, 'Your request is now in the moderation queue with a suggested owner from the current portal knowledge.'),
      submittedTicket.assignment && React.createElement('div', { className: 'bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-xl mx-auto mb-6' },
        React.createElement('p', { className: 'text-xs uppercase tracking-wide text-slate-500 mb-2' }, 'Suggested routing'),
        React.createElement('p', { className: 'text-sm font-semibold text-slate-900' }, submittedTicket.assignment.assigned_team || 'General Review Queue'),
        submittedTicket.assignment.assigned_to_name && React.createElement('p', { className: 'text-sm text-slate-600 mt-1' }, submittedTicket.assignment.assigned_to_name + (submittedTicket.assignment.assigned_to_email ? ' • ' + submittedTicket.assignment.assigned_to_email : '')),
        submittedTicket.assignment.assignment_reason && React.createElement('p', { className: 'text-xs text-slate-500 mt-2' }, submittedTicket.assignment.assignment_reason)
      ),
      React.createElement('div', { className: 'flex items-center justify-center gap-3' },
        React.createElement('button', { onClick: () => setSubmittedTicket(null), className: 'px-6 py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium' }, 'Open Another Ticket'),
        React.createElement('button', { onClick: () => onNavigate('home'), className: 'px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-toledo-blue hover:text-toledo-blue transition-colors text-sm font-medium' }, 'Back to Home')
      )
    )
  );
  return React.createElement('div', { className: 'max-w-6xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: () => onNavigate('home'), className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('div', { className: 'flex items-end justify-between gap-4 mb-8' },
      React.createElement('div', null,
        React.createElement('p', { className: 'text-xs uppercase tracking-[0.2em] text-toledo-blue font-semibold mb-2' }, 'Contribution Desk'),
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 mb-2' }, 'Create a ticket from what you found on the site'),
        React.createElement('p', { className: 'text-gray-500 max-w-2xl' }, 'Turn corrections, missing content, access issues, and policy questions into structured tickets. The form suggests an owner using the existing portal knowledge base and contact directory.')
      ),
      React.createElement('div', { className: 'hidden lg:block bg-toledo-dark text-white rounded-2xl px-5 py-4 min-w-[240px]' },
        React.createElement('p', { className: 'text-xs uppercase tracking-wide text-blue-200 mb-1' }, 'Routing mode'),
        React.createElement('p', { className: 'text-lg font-semibold' }, 'Portal-aware assignment'),
        React.createElement('p', { className: 'text-xs text-blue-200 mt-1' }, 'Uses current articles, categories, and contacts to suggest the right queue.')
      )
    ),
    React.createElement('form', { onSubmit: handleSubmit, className: 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6' },
      React.createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-3' }, 'Ticket type'),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
            requestTypes.map(function(type) {
              const active = requestType === type.id;
              return React.createElement('button', {
                key: type.id,
                type: 'button',
                onClick: () => setRequestType(type.id),
                className: 'text-left rounded-xl border p-4 transition-colors ' + (active ? 'border-toledo-blue bg-toledo-blue/5' : 'border-gray-200 hover:border-toledo-blue/40 hover:bg-gray-50')
              },
                React.createElement('p', { className: 'text-sm font-semibold text-gray-900' }, type.label),
                React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, type.desc)
              );
            })
          )
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Priority'),
            React.createElement('select', { value: priority, onChange: (e) => setPriority(e.target.value), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm bg-white' },
              ['low', 'normal', 'high', 'urgent'].map(level => React.createElement('option', { key: level, value: level }, level.charAt(0).toUpperCase() + level.slice(1)))
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Topic area'),
            React.createElement('select', { value: topicArea, onChange: (e) => setTopicArea(e.target.value), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm bg-white' },
              React.createElement('option', { value: '' }, 'Use the ticket details to infer this'),
              categories.map(cat => React.createElement('option', { key: cat.id, value: cat.name }, cat.name))
            )
          )
        ),
        isEditFlow && React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Related article on the site'),
          React.createElement('select', { value: articleId, onChange: (e) => setArticleId(e.target.value), required: isEditFlow, className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm bg-white' },
            React.createElement('option', { value: '' }, '-- Select an article to update --'),
            articles.map(a => React.createElement('option', { key: a.id, value: a.id }, a.title))
          )
        ),
        !isEditFlow && React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Ticket summary'),
          React.createElement('input', { type: 'text', value: title, onChange: (e) => setTitle(e.target.value), required: !isEditFlow, placeholder: 'Summarize what should be added or fixed', className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm' })
        ),
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'What on the site pointed you here?'),
          React.createElement('textarea', { value: sourceContext, onChange: (e) => setSourceContext(e.target.value), rows: 3, placeholder: 'Example: The parking article is missing visitor permit details, or the MyUT setup page links to the wrong step.', className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm resize-y' })
        ),
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, isEditFlow ? 'Requested changes' : 'Ticket details'),
          React.createElement('textarea', { value: content, onChange: (e) => setContent(e.target.value), required: true, rows: 12, placeholder: isEditFlow ? 'Describe the correction, missing step, or rewrite needed...' : 'Describe the missing knowledge, bug, access issue, or question in enough detail for review...', className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm resize-y' })
        ),
        React.createElement('div', { className: 'flex items-center justify-between gap-4 pt-2' },
          React.createElement('p', { className: 'text-xs text-gray-500 max-w-md' }, 'Tickets stay in moderation until approved. New article and content update tickets can still be published directly from the moderation queue.'),
          React.createElement('button', { type: 'submit', disabled: submitting, className: 'px-6 py-3 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap' },
            submitting ? 'Routing ticket...' : 'Submit Ticket'
          )
        )
      ),
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-sm' },
          React.createElement('p', { className: 'text-xs uppercase tracking-wide text-gray-500 mb-2' }, 'Suggested owner'),
          assignmentPreview
            ? React.createElement('div', null,
                React.createElement('p', { className: 'text-lg font-semibold text-gray-900' }, assignmentPreview.assigned_team || 'General Review Queue'),
                assignmentPreview.assigned_to_name && React.createElement('p', { className: 'text-sm text-gray-600 mt-1' }, assignmentPreview.assigned_to_name + (assignmentPreview.assigned_to_email ? ' • ' + assignmentPreview.assigned_to_email : '')),
                React.createElement('p', { className: 'text-xs text-gray-500 mt-3 leading-relaxed' }, assignmentPreview.assignment_reason)
              )
            : React.createElement('p', { className: 'text-sm text-gray-500' }, 'Start filling in the ticket and the portal will suggest the best queue and contact.')
        ),
        React.createElement('div', { className: 'bg-toledo-dark text-white rounded-2xl p-5 shadow-sm' },
          React.createElement('p', { className: 'text-xs uppercase tracking-wide text-blue-200 mb-2' }, 'How this works'),
          React.createElement('ol', { className: 'space-y-3 text-sm text-blue-50 list-decimal pl-4' },
            React.createElement('li', null, 'Pick the ticket type and describe the gap.'),
            React.createElement('li', null, 'The system checks existing categories, articles, and contacts.'),
            React.createElement('li', null, 'Moderators can approve, reject, or re-route from the queue.')
          )
        )
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
  const [contacts, setContacts] = useState([]);
  const [assignmentContactId, setAssignmentContactId] = useState({});
  const [assignmentReason, setAssignmentReason] = useState({});

  const loadData = useCallback(() => {
    if (activeTab === 'submissions') {
      api('/submissions?status=' + filter).then(r => r.success && setItems(r.data));
    } else {
      api('/tips/queue?status=' + filter).then(r => r.success && setItems(r.data));
    }
  }, [activeTab, filter]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (activeTab === 'submissions') {
      api('/contacts').then(r => r.success && setContacts(r.data || []));
    }
  }, [activeTab]);

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

  async function handleReassign(itemId) {
    const contactId = assignmentContactId[itemId];
    if (!contactId) return;
    setProcessing('assign-' + itemId);
    await api('/submissions/' + itemId + '/assignment', {
      method: 'PUT',
      body: JSON.stringify({
        contact_id: Number(contactId),
        assignment_reason: assignmentReason[itemId] || undefined,
      }),
    });
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
                ),
                React.createElement('div', { className: 'flex flex-wrap gap-2 mt-3' },
                  item.request_type && React.createElement('span', { className: 'px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium' }, item.request_type.replace(/_/g, ' ')),
                  item.priority && React.createElement('span', { className: 'px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium' }, item.priority),
                  item.topic_area && React.createElement('span', { className: 'px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium' }, item.topic_area)
                ),
                item.assigned_team && React.createElement('div', { className: 'mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700' },
                  React.createElement('p', { className: 'font-medium text-slate-900' }, 'Assigned queue: ' + item.assigned_team),
                  item.assigned_to_name && React.createElement('p', { className: 'text-xs text-slate-600 mt-1' }, item.assigned_to_name + (item.assigned_to_email ? ' • ' + item.assigned_to_email : '')),
                  item.assignment_reason && React.createElement('p', { className: 'text-xs text-slate-500 mt-2' }, item.assignment_reason)
                ),
                filter === 'pending' && React.createElement('div', { className: 'mt-3 bg-white border border-gray-200 rounded-lg p-3' },
                  React.createElement('p', { className: 'text-xs uppercase tracking-wide text-gray-500 mb-2' }, 'Manual reassignment'),
                  React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-2' },
                    React.createElement('div', { className: 'space-y-2' },
                      React.createElement('select', {
                        value: assignmentContactId[item.id] || '',
                        onChange: (e) => setAssignmentContactId(prev => Object.assign({}, prev, { [item.id]: e.target.value })),
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue bg-white'
                      },
                        React.createElement('option', { value: '' }, 'Choose a contact to assign'),
                        contacts.map(contact => React.createElement('option', { key: contact.id, value: contact.id },
                          (contact.function_area || contact.department || 'General') + ' — ' + (contact.contact_name || contact.email || 'Unassigned contact')
                        ))
                      ),
                      React.createElement('input', {
                        type: 'text',
                        value: assignmentReason[item.id] || '',
                        onChange: (e) => setAssignmentReason(prev => Object.assign({}, prev, { [item.id]: e.target.value })),
                        placeholder: 'Optional note about why this ticket is being rerouted',
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue'
                      })
                    ),
                    React.createElement('button', {
                      type: 'button',
                      onClick: () => handleReassign(item.id),
                      disabled: processing === 'assign-' + item.id || !assignmentContactId[item.id],
                      className: 'px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50'
                    }, processing === 'assign-' + item.id ? 'Updating...' : 'Reassign')
                  )
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
