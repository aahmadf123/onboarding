import React, { useEffect, useRef, useState } from 'react';
import { EVENTS, emit } from '../lib/events';
import { SearchBar } from './SearchBar';
import { Footer } from './Footer';
import {
  IconClipboardCheck,
  IconDocument,
  IconFlag,
  IconGrid,
  IconHome,
  IconLightbulb,
  IconLock,
  IconMenu,
  IconServer,
  IconUsers,
  IconX,
} from './Icon';
import type { NavigateFn, User } from '../lib/types';

/**
 * Which sidebar entry lights up for a given view. Detail views highlight the
 * section they were reached through, so opening an article keeps "Browse
 * Topics" active rather than clearing the whole nav.
 */
const VIEW_TO_NAV: Record<string, string> = {
  home: 'home',
  search: 'home',
  guide: 'guide',
  checklist: 'guide',
  categories: 'categories',
  category: 'categories',
  article: 'categories',
  resources: 'resources',
  contacts: 'contacts',
  policies: 'policies',
  submit: 'submit',
  moderate: 'moderate',
  admin: 'admin',
};

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  tour?: string;
}

interface SidebarNavProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: NavigateFn;
  onItemClick?: () => void;
  /** Only passed for the mobile drawer; the desktop sidebar has none. */
  onSignOut?: () => void;
}

function SidebarNav({
  currentUser,
  currentView,
  onNavigate,
  onItemClick,
  onSignOut,
}: SidebarNavProps) {
  const isMod = currentUser && (currentUser.role === 'moderator' || currentUser.role === 'admin');
  const isAdmin = currentUser && currentUser.role === 'admin';
  const activeNav = VIEW_TO_NAV[currentView] || currentView;

  const mainItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: IconHome },
    { id: 'guide', label: 'My Onboarding', icon: IconClipboardCheck, tour: 'guide' },
    { id: 'policies', label: 'Policies & Compliance', icon: IconDocument },
    { id: 'resources', label: 'Systems & Tools', icon: IconServer },
    { id: 'contacts', label: 'People & Contacts', icon: IconUsers, tour: 'contacts' },
    { id: 'categories', label: 'Browse Topics', icon: IconGrid, tour: 'categories' },
    { id: 'submit', label: 'Give Feedback', icon: IconLightbulb, tour: 'submit' },
  ];
  const manageItems: NavItem[] = [];
  if (isMod) manageItems.push({ id: 'moderate', label: 'Moderate', icon: IconFlag });
  if (isAdmin) manageItems.push({ id: 'admin', label: 'Admin', icon: IconLock });

  function go(viewId: string) {
    onNavigate(viewId);
    if (onItemClick) onItemClick();
  }

  function navBtn(item: NavItem) {
    const active = activeNav === item.id;
    return React.createElement(
      'button',
      {
        key: item.id,
        'data-tour': item.tour || undefined,
        onClick: function () {
          go(item.id);
        },
        'aria-current': active ? 'page' : undefined,
        className:
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ' +
          (active
            ? 'bg-toledo-gold text-toledo-blue font-semibold shadow-xs'
            : 'font-medium text-blue-200 hover:bg-white/10 hover:text-white'),
      },
      React.createElement('span', { className: 'flex-shrink-0' }, React.createElement(item.icon)),
      React.createElement('span', { className: 'truncate' }, item.label)
    );
  }

  return React.createElement(
    'div',
    {
      className:
        'flex flex-col h-full navy-gradient text-white',
    },
    React.createElement(
      'button',
      {
        onClick: function () {
          go('home');
        },
        className: 'flex items-center gap-3 px-4 pt-5 pb-4 text-left',
      },
      React.createElement('img', {
        src: '/branding/Primary_Logo_for_Dark_Background.png',
        alt: 'Toledo Athletics',
        className: 'h-10 w-auto flex-shrink-0',
      }),
      React.createElement(
        'div',
        { className: 'min-w-0' },
        React.createElement('p', { className: 'text-sm font-bold leading-tight' }, 'Toledo Athletics'),
        React.createElement(
          'p',
          {
            className:
              'text-[10px] uppercase tracking-[0.18em] text-toledo-gold leading-tight mt-0.5',
          },
          'Onboarding Portal'
        )
      )
    ),
    React.createElement(
      'p',
      {
        className:
          'px-4 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300',
      },
      'Workspace'
    ),
    React.createElement(
      'nav',
      { className: 'flex-1 px-3 space-y-1 overflow-y-auto pb-2' },
      mainItems.map(navBtn),
      manageItems.length > 0 &&
        React.createElement(
          'div',
          { className: 'pt-3 mt-3 border-t border-white/10' },
          React.createElement(
            'p',
            {
              className:
                'px-1 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300',
            },
            'Manage'
          ),
          manageItems.map(navBtn)
        )
    ),
    React.createElement(
      'div',
      { className: 'px-3 pb-4 pt-3 border-t border-white/10' },
      React.createElement(
        'button',
        {
          onClick: function () {
            emit(EVENTS.OPEN_FEEDBACK);
            if (onItemClick) onItemClick();
          },
          className:
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors text-left',
        },
        React.createElement(IconFlag),
        'Report an Issue'
      ),
      // The top bar's Sign out is `hidden sm:block` and the drawer had no
      // equivalent, so on a phone there was no way to sign out at all.
      onSignOut &&
        React.createElement(
          'button',
          {
            onClick: onSignOut,
            className:
              'w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-xs font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors text-left',
          },
          React.createElement(IconLock),
          'Sign out'
        ),
      React.createElement(
        'div',
        { className: 'mt-3 rounded-xl border border-white/10 bg-white/5 gold-trail px-3 py-3' },
        React.createElement(
          'p',
          { className: 'text-[10px] uppercase tracking-[0.25em] text-blue-300' },
          'For'
        ),
        React.createElement(
          'p',
          { className: 'display-title text-xl text-toledo-gold leading-none mt-0.5' },
          'Toledo'
        ),
        React.createElement('p', { className: 'text-[10px] text-blue-300 mt-1.5' }, '#TeamToledo')
      )
    )
  );
}

interface TopBarProps {
  currentUser: User | null;
  onNavigate: NavigateFn;
  onSearch: (q: string) => void;
  onSignOut?: () => void;
  onStartTour?: () => void;
  onOpenDrawer: () => void;
  drawerOpen: boolean;
}

function TopBar({
  currentUser,
  onNavigate,
  onSearch,
  onSignOut,
  onStartTour,
  onOpenDrawer,
  drawerOpen,
}: TopBarProps) {
  return React.createElement(
    'header',
    {
      className: 'sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-toledo-border',
    },
    React.createElement(
      'div',
      { className: 'flex items-center gap-3 h-14 px-4' },
      React.createElement(
        'button',
        {
          onClick: onOpenDrawer,
          'aria-expanded': drawerOpen ? 'true' : 'false',
          'aria-label': 'Open navigation menu',
          className:
            'lg:hidden p-2 -ml-1 rounded-lg text-toledo-blue hover:bg-gray-100 flex-shrink-0',
        },
        React.createElement(IconMenu)
      ),
      React.createElement(
        'div',
        { className: 'flex-1 max-w-xl' },
        React.createElement(SearchBar, { onSearch: onSearch, onNavigate: onNavigate, compact: true })
      ),
      React.createElement(
        'div',
        { className: 'flex items-center gap-2 ml-auto flex-shrink-0' },
        onStartTour &&
          React.createElement(
            'button',
            {
              onClick: onStartTour,
              className:
                'hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-toledo-slate hover:text-toledo-blue border border-toledo-border hover:border-toledo-blue/40 transition-colors',
              title: 'Quick Tour',
            },
            '?'
          ),
        currentUser &&
          React.createElement(
            'div',
            { className: 'flex items-center gap-2' },
            React.createElement(
              'div',
              {
                className:
                  'w-8 h-8 bg-toledo-gold text-toledo-blue rounded-full flex items-center justify-center text-xs font-bold',
              },
              currentUser.email[0].toUpperCase()
            ),
            React.createElement(
              'span',
              {
                className:
                  'text-xs text-gray-700 font-medium hidden md:block max-w-[140px] truncate',
              },
              currentUser.name || currentUser.email
            )
          ),
        currentUser &&
          onSignOut &&
          React.createElement(
            'button',
            {
              onClick: onSignOut,
              className:
                'hidden sm:block text-xs font-medium text-toledo-slate hover:text-toledo-blue border border-toledo-border hover:border-toledo-blue/40 px-2.5 py-1.5 rounded-lg transition-colors',
            },
            'Sign out'
          )
      )
    )
  );
}

interface AppShellProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: NavigateFn;
  onSearch: (q: string) => void;
  onSignOut?: () => void;
  onStartTour?: () => void;
  children?: React.ReactNode;
}

export function AppShell({
  currentUser,
  currentView,
  onNavigate,
  onSearch,
  onSignOut,
  onStartTour,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(
    function () {
      if (!drawerOpen) return;
      function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') setDrawerOpen(false);
      }
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
      // Move focus into the drawer for keyboard users.
      setTimeout(function () {
        if (drawerRef.current) {
          const first = drawerRef.current.querySelector('button');
          if (first) first.focus();
        }
      }, 0);
      return function () {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
      };
    },
    [drawerOpen]
  );

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-[#F4F7FB]' },
    // Keyboard users had to tab through the whole sidebar on every page.
    React.createElement(
      'a',
      {
        href: '#main-content',
        className:
          'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-toledo-blue focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold',
      },
      'Skip to main content'
    ),
    React.createElement(
      'aside',
      { className: 'hidden lg:block fixed inset-y-0 left-0 w-64 z-30' },
      React.createElement(SidebarNav, {
        currentUser: currentUser,
        currentView: currentView,
        onNavigate: onNavigate,
      })
    ),
    drawerOpen &&
      React.createElement(
        'div',
        { className: 'lg:hidden' },
        React.createElement('div', {
          className: 'fixed inset-0 bg-black/50 z-40',
          onClick: closeDrawer,
        }),
        React.createElement(
          'aside',
          {
            ref: drawerRef,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': 'Navigation',
            className: 'fixed inset-y-0 left-0 w-72 z-50 drawer-in shadow-2xl',
          },
          React.createElement(
            'button',
            {
              onClick: closeDrawer,
              'aria-label': 'Close navigation menu',
              className:
                'absolute top-4 right-3 z-10 p-1.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white',
            },
            React.createElement(IconX)
          ),
          React.createElement(SidebarNav, {
            currentUser: currentUser,
            currentView: currentView,
            onNavigate: onNavigate,
            onItemClick: closeDrawer,
            onSignOut: onSignOut,
          })
        )
      ),
    React.createElement(
      'div',
      { className: 'lg:pl-64 flex flex-col min-h-screen' },
      React.createElement(TopBar, {
        currentUser: currentUser,
        onNavigate: onNavigate,
        onSearch: onSearch,
        onSignOut: onSignOut,
        onStartTour: onStartTour,
        onOpenDrawer: function () {
          setDrawerOpen(true);
        },
        drawerOpen: drawerOpen,
      }),
        React.createElement('main', { id: 'main-content', className: 'flex-1 pb-24', tabIndex: -1 }, children),
      React.createElement(Footer, { onNavigate: onNavigate })
    )
  );
}
