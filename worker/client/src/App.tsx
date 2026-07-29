import React, { useCallback, useEffect, useState } from 'react';
import { api, clearCachedUser, getSessionToken, setCachedUser, setSessionToken } from './lib/api';
import { EVENTS, on } from './lib/events';
import { VIEW_TITLES, routeFromPath } from './lib/routes';
import { AppShell } from './components/AppShell';
import { LoadingSplash } from './components/LoadingSplash';
import { LoginScreen } from './auth/LoginScreen';
import { ForceResetScreen } from './auth/ForceResetScreen';
import { ResetWithTokenScreen } from './auth/ResetWithTokenScreen';
import type { User } from './lib/types';

const TOUR_KEY = 'toledo_tour_done_v1';

interface AuthState {
  loading: boolean;
  user: User | null;
  mustReset: boolean;
}

export function App() {
  // Pre-auth landing for password-reset links: /reset-password?token=…
  let resetToken: string | null = null;
  try {
    if (window.location.pathname === '/reset-password') {
      resetToken = new URLSearchParams(window.location.search).get('token');
    }
  } catch {
    /* non-fatal */
  }

  const initialRoute = routeFromPath(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    user: null,
    mustReset: false,
  });
  const [view, setView] = useState(initialRoute.view);
  const [viewParam, setViewParam] = useState(initialRoute.param);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showTour, setShowTour] = useState(false);

  const currentUser = authState.user;

  // Validate the cached session on boot instead of trusting localStorage.
  useEffect(function () {
    if (resetToken) {
      setAuthState({ loading: false, user: null, mustReset: false });
      return;
    }
    if (!getSessionToken()) {
      setAuthState({ loading: false, user: null, mustReset: false });
      return;
    }
    api('/auth/me')
      .then(function (r) {
        if (r.success) {
          finishLogin(
            {
              user: r.data.user,
              must_reset: r.data.must_reset,
              localstorage_migrated: r.data.localstorage_migrated,
            },
            false
          );
        } else {
          setSessionToken(null);
          setAuthState({ loading: false, user: null, mustReset: false });
        }
      })
      .catch(function () {
        setAuthState({ loading: false, user: null, mustReset: false });
      });
  }, []);

  const refreshStats = useCallback(function () {
    api('/stats').then(function (r) {
      if (r.success) setStats(r.data);
    });
  }, []);

  useEffect(
    function () {
      if (!authState.user || authState.mustReset) return;
      api('/categories').then(function (r) {
        if (r.success) setCategories(r.data);
      });
      refreshStats();
    },
    [authState.user, authState.mustReset, refreshStats]
  );

  // Keeps the outstanding-tasks banner accurate after a task is checked off.
  useEffect(
    function () {
      return on(EVENTS.TASKS_CHANGED, refreshStats);
    },
    [refreshStats]
  );

  // The API gate rejects a must_reset account with 403 on every route. Without
  // this the whole UI just sat on "Loading…" with no way forward.
  useEffect(function () {
    return on(EVENTS.PASSWORD_RESET_REQUIRED, function () {
      setAuthState(function (prev) {
        return { loading: false, user: prev.user, mustReset: true };
      });
    });
  }, []);

  // One-time import of the legacy localStorage checklist into the database.
  function migrateLocalChecklist(user: User) {
    let slugs: string[] = [];
    try {
      const saved = localStorage.getItem('checklist_' + user.email);
      if (saved) {
        const obj = JSON.parse(saved);
        slugs = Object.keys(obj).filter(function (k) {
          return obj[k];
        });
      }
    } catch {
      /* nothing to migrate */
    }
    api('/tasks/migrate-local', {
      method: 'POST',
      body: JSON.stringify({ slugs: slugs }),
    }).catch(function () {});
  }

  function afterAuthed(data: any, fromLoginForm: boolean) {
    if (!data.localstorage_migrated) migrateLocalChecklist(data.user);
    if (fromLoginForm) {
      // Only send admins straight to Admin when they arrived at the root.
      // Someone who followed a link to a specific article should still land
      // on that article after signing in.
      if (data.user.role === 'admin' && initialRoute.view === 'home' && !initialRoute.param) {
        navigate('admin');
        return;
      }
      try {
        if (!localStorage.getItem(TOUR_KEY)) setShowTour(true);
      } catch {
        /* storage disabled; skip the tour rather than fail */
      }
    }
  }

  function finishLogin(data: any, fromLoginForm: boolean) {
    if (data.token) setSessionToken(data.token);
    setCachedUser(data.user);
    setAuthState({ loading: false, user: data.user, mustReset: !!data.must_reset });
    if (!data.must_reset) afterAuthed(data, fromLoginForm);
  }

  function handleResetComplete(data: any) {
    setCachedUser(data.user);
    setAuthState({ loading: false, user: data.user, mustReset: false });
    afterAuthed(data, true);
  }

  function navigate(newView: string, param?: string | number | null, pushState?: boolean) {
    if (pushState !== false) {
      const url = '/' + newView + (param ? '/' + param : '');
      window.history.pushState({ view: newView, param: param || null }, '', url);
    }
    document.title = VIEW_TITLES[newView] || 'Toledo Athletics Onboarding';
    setView(newView);
    setViewParam(param != null ? String(param) : null);
    window.scrollTo(0, 0);
  }

  useEffect(function () {
    // Seed history with the route we actually rendered. This used to hardcode
    // {view:'home'}, which pinned every deep link to the Dashboard.
    const current = routeFromPath(window.location.pathname);
    window.history.replaceState(
      { view: current.view, param: current.param },
      '',
      window.location.pathname + window.location.search
    );
    function handlePopState(e: PopStateEvent) {
      if (e.state && e.state.view) {
        navigate(e.state.view, e.state.param, false);
      } else {
        const route = routeFromPath(window.location.pathname);
        navigate(route.view, route.param, false);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return function () {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function handleSearch(query: string) {
    navigate('search', query);
  }

  // Deliberately does not reload: the sign-out transition stays in-app so the
  // login screen animates in rather than the tab going white first.
  function handleSignOut() {
    api('/auth/logout', { method: 'POST' }).catch(function () {});
    setSessionToken(null);
    clearCachedUser();
    setAuthState({ loading: false, user: null, mustReset: false });
  }

  if (resetToken) {
    return React.createElement(ResetWithTokenScreen, { token: resetToken });
  }
  if (authState.loading) {
    return React.createElement(LoadingSplash);
  }
  if (!currentUser) {
    return React.createElement(LoginScreen, {
      onLogin: function (data) {
        finishLogin(data, true);
      },
    });
  }
  if (authState.mustReset) {
    return React.createElement(ForceResetScreen, {
      currentUser: currentUser,
      onComplete: handleResetComplete,
      onSignOut: handleSignOut,
    });
  }

  // Reminder emails to utoledo.edu addresses are filtered by the university's
  // mail system, so the weekly cron cannot be relied on to reach anyone. This
  // banner is the channel that actually works.
  const openRequired = stats && stats.my_open_required ? stats.my_open_required : 0;
  const taskReminder =
    openRequired > 0 &&
    view !== 'guide' &&
    view !== 'checklist' &&
    React.createElement(
      'div',
      { className: 'bg-toledo-gold/15 border-b border-toledo-gold/40' },
      React.createElement(
        'div',
        {
          className:
            'max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2',
        },
        React.createElement(
          'p',
          { className: 'text-sm text-toledo-blue' },
          React.createElement(
            'span',
            { className: 'font-semibold' },
            openRequired + (openRequired === 1 ? ' onboarding task' : ' onboarding tasks')
          ),
          ' still needs your attention.'
        ),
        React.createElement(
          'button',
          {
            onClick: function () {
              navigate('guide');
            },
            className: 'text-xs font-semibold text-toledo-blue underline hover:text-toledo-dark',
          },
          'View my onboarding'
        )
      )
    );

  // Scaffolding. The page components land in the next commits of the port;
  // until then this renders inside the real shell so the chrome, routing and
  // data fetches are all exercised. It reports the state the pages will consume
  // so a broken fetch shows up here rather than after the pages are written.
  const content = React.createElement(
    'div',
    { className: 'max-w-3xl mx-auto px-4 py-12 text-center text-gray-500 space-y-2' },
    React.createElement(
      'p',
      null,
      'This view has not been ported yet: ' + view + (viewParam ? ' / ' + viewParam : '')
    ),
    React.createElement(
      'p',
      { className: 'text-xs' },
      categories.length + ' categories loaded' + (showTour ? ' · tour requested' : '')
    )
  );

  return React.createElement(
    AppShell,
    {
      currentUser: currentUser,
      currentView: view,
      onNavigate: navigate,
      onSearch: handleSearch,
      onSignOut: handleSignOut,
      onStartTour: function () {
        setShowTour(true);
      },
    },
    taskReminder,
    content
  );
}
