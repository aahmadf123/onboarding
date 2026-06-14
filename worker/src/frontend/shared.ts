// Shared frontend code: hooks setup, api helper, icons, constants, Header, SearchBar, auth screens

export function getSharedCode(): string {
  return `
const { useState, useEffect, useCallback, useRef } = React;

// ── HTML sanitization ───────────────────────────────────────────────────────
// All markdown rendered via marked.parse() is run through DOMPurify before it
// is injected with dangerouslySetInnerHTML. We allow the Google-Maps <iframe>
// used by the ::map directive but enforce that its src is a Google Maps URL,
// so admin-authored (or AI-generated) content cannot inject arbitrary frames
// or scripts.
(function setupSanitizer() {
  if (typeof DOMPurify === 'undefined') return;
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if (node.tagName === 'IFRAME') {
      // Parse the URL and match the host exactly so look-alike domains like
      // maps.google.com.evil.example cannot pass a prefix check.
      var ok = false;
      try {
        var u = new URL(node.getAttribute('src') || '');
        ok = u.protocol === 'https:' && (
          u.hostname === 'maps.google.com' ||
          (u.hostname === 'www.google.com' && (u.pathname === '/maps' || u.pathname.startsWith('/maps/') || u.pathname.startsWith('/maps?')))
        );
      } catch (e) { ok = false; }
      if (!ok) { node.parentNode && node.parentNode.removeChild(node); return; }
      node.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    }
    // Force external links to open safely.
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
})();

function sanitizeHtml(html) {
  if (typeof DOMPurify === 'undefined') return html;
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['src', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'referrerpolicy', 'target', 'width', 'height'],
  });
}

// ── API Helper ────────────────────────────────────────────────────────────────
const API_BASE = '/api';

function getSessionToken() {
  try { return localStorage.getItem('toledo_session_token'); } catch (e) { return null; }
}

function setSessionToken(token) {
  try {
    if (token) localStorage.setItem('toledo_session_token', token);
    else localStorage.removeItem('toledo_session_token');
  } catch (e) {}
}

function clearAuthAndReload() {
  setSessionToken(null);
  try { localStorage.removeItem('toledo_auth_user'); } catch (e) {}
  window.location.href = '/';
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getSessionToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...options, headers });
  // A 401 outside the auth endpoints means the session is gone — start over.
  if (res.status === 401 && path.indexOf('/auth/') !== 0 && token) {
    clearAuthAndReload();
    return { success: false, error: 'Session expired' };
  }
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
function IconHome()          { return React.createElement(Icon, { d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }); }
function IconClipboardCheck() { return React.createElement(Icon, { d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }); }
function IconGrid()          { return React.createElement(Icon, { d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' }); }
function IconLock()          { return React.createElement(Icon, { d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }); }
function IconBuilding()      { return React.createElement(Icon, { d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }); }
function IconScale()         { return React.createElement(Icon, { d: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' }); }
function IconBriefcase()     { return React.createElement(Icon, { d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }); }
function IconDesktop()       { return React.createElement(Icon, { d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }); }
function IconMapPin()        { return React.createElement(Icon, { d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' }); }
function IconAcademicCap()   { return React.createElement(Icon, { d: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222' }); }
function IconBell()          { return React.createElement(Icon, { d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }); }
function IconClock()         { return React.createElement(Icon, { d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }); }
function IconMenu()          { return React.createElement(Icon, { d: 'M4 6h16M4 12h16M4 18h16' }); }

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_ICON_COMPONENTS = {
  'Department Overview': IconBuilding,
  'NCAA Compliance': IconClipboardCheck,
  'Title IX & Gender Equity': IconScale,
  'NIL (Name, Image & Likeness)': IconBriefcase,
  'HR & Benefits': IconUsers,
  'IT & Campus Access': IconDesktop,
  'Parking & Transportation': IconMapPin,
  'Student-Athlete Development': IconAcademicCap,
  'Relocation & Toledo Life': IconHome,
};

function CategoryIcon({ name }) {
  var Comp = CATEGORY_ICON_COMPONENTS[name] || IconDocument;
  return React.createElement('span', { className: 'w-10 h-10 rounded-xl bg-toledo-blue/8 text-toledo-blue flex items-center justify-center flex-shrink-0' },
    React.createElement(Comp)
  );
}

const ROLE_ARCHETYPES = [
  { id: 'Coach',            label: 'Coach / Sport Staff',   desc: 'Coaches and sport-specific athletic staff' },
  { id: 'Administrator',    label: 'Administrator',          desc: 'Athletic department administrative staff' },
  { id: 'Compliance Officer', label: 'Compliance Officer',  desc: 'NCAA compliance and eligibility staff' },
  { id: 'Athletic Trainer', label: 'Athletic Trainer',       desc: 'Sports medicine and training staff' },
  { id: 'Academic Advisor', label: 'Academic Advisor',       desc: 'Student-athlete academic support staff' },
  { id: 'Operations Staff', label: 'Operations Staff',       desc: 'Facilities, events, and operations staff' },
];

// ── App Shell (SidebarNav + TopBar) ───────────────────────────────────────────
var VIEW_TO_NAV = {
  home: 'home', search: 'home',
  guide: 'guide', checklist: 'guide',
  categories: 'categories', category: 'categories', article: 'categories',
  resources: 'resources', contacts: 'contacts', policies: 'policies',
  submit: 'submit', moderate: 'moderate', admin: 'admin',
};

function SidebarNav({ currentUser, currentView, onNavigate, onItemClick }) {
  var isMod = currentUser && (currentUser.role === 'moderator' || currentUser.role === 'admin');
  var isAdmin = currentUser && currentUser.role === 'admin';
  var activeNav = VIEW_TO_NAV[currentView] || currentView;

  var mainItems = [
    { id: 'home',       label: 'Dashboard',             icon: IconHome },
    { id: 'guide',      label: 'My Onboarding',         icon: IconClipboardCheck, tour: 'guide' },
    { id: 'policies',   label: 'Policies & Compliance', icon: IconDocument },
    { id: 'resources',  label: 'Systems & Tools',       icon: IconServer },
    { id: 'contacts',   label: 'People & Contacts',     icon: IconUsers, tour: 'contacts' },
    { id: 'categories', label: 'Browse Topics',         icon: IconGrid, tour: 'categories' },
    { id: 'submit',     label: 'Give Feedback',         icon: IconLightbulb, tour: 'submit' },
  ];
  var manageItems = [];
  if (isMod) manageItems.push({ id: 'moderate', label: 'Moderate', icon: IconFlag });
  if (isAdmin) manageItems.push({ id: 'admin', label: 'Admin', icon: IconLock });

  function go(viewId) {
    onNavigate(viewId);
    if (onItemClick) onItemClick();
  }

  function navBtn(item) {
    var active = activeNav === item.id;
    return React.createElement('button', {
      key: item.id,
      'data-tour': item.tour || undefined,
      onClick: function () { go(item.id); },
      'aria-current': active ? 'page' : undefined,
      className: 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ' +
        (active ? 'bg-toledo-gold text-toledo-blue font-semibold shadow-sm' : 'font-medium text-blue-200 hover:bg-white/10 hover:text-white'),
    },
      React.createElement('span', { className: 'flex-shrink-0' }, React.createElement(item.icon)),
      React.createElement('span', { className: 'truncate' }, item.label)
    );
  }

  return React.createElement('div', { className: 'flex flex-col h-full bg-gradient-to-b from-toledo-blue to-toledo-navy navy-texture text-white' },
    React.createElement('button', {
      onClick: function () { go('home'); },
      className: 'flex items-center gap-3 px-4 pt-5 pb-4 text-left',
    },
      React.createElement('img', { src: '/branding/Primary_Logo_for_Dark_Background.png', alt: 'Toledo Athletics', className: 'h-10 w-auto flex-shrink-0' }),
      React.createElement('div', { className: 'min-w-0' },
        React.createElement('p', { className: 'text-sm font-bold leading-tight' }, 'Toledo Athletics'),
        React.createElement('p', { className: 'text-[10px] uppercase tracking-[0.18em] text-toledo-gold leading-tight mt-0.5' }, 'Onboarding Portal')
      )
    ),
    React.createElement('p', { className: 'px-4 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300/70' }, 'Workspace'),
    React.createElement('nav', { className: 'flex-1 px-3 space-y-1 overflow-y-auto pb-2' },
      mainItems.map(navBtn),
      manageItems.length > 0 && React.createElement('div', { className: 'pt-3 mt-3 border-t border-white/10' },
        React.createElement('p', { className: 'px-1 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300/70' }, 'Manage'),
        manageItems.map(navBtn)
      )
    ),
    React.createElement('div', { className: 'px-3 pb-4 pt-3 border-t border-white/10' },
      React.createElement('button', {
        onClick: function () {
          try { window.dispatchEvent(new CustomEvent('toledo:open-feedback')); } catch (e) {}
          if (onItemClick) onItemClick();
        },
        className: 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors text-left',
      },
        React.createElement(IconFlag), 'Report an Issue'
      ),
      React.createElement('div', { className: 'mt-3 rounded-xl border border-white/10 bg-white/5 gold-trail px-3 py-3' },
        React.createElement('p', { className: 'text-[10px] uppercase tracking-[0.25em] text-blue-300' }, 'For'),
        React.createElement('p', { className: 'display-title text-xl text-toledo-gold leading-none mt-0.5' }, 'Toledo'),
        React.createElement('p', { className: 'text-[10px] text-blue-300 mt-1.5' }, '#TeamToledo')
      )
    )
  );
}

function TopBar({ currentUser, onNavigate, onSearch, onSignOut, onStartTour, onOpenDrawer, drawerOpen }) {
  return React.createElement('header', { className: 'sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-toledo-border' },
    React.createElement('div', { className: 'flex items-center gap-3 h-14 px-4' },
      React.createElement('button', {
        onClick: onOpenDrawer,
        'aria-expanded': drawerOpen ? 'true' : 'false',
        'aria-label': 'Open navigation menu',
        className: 'lg:hidden p-2 -ml-1 rounded-lg text-toledo-blue hover:bg-gray-100 flex-shrink-0',
      }, React.createElement(IconMenu)),
      React.createElement('div', { className: 'flex-1 max-w-xl' },
        React.createElement(SearchBar, { onSearch: onSearch, onNavigate: onNavigate, compact: true })
      ),
      React.createElement('div', { className: 'flex items-center gap-2 ml-auto flex-shrink-0' },
        onStartTour && React.createElement('button', {
          onClick: onStartTour,
          className: 'hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-toledo-slate hover:text-toledo-blue border border-toledo-border hover:border-toledo-blue/40 transition-colors',
          title: 'Quick Tour',
        }, '?'),
        currentUser && React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('div', { className: 'w-8 h-8 bg-toledo-gold text-toledo-blue rounded-full flex items-center justify-center text-xs font-bold' },
            currentUser.email[0].toUpperCase()
          ),
          React.createElement('span', { className: 'text-xs text-gray-700 font-medium hidden md:block max-w-[140px] truncate' }, currentUser.name || currentUser.email)
        ),
        currentUser && onSignOut && React.createElement('button', {
          onClick: onSignOut,
          className: 'hidden sm:block text-xs font-medium text-toledo-slate hover:text-toledo-blue border border-toledo-border hover:border-toledo-blue/40 px-2.5 py-1.5 rounded-lg transition-colors',
        }, 'Sign out')
      )
    )
  );
}

function AppShell({ currentUser, currentView, onNavigate, onSearch, onSignOut, onStartTour, children }) {
  var _drawerState = useState(false);
  var drawerOpen = _drawerState[0];
  var setDrawerOpen = _drawerState[1];
  var drawerRef = useRef(null);

  useEffect(function () {
    if (!drawerOpen) return;
    function onKey(e) { if (e.key === 'Escape') setDrawerOpen(false); }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Move focus into the drawer for keyboard users.
    setTimeout(function () {
      if (drawerRef.current) {
        var first = drawerRef.current.querySelector('button');
        if (first) first.focus();
      }
    }, 0);
    return function () {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  function closeDrawer() { setDrawerOpen(false); }

  return React.createElement('div', { className: 'min-h-screen bg-[#F4F7FB]' },
    React.createElement('aside', { className: 'hidden lg:block fixed inset-y-0 left-0 w-64 z-30' },
      React.createElement(SidebarNav, { currentUser: currentUser, currentView: currentView, onNavigate: onNavigate })
    ),
    drawerOpen && React.createElement('div', { className: 'lg:hidden' },
      React.createElement('div', { className: 'fixed inset-0 bg-black/50 z-40', onClick: closeDrawer }),
      React.createElement('aside', {
        ref: drawerRef,
        role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Navigation',
        className: 'fixed inset-y-0 left-0 w-72 z-50 drawer-in shadow-2xl',
      },
        React.createElement('button', {
          onClick: closeDrawer,
          'aria-label': 'Close navigation menu',
          className: 'absolute top-4 right-3 z-10 p-1.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white',
        }, React.createElement(IconX)),
        React.createElement(SidebarNav, { currentUser: currentUser, currentView: currentView, onNavigate: onNavigate, onItemClick: closeDrawer })
      )
    ),
    React.createElement('div', { className: 'lg:pl-64 flex flex-col min-h-screen' },
      React.createElement(TopBar, {
        currentUser: currentUser, onNavigate: onNavigate, onSearch: onSearch,
        onSignOut: onSignOut, onStartTour: onStartTour,
        onOpenDrawer: function () { setDrawerOpen(true); }, drawerOpen: drawerOpen,
      }),
      React.createElement('main', { className: 'flex-1 pb-24' }, children),
      React.createElement(Footer, { onNavigate: onNavigate })
    )
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
function SearchBar({ onSearch, onNavigate, compact }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(function () {
    function handleOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return function () { document.removeEventListener('mousedown', handleOutsideClick); };
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); setShowDrop(false); return; }
    debounceRef.current = setTimeout(function () {
      api('/search?q=' + encodeURIComponent(val.trim()))
        .then(function (r) {
          if (r.success && r.data.length > 0) { setSuggestions(r.data.slice(0, 5)); setShowDrop(true); }
          else { setSuggestions([]); setShowDrop(false); }
        })
        .catch(function () {});
    }, 300);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setShowDrop(false);
    if (q.trim()) onSearch(q.trim());
  }

  function handleSuggestionClick(item) {
    setShowDrop(false);
    setQ('');
    setSuggestions([]);
    const type = item.result_type || 'article';
    if (onNavigate) {
      if (type === 'article') onNavigate('article', item.id);
      else if (type === 'contact') onNavigate('contacts');
      else if (type === 'system') onNavigate('resources');
      else if (type === 'policy') onNavigate('policies');
      else onSearch(q.trim());
    } else {
      onSearch(item.title || q.trim());
    }
  }

  const typeColor = { article: 'bg-blue-50 text-blue-600', contact: 'bg-purple-50 text-purple-600', system: 'bg-green-50 text-green-600', policy: 'bg-orange-50 text-orange-600' };

  return React.createElement('div', { className: 'relative', ref: wrapRef },
    React.createElement('form', { onSubmit: handleSubmit, className: 'relative' },
      React.createElement('div', { className: 'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400' }, React.createElement(IconSearch)),
      React.createElement('input', {
        type: 'text', value: q, onChange: handleChange,
        onFocus: function () { if (suggestions.length > 0) setShowDrop(true); },
        placeholder: compact ? 'Search systems, policies, contacts...' : 'Search by topic, system, policy, or person...',
        className: 'w-full pl-12 pr-4 ' + (compact ? 'py-2 bg-gray-50 focus:bg-white border-toledo-border' : 'py-3 bg-white border-gray-200 shadow-sm') +
          ' border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm ' +
          (showDrop && suggestions.length > 0 ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'),
      })
    ),
    showDrop && suggestions.length > 0 && React.createElement('div', {
      className: 'absolute left-0 right-0 bg-white border border-gray-200 border-t-0 rounded-b-xl shadow-xl z-50 overflow-hidden',
    },
      suggestions.map(function (item, i) {
        const type = item.result_type || 'article';
        const title = item.title || '';
        const snippet = (item.current_content || item.description || item.summary || item.notes || '').substring(0, 70);
        const meta = item.category_name || item.function_area || item.category || item.department || item.policy_code || item.applies_to || '';
        return React.createElement('button', {
          key: i,
          onClick: function () { handleSuggestionClick(item); },
          className: 'w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-t border-gray-100 transition-colors',
        },
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('p', { className: 'text-sm font-medium text-gray-900 truncate' }, title),
            meta && React.createElement('p', { className: 'text-[11px] uppercase tracking-wide text-gray-400 mt-0.5 truncate' }, meta),
            snippet && React.createElement('p', { className: 'text-xs text-gray-400 truncate mt-0.5' }, snippet)
          ),
          React.createElement('span', { className: 'flex-shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ' + (typeColor[type] || 'bg-gray-100 text-gray-600') }, type)
        );
      }),
      React.createElement('button', {
        onClick: function () { setShowDrop(false); if (q.trim()) onSearch(q.trim()); },
        className: 'w-full px-4 py-2.5 text-sm text-toledo-blue font-medium border-t border-gray-100 hover:bg-toledo-blue/5 transition-colors text-center',
      }, 'See all results for "' + q + '" →')
    )
  );
}

// ── Auth screens ──────────────────────────────────────────────────────────────
function AuthShell({ children, subtitle }) {
  return React.createElement('div', { className: 'min-h-screen flex bg-toledo-navy' },
    // Brand panel with the Savage Arena photo (desktop only)
    React.createElement('div', { className: 'hidden lg:block relative w-1/2 overflow-hidden' },
      React.createElement('img', { src: '/branding/savage-arena.jpg', alt: '', className: 'absolute inset-0 w-full h-full object-cover' }),
      React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-t from-toledo-navy via-toledo-blue/75 to-toledo-blue/35' }),
      React.createElement('div', { className: 'relative z-10 flex flex-col justify-end h-full p-12 text-white' },
        React.createElement('span', { className: 'inline-block w-fit px-3 py-1 bg-toledo-gold text-toledo-blue text-xs font-bold uppercase tracking-[0.2em] rounded-full mb-4' }, 'For Toledo'),
        React.createElement('h2', { className: 'display-title text-5xl leading-tight' }, 'Built for Rockets'),
        React.createElement('p', { className: 'text-blue-200 mt-3 max-w-md text-sm leading-relaxed' }, 'Your first steps, key systems, and people — all in one place.')
      )
    ),
    React.createElement('div', { className: 'flex-1 flex items-center justify-center px-4 py-10 bg-gradient-to-br from-toledo-blue via-toledo-navy to-toledo-blue navy-texture' },
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in' },
        React.createElement('div', { className: 'text-center mb-8' },
          React.createElement('img', { src: '/branding/Primary_Logo_for_Light_Background.png', alt: 'Toledo Athletics', className: 'h-16 w-auto mx-auto mb-4' }),
          React.createElement('h1', { className: 'display-title text-2xl text-toledo-blue' }, 'Toledo Athletics'),
          React.createElement('p', { className: 'text-toledo-slate mt-1 text-sm' }, subtitle || 'Onboarding Portal')
        ),
        children
      )
    )
  );
}

function AuthInput(props) {
  return React.createElement('div', null,
    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, props.label),
    React.createElement('input', {
      type: props.type, value: props.value, onChange: props.onChange, required: true,
      placeholder: props.placeholder || '',
      autoComplete: props.autoComplete,
      className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue',
    }),
    props.hint && React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, props.hint)
  );
}

// LoginScreen: invite-only email + password (or one-time invite passcode).
function LoginScreen({ onLogin }) {
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'sent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: email, password: password }) });
    setLoading(false);
    if (res.success) onLogin(res.data);
    else setError(res.error || 'Sign in failed');
  }

  async function handleForgot(e) {
    e.preventDefault();
    setLoading(true); setError('');
    await api('/auth/forgot', { method: 'POST', body: JSON.stringify({ email: email }) });
    setLoading(false);
    setView('sent');
  }

  if (view === 'forgot' || view === 'sent') {
    return React.createElement(AuthShell, { subtitle: 'Reset your password' },
      view === 'sent'
        ? React.createElement('div', { className: 'text-center space-y-4' },
            React.createElement('p', { className: 'text-sm text-gray-600' }, 'If an account exists for ' + email + ', a reset link is on its way. The link is valid for 60 minutes.'),
            React.createElement('p', { className: 'text-xs text-gray-400' }, 'Nothing arriving? Ask an administrator to re-invite you instead.'),
            React.createElement('button', {
              onClick: function () { setView('login'); setError(''); },
              className: 'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold',
            }, 'Back to Sign In')
          )
        : React.createElement('form', { onSubmit: handleForgot, className: 'space-y-4' },
            React.createElement(AuthInput, { label: 'University Email', type: 'email', value: email, onChange: function (e) { setEmail(e.target.value); }, placeholder: 'your.name@utoledo.edu', autoComplete: 'email' }),
            error && React.createElement('p', { className: 'text-red-500 text-sm' }, error),
            React.createElement('button', {
              type: 'submit', disabled: loading,
              className: 'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold disabled:opacity-50',
            }, loading ? 'Sending...' : 'Email Me a Reset Link'),
            React.createElement('button', {
              type: 'button',
              onClick: function () { setView('login'); setError(''); },
              className: 'w-full text-xs text-gray-400 hover:text-gray-600 text-center',
            }, '← Back to sign in')
          )
    );
  }

  return React.createElement(AuthShell, null,
    React.createElement('form', { onSubmit: handleLogin, className: 'space-y-4' },
      React.createElement(AuthInput, { label: 'University Email', type: 'email', value: email, onChange: function (e) { setEmail(e.target.value); }, placeholder: 'your.name@utoledo.edu', autoComplete: 'email' }),
      React.createElement(AuthInput, { label: 'Password', type: 'password', value: password, onChange: function (e) { setPassword(e.target.value); }, placeholder: '••••••••••', autoComplete: 'current-password' }),
      error && React.createElement('p', { className: 'text-red-500 text-sm' }, error),
      React.createElement('button', {
        type: 'submit', disabled: loading,
        className: 'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold disabled:opacity-50',
      }, loading ? 'Signing in...' : 'Sign In'),
      React.createElement('button', {
        type: 'button',
        onClick: function () { setView('forgot'); setError(''); },
        className: 'w-full text-xs text-toledo-blue hover:text-toledo-dark text-center font-medium',
      }, 'Forgot password?'),
      React.createElement('div', { className: 'bg-blue-50 rounded-lg p-3' },
        React.createElement('p', { className: 'text-xs text-blue-700' },
          'First time here? Sign in with the one-time passcode from your invite email as your password. Access is by invitation — contact your administrator if you need an account.'
        )
      )
    )
  );
}

// ForceResetScreen: shown after first login (or an admin-forced reset) until
// the user chooses their own password.
function ForceResetScreen({ currentUser, onComplete, onSignOut }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (next.length < 10) { setError('New password must be at least 10 characters.'); return; }
    if (next !== confirm) { setError('New passwords do not match.'); return; }
    setLoading(true);
    const res = await api('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: current, new_password: next }),
    });
    setLoading(false);
    if (res.success) onComplete(res.data);
    else setError(res.error || 'Could not update the password');
  }

  return React.createElement(AuthShell, { subtitle: 'Choose your password' },
    React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
      React.createElement('p', { className: 'text-sm text-gray-600' },
        'Welcome' + (currentUser && (currentUser.name || currentUser.email) ? ', ' + (currentUser.name || currentUser.email) : '') + '! Before continuing, set a password of your own.'
      ),
      React.createElement(AuthInput, { label: 'Invite passcode (or current password)', type: 'password', value: current, onChange: function (e) { setCurrent(e.target.value); }, autoComplete: 'current-password' }),
      React.createElement(AuthInput, { label: 'New password', type: 'password', value: next, onChange: function (e) { setNext(e.target.value); }, hint: 'At least 10 characters.', autoComplete: 'new-password' }),
      React.createElement(AuthInput, { label: 'Confirm new password', type: 'password', value: confirm, onChange: function (e) { setConfirm(e.target.value); }, autoComplete: 'new-password' }),
      error && React.createElement('p', { className: 'text-red-500 text-sm' }, error),
      React.createElement('button', {
        type: 'submit', disabled: loading,
        className: 'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold disabled:opacity-50',
      }, loading ? 'Saving...' : 'Set Password & Continue'),
      onSignOut && React.createElement('button', {
        type: 'button', onClick: onSignOut,
        className: 'w-full text-xs text-gray-400 hover:text-gray-600 text-center',
      }, 'Sign out')
    )
  );
}

// ResetWithTokenScreen: landing page for /reset-password?token=… links.
function ResetWithTokenScreen({ token }) {
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (next.length < 10) { setError('New password must be at least 10 characters.'); return; }
    if (next !== confirm) { setError('New passwords do not match.'); return; }
    setLoading(true);
    const res = await api('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token: token, new_password: next }),
    });
    setLoading(false);
    if (res.success) setDone(true);
    else setError(res.error || 'Could not reset the password');
  }

  return React.createElement(AuthShell, { subtitle: 'Reset your password' },
    done
      ? React.createElement('div', { className: 'text-center space-y-4' },
          React.createElement('p', { className: 'text-sm text-gray-600' }, 'Your password has been updated. Sign in with your new password.'),
          React.createElement('button', {
            onClick: function () { window.location.href = '/'; },
            className: 'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold',
          }, 'Go to Sign In')
        )
      : React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
          React.createElement(AuthInput, { label: 'New password', type: 'password', value: next, onChange: function (e) { setNext(e.target.value); }, hint: 'At least 10 characters.', autoComplete: 'new-password' }),
          React.createElement(AuthInput, { label: 'Confirm new password', type: 'password', value: confirm, onChange: function (e) { setConfirm(e.target.value); }, autoComplete: 'new-password' }),
          error && React.createElement('p', { className: 'text-red-500 text-sm' }, error),
          React.createElement('button', {
            type: 'submit', disabled: loading,
            className: 'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold disabled:opacity-50',
          }, loading ? 'Saving...' : 'Reset Password'),
          React.createElement('button', {
            type: 'button', onClick: function () { window.location.href = '/'; },
            className: 'w-full text-xs text-gray-400 hover:text-gray-600 text-center',
          }, '← Back to sign in')
        )
  );
}
`;
}
