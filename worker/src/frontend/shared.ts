// Shared frontend code: hooks setup, api helper, icons, constants, Header, SearchBar, LoginScreen

export function getSharedCode(): string {
  return `
const { useState, useEffect, useCallback, useRef } = React;

// ── API Helper ────────────────────────────────────────────────────────────────
const API_BASE = '/api';
let _currentUserId = null;

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (_currentUserId) headers['x-user-id'] = String(_currentUserId);
  const res = await fetch(API_BASE + path, { ...options, headers });
  return res.json();
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ d, size = 'w-5 h-5', fill = 'none', strokeWidth = 2 }) {
  return React.createElement('svg', { className: size, fill, stroke: 'currentColor', viewBox: '0 0 24 24' },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth, d })
  );
}

function IconSearch()        { return React.createElement(Icon, { d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' }); }
function IconPlus()          { return React.createElement(Icon, { d: 'M12 4v16m8-8H4' }); }
function IconCheck()         { return React.createElement(Icon, { d: 'M5 13l4 4L19 7' }); }
function IconX()             { return React.createElement(Icon, { d: 'M6 18L18 6M6 6l12 12' }); }
function IconArrowLeft()     { return React.createElement(Icon, { d: 'M10 19l-7-7m0 0l7-7m-7 7h18' }); }
function IconChevronDown()   { return React.createElement(Icon, { d: 'M19 9l-7 7-7-7', size: 'w-4 h-4' }); }
function IconChevronRight()  { return React.createElement(Icon, { d: 'M9 5l7 7-7 7', size: 'w-4 h-4' }); }
function IconSend()          { return React.createElement(Icon, { d: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' }); }
function IconBookmark()      { return React.createElement(Icon, { d: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' }); }
function IconCheckCircle()   { return React.createElement(Icon, { d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }); }
function IconExternalLink()  { return React.createElement(Icon, { d: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14', size: 'w-4 h-4' }); }
function IconFlag()          { return React.createElement(Icon, { d: 'M3 21V4m0 0l4 2 4-2 4 2 4-2v13l-4 2-4-2-4 2-4-2V4z', size: 'w-4 h-4' }); }
function IconLightbulb()     { return React.createElement(Icon, { d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' }); }
function IconUsers()         { return React.createElement(Icon, { d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' }); }
function IconVideo()         { return React.createElement(Icon, { d: 'M15 10l4.553-2.069A1 1 0 0121 8.807V15.19a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' }); }
function IconSparkles()      { return React.createElement(Icon, { d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' }); }
function IconLink()          { return React.createElement(Icon, { d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' }); }
function IconDocument()      { return React.createElement(Icon, { d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }); }
function IconServer()        { return React.createElement(Icon, { d: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2' }); }
function IconMessageCircle() { return React.createElement(Icon, { d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', size: 'w-6 h-6' }); }
function IconPlay()          { return React.createElement('svg', { className: 'w-4 h-4', fill: 'currentColor', viewBox: '0 0 24 24' }, React.createElement('path', { d: 'M8 5v14l11-7z' })); }

// ── Constants ─────────────────────────────────────────────────────────────────
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

const ROLE_ARCHETYPES = [
  { id: 'Coach',            label: 'Coach / Sport Staff',   desc: 'Coaches and sport-specific athletic staff' },
  { id: 'Administrator',    label: 'Administrator',          desc: 'Athletic department administrative staff' },
  { id: 'Compliance Officer', label: 'Compliance Officer',  desc: 'NCAA compliance and eligibility staff' },
  { id: 'Athletic Trainer', label: 'Athletic Trainer',       desc: 'Sports medicine and training staff' },
  { id: 'Academic Advisor', label: 'Academic Advisor',       desc: 'Student-athlete academic support staff' },
  { id: 'Operations Staff', label: 'Operations Staff',       desc: 'Facilities, events, and operations staff' },
];

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ currentUser, onNavigate, currentView, onSignOut, onStartTour }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMod = currentUser && (currentUser.role === 'moderator' || currentUser.role === 'admin');

  const navItems = [
    { id: 'home',       label: 'Home' },
    { id: 'guide',      label: 'My Onboarding' },
    { id: 'categories', label: 'Browse' },
    { id: 'orgchart',   label: 'Org Chart' },
    { id: 'resources',  label: 'Resources' },
    { id: 'contacts',   label: 'Contacts' },
    { id: 'policies',   label: 'Policies' },
    { id: 'submit',     label: 'Contribute' },
    ...(isMod ? [{ id: 'moderate', label: 'Moderate' }] : []),
  ];

  const navBtn = (item) => React.createElement('button', {
    key: item.id,
    onClick: () => { onNavigate(item.id); setMenuOpen(false); },
    className: 'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ' +
      (currentView === item.id ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'),
  }, item.label);

  return React.createElement('header', { className: 'bg-toledo-blue text-white shadow-lg sticky top-0 z-50' },
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4' },
      React.createElement('div', { className: 'flex items-center justify-between h-14' },
        // Logo
        React.createElement('div', { className: 'flex items-center gap-3 cursor-pointer flex-shrink-0', onClick: () => onNavigate('home') },
          React.createElement('img', { src: '/branding/Primary_Logo_for_Dark_Background.png', alt: 'Toledo Athletics', className: 'h-9 w-auto' }),
          React.createElement('div', { className: 'hidden sm:block' },
            React.createElement('p', { className: 'text-sm font-bold leading-tight' }, 'Toledo Athletics'),
            React.createElement('p', { className: 'text-xs text-blue-200 leading-tight' }, 'Onboarding Portal'),
          )
        ),
        // Desktop nav
        React.createElement('nav', { className: 'hidden lg:flex items-center gap-0.5 flex-1 justify-center' },
          navItems.map(navBtn)
        ),
        // User avatar + mobile toggle
        React.createElement('div', { className: 'flex items-center gap-2' },
          currentUser && React.createElement('div', { className: 'hidden sm:flex items-center gap-2' },
            React.createElement('div', { className: 'w-7 h-7 bg-toledo-gold text-toledo-blue rounded-full flex items-center justify-center text-xs font-bold' },
              currentUser.email[0].toUpperCase()
            ),
            React.createElement('span', { className: 'text-xs text-blue-200 hidden md:block max-w-[130px] truncate' }, currentUser.email)
          ),
          currentUser && onSignOut && React.createElement('button', {
            onClick: onSignOut,
            className: 'hidden sm:flex items-center gap-1 text-xs text-blue-200 hover:text-white border border-blue-400/30 hover:border-white/40 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0',
          }, '↩ Sign out'),
          onStartTour && React.createElement('button', {
            onClick: onStartTour,
            className: 'hidden sm:flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-blue-200 hover:text-white border border-blue-400/30 hover:border-white/40 transition-colors flex-shrink-0',
            title: 'Quick Tour',
          }, '?'),
          React.createElement('button', {
            className: 'lg:hidden p-1.5 rounded-lg text-blue-200 hover:bg-white/10',
            onClick: () => setMenuOpen(m => !m),
          },
            menuOpen
              ? React.createElement(IconX)
              : React.createElement(Icon, { d: 'M4 6h16M4 12h16M4 18h16', size: 'w-5 h-5' })
          )
        )
      ),
      // Mobile menu
      menuOpen && React.createElement('div', { className: 'lg:hidden border-t border-white/20 py-2 pb-3' },
        React.createElement('div', { className: 'grid grid-cols-3 gap-1 mb-2' },
          navItems.map(navBtn)
        ),
        React.createElement('div', { className: 'flex gap-2 mt-1' },
          onSignOut && React.createElement('button', {
            onClick: function () { setMenuOpen(false); onSignOut(); },
            className: 'flex-1 py-1.5 text-xs text-red-300 hover:text-white border border-red-400/30 hover:border-red-300/60 rounded-lg transition-colors',
          }, '↩ Sign Out'),
          onStartTour && React.createElement('button', {
            onClick: function () { setMenuOpen(false); onStartTour(); },
            className: 'flex-1 py-1.5 text-xs text-blue-200 hover:text-white border border-blue-400/30 hover:border-white/40 rounded-lg transition-colors',
          }, '? Quick Tour')
        )
      )
    )
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
function SearchBar({ onSearch }) {
  const [q, setQ] = useState('');
  return React.createElement('form', {
    onSubmit: (e) => { e.preventDefault(); if (q.trim()) onSearch(q.trim()); },
    className: 'relative',
  },
    React.createElement('div', { className: 'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400' }, React.createElement(IconSearch)),
    React.createElement('input', {
      type: 'text', value: q, onChange: (e) => setQ(e.target.value),
      placeholder: 'Search articles, policies, procedures...',
      className: 'w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-toledo-blue shadow-sm text-sm',
    })
  );
}

// ── LoginScreen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await api('/users', { method: 'POST', body: JSON.stringify({ email }) });
    setLoading(false);
    if (res.success) onLogin(res.data);
    else setError(res.error || 'Login failed');
  }

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-toledo-blue via-toledo-dark to-toledo-blue flex items-center justify-center px-4' },
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in' },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('img', { src: '/branding/Primary_Logo_for_Light_Background.png', alt: 'Toledo Athletics', className: 'h-16 w-auto mx-auto mb-4' }),
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Toledo Athletics'),
        React.createElement('p', { className: 'text-gray-500 mt-1' }, 'Onboarding Portal')
      ),
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'University Email'),
          React.createElement('input', {
            type: 'email', value: email, onChange: (e) => setEmail(e.target.value), required: true,
            placeholder: 'your.name@utoledo.edu',
            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue',
          })
        ),
        error && React.createElement('p', { className: 'text-red-500 text-sm' }, error),
        React.createElement('button', {
          type: 'submit', disabled: loading,
          className: 'w-full py-3 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors font-medium disabled:opacity-50',
        }, loading ? 'Signing in...' : 'Sign In'),
        React.createElement('p', { className: 'text-xs text-gray-400 text-center' }, 'Enter your university email to access the portal.')
      )
    )
  );
}
`;
}
