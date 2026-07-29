import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { EVENTS, emit } from '../lib/events';
import { PHASE_META, taskIsChecked } from '../lib/tasks';
import { CategoryIcon, IconCheck, IconCheckCircle, IconPlay } from '../components/Icon';
import type { NavigateFn, User } from '../lib/types';

const QUICK_LINKS = [
  { id: 'guide', num: '01', label: 'Checklist', desc: 'Your onboarding tasks' },
  { id: 'policies', num: '02', label: 'Policies', desc: 'Compliance & handbooks' },
  { id: 'resources', num: '03', label: 'Systems', desc: 'Tools & access' },
  { id: 'contacts', num: '04', label: 'Contacts', desc: 'People & departments' },
  { id: 'categories', num: '05', label: 'Topics', desc: 'Browse all guides' },
];

function railCard(title: string, children: React.ReactNode) {
  return React.createElement(
    'div',
    { className: 'bg-white rounded-2xl border border-toledo-border shadow-xs p-5' },
    React.createElement(
      'div',
      { className: 'flex items-center gap-2 mb-4' },
      React.createElement('span', {
        className: 'w-2 h-2 rounded-full bg-toledo-gold flex-shrink-0',
      }),
      React.createElement(
        'h3',
        { className: 'text-xs font-bold uppercase tracking-[0.14em] text-toledo-blue' },
        title
      )
    ),
    children
  );
}

interface HomePageProps {
  categories: any[];
  onNavigate: NavigateFn;
  /** Part of the page contract; the dashboard reads its own counts from /tasks. */
  stats?: any;
  onSearch?: (q: string) => void;
  currentUser?: User | null;
}

export function HomePage({ categories, onNavigate }: HomePageProps) {
  const [tasks, setTasks] = useState<any[] | null>(null);
  const [keyContacts, setKeyContacts] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  useEffect(function () {
    api('/tasks').then(function (r) {
      if (r.success) setTasks(r.data || []);
    });
    api('/contacts').then(function (r) {
      if (r.success) setKeyContacts((r.data || []).slice(0, 3));
    });
    api('/articles').then(function (r) {
      if (!r.success) return;
      const sorted = (r.data || []).slice().sort(function (a: any, b: any) {
        return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      });
      setNews(sorted.slice(0, 3));
    });
  }, []);

  const taskList = tasks || [];
  const total = taskList.length;
  const doneCount = taskList.filter(function (t) {
    return taskIsChecked(t.my_status);
  }).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const started = doneCount > 0;

  // Next best action: first unchecked required task, falling back to any open task.
  const openTasks = taskList.filter(function (t) {
    return !taskIsChecked(t.my_status);
  });
  const nextTask =
    openTasks.filter(function (t) {
      return t.priority === 'required';
    })[0] ||
    openTasks[0] ||
    null;

  // Right-rail "today": open required tasks first, then items awaiting review.
  const pendingReview = taskList.filter(function (t) {
    return t.my_status === 'pending_approval';
  });
  const todayItems = openTasks
    .filter(function (t) {
      return t.priority === 'required';
    })
    .concat(pendingReview)
    .slice(0, 4);

  const phaseIds = Object.keys(PHASE_META).sort(function (a, b) {
    return PHASE_META[a].order - PHASE_META[b].order;
  });
  const phaseStats = phaseIds
    .map(function (pid) {
      const pts = taskList.filter(function (t) {
        return t.phase === pid && t.audience !== 'assigned';
      });
      const pdone = pts.filter(function (t) {
        return taskIsChecked(t.my_status);
      }).length;
      return { id: pid, label: PHASE_META[pid].label, done: pdone, total: pts.length };
    })
    .filter(function (p) {
      return p.total > 0;
    });
  const currentPhaseIdx = phaseStats.findIndex(function (p) {
    return p.done < p.total;
  });

  function openChat() {
    emit(EVENTS.OPEN_CHAT);
  }

  return React.createElement(
    'div',
    { className: 'max-w-7xl mx-auto px-4 py-6 fade-in' },
    React.createElement(
      'div',
      {
        className:
          'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start',
      },

      // ── Main column ──
      React.createElement(
        'div',
        { className: 'space-y-6 min-w-0 stagger' },

        // Hero
        React.createElement(
          'div',
          { className: 'relative overflow-hidden rounded-2xl shadow-lg min-h-[280px] flex' },
          React.createElement('img', {
            src: '/branding/savage-arena.jpg',
            alt: 'Savage Arena',
            className: 'absolute inset-0 w-full h-full object-cover',
          }),
          React.createElement('div', {
            className:
              'absolute inset-0 bg-gradient-to-r from-toledo-blue via-toledo-blue/85 to-toledo-blue/30',
          }),
          React.createElement(
            'div',
            {
              className:
                'relative z-10 p-8 md:p-10 text-white flex flex-col justify-center max-w-xl',
            },
            React.createElement(
              'span',
              {
                className:
                  'inline-block w-fit px-3 py-1 bg-toledo-gold text-toledo-blue text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-4',
              },
              'For Toledo'
            ),
            React.createElement(
              'h1',
              { className: 'display-title text-3xl md:text-5xl leading-tight' },
              'Welcome to Toledo Athletics'
            ),
            React.createElement(
              'p',
              { className: 'text-blue-100 mt-3 text-sm md:text-base leading-relaxed' },
              'Your first steps, key systems, and people — all in one place.'
            ),
            React.createElement(
              'div',
              { className: 'flex flex-wrap gap-3 mt-6' },
              React.createElement(
                'button',
                {
                  onClick: function () {
                    onNavigate('guide');
                  },
                  className:
                    'inline-flex items-center gap-2 px-5 py-2.5 bg-toledo-gold text-toledo-blue rounded-lg font-semibold text-sm hover:bg-yellow-300 transition-colors',
                },
                React.createElement(IconPlay),
                started ? 'Continue Onboarding' : 'Start Onboarding'
              ),
              React.createElement(
                'button',
                {
                  onClick: openChat,
                  className:
                    'px-5 py-2.5 bg-white/10 border border-white/40 text-white rounded-lg font-medium text-sm hover:bg-white/20 transition-colors',
                },
                'Ask the Onboarding Assistant'
              )
            )
          )
        ),

        // Next best action
        nextTask &&
          React.createElement(
            'div',
            {
              className:
                'bg-white rounded-2xl border border-toledo-border shadow-xs p-6 gold-trail',
            },
            React.createElement(
              'p',
              {
                className:
                  'text-xs font-bold uppercase tracking-[0.14em] text-toledo-slate mb-2',
              },
              'Next Best Action'
            ),
            React.createElement(
              'div',
              { className: 'flex flex-col sm:flex-row sm:items-center gap-4 justify-between' },
              React.createElement(
                'div',
                { className: 'min-w-0' },
                React.createElement(
                  'h2',
                  { className: 'text-xl font-bold text-toledo-blue' },
                  nextTask.title
                ),
                React.createElement(
                  'p',
                  { className: 'text-sm text-toledo-slate mt-1' },
                  (PHASE_META[nextTask.phase] ? PHASE_META[nextTask.phase].label : '') +
                    (nextTask.priority === 'required' ? ' · Required' : '') +
                    (nextTask.requires_approval ? ' · Reviewed by an administrator' : '')
                )
              ),
              React.createElement(
                'button',
                {
                  onClick: function () {
                    onNavigate('guide');
                  },
                  className:
                    'flex-shrink-0 px-5 py-2.5 bg-toledo-blue text-white rounded-lg font-medium text-sm hover:bg-toledo-navy transition-colors',
                },
                'Open My Onboarding'
              )
            )
          ),
        !nextTask &&
          tasks !== null &&
          total > 0 &&
          React.createElement(
            'div',
            {
              className:
                'bg-white rounded-2xl border border-toledo-border shadow-xs p-6 flex items-center gap-3',
            },
            React.createElement(
              'span',
              {
                className:
                  'w-10 h-10 rounded-full bg-green-100 text-success flex items-center justify-center flex-shrink-0',
              },
              React.createElement(IconCheckCircle)
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'h2',
                { className: 'text-lg font-bold text-toledo-blue' },
                'All onboarding tasks complete'
              ),
              React.createElement(
                'p',
                { className: 'text-sm text-toledo-slate' },
                'Nothing waiting on you — explore the topics below or help improve the portal.'
              )
            )
          ),

        // Quick links
        React.createElement(
          'div',
          { className: 'bg-white rounded-2xl border border-toledo-border shadow-xs p-6' },
          React.createElement(
            'p',
            { className: 'text-xs font-bold uppercase tracking-[0.14em] text-toledo-slate mb-4' },
            'Quick Links'
          ),
          React.createElement(
            'div',
            { className: 'grid grid-cols-2 md:grid-cols-5 gap-3' },
            QUICK_LINKS.map(function (q) {
              return React.createElement(
                'button',
                {
                  key: q.id,
                  onClick: function () {
                    onNavigate(q.id);
                  },
                  className:
                    'group text-left rounded-xl border border-toledo-border p-4 hover:border-toledo-gold hover:shadow-md transition-all',
                },
                React.createElement(
                  'p',
                  { className: 'display-title text-2xl text-toledo-gold leading-none' },
                  q.num
                ),
                React.createElement(
                  'p',
                  {
                    className:
                      'text-sm font-semibold text-toledo-blue mt-2 group-hover:underline',
                  },
                  q.label
                ),
                React.createElement(
                  'p',
                  { className: 'text-[11px] text-toledo-slate mt-0.5 leading-snug' },
                  q.desc
                )
              );
            })
          )
        ),

        // Progress timeline
        React.createElement(
          'div',
          { className: 'bg-white rounded-2xl border border-toledo-border shadow-xs p-6' },
          React.createElement(
            'div',
            { className: 'flex items-center justify-between mb-4' },
            React.createElement(
              'p',
              { className: 'text-xs font-bold uppercase tracking-[0.14em] text-toledo-slate' },
              'Your Onboarding Progress'
            ),
            React.createElement(
              'p',
              { className: 'text-sm text-toledo-slate' },
              React.createElement(
                'span',
                { className: 'display-title text-xl text-toledo-blue mr-1' },
                doneCount + ' / ' + total
              ),
              'completed'
            )
          ),
          React.createElement(
            'div',
            { className: 'w-full bg-gray-100 rounded-full h-2.5 mb-6' },
            React.createElement('div', {
              className:
                'bg-gradient-to-r from-toledo-gold to-yellow-400 h-2.5 rounded-full transition-all duration-700',
              style: { width: pct + '%' },
            })
          ),
          phaseStats.length > 0 &&
            React.createElement(
              'div',
              { className: 'grid grid-cols-2 md:grid-cols-4 gap-3' },
              phaseStats.map(function (p, i) {
                const complete = p.done === p.total;
                const isCurrent = i === currentPhaseIdx;
                const circleCls = complete
                  ? 'bg-toledo-gold text-toledo-blue'
                  : isCurrent
                    ? 'bg-toledo-blue text-white ring-2 ring-toledo-gold ring-offset-2'
                    : 'bg-white text-gray-400 border-2 border-gray-200';
                return React.createElement(
                  'button',
                  {
                    key: p.id,
                    onClick: function () {
                      onNavigate('guide');
                    },
                    className:
                      'flex items-center gap-3 rounded-xl p-2 hover:bg-gray-50 transition-colors text-left',
                  },
                  React.createElement(
                    'span',
                    {
                      className:
                        'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ' +
                        circleCls,
                    },
                    complete ? React.createElement(IconCheck) : i + 1
                  ),
                  React.createElement(
                    'span',
                    { className: 'min-w-0' },
                    React.createElement(
                      'span',
                      { className: 'block text-xs font-semibold text-toledo-blue truncate' },
                      p.label
                    ),
                    React.createElement(
                      'span',
                      { className: 'block text-[11px] text-toledo-slate' },
                      p.done +
                        '/' +
                        p.total +
                        (isCurrent ? ' · current' : complete ? ' · done' : '')
                    )
                  )
                );
              })
            ),
          total > 0 &&
            doneCount === total &&
            React.createElement(
              'p',
              { className: 'text-success font-semibold text-sm mt-4 flex items-center gap-1.5' },
              React.createElement(IconCheckCircle),
              'You have completed all onboarding tasks!'
            )
        ),

        // Browse topics strip
        categories.length > 0 &&
          React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              { className: 'flex items-center justify-between mb-3' },
              React.createElement(
                'h2',
                { className: 'display-title text-lg text-toledo-blue' },
                'Browse Topics'
              ),
              React.createElement(
                'button',
                {
                  onClick: function () {
                    onNavigate('categories');
                  },
                  className: 'text-sm font-medium text-toledo-blue hover:underline',
                },
                'View all →'
              )
            ),
            React.createElement(
              'div',
              { className: 'grid grid-cols-1 sm:grid-cols-3 gap-3' },
              categories.slice(0, 3).map(function (cat) {
                return React.createElement(
                  'button',
                  {
                    key: cat.id,
                    onClick: function () {
                      onNavigate('category', cat.id);
                    },
                    className:
                      'bg-white rounded-2xl border border-toledo-border p-4 text-left hover:shadow-md hover:border-toledo-gold transition-all group flex items-start gap-3',
                  },
                  React.createElement(CategoryIcon, { name: cat.name }),
                  React.createElement(
                    'div',
                    { className: 'min-w-0' },
                    React.createElement(
                      'h3',
                      {
                        className:
                          'font-semibold text-sm text-gray-900 group-hover:text-toledo-blue transition-colors',
                      },
                      cat.name
                    ),
                    React.createElement(
                      'p',
                      { className: 'text-xs text-toledo-slate mt-1 line-clamp-2' },
                      cat.description
                    )
                  )
                );
              })
            )
          )
      ),

      // ── Right rail ──
      React.createElement(
        'div',
        { className: 'space-y-6 stagger' },

        railCard(
          'Today',
          tasks === null
            ? React.createElement('p', { className: 'text-sm text-toledo-slate' }, 'Loading…')
            : todayItems.length === 0
              ? React.createElement(
                  'p',
                  { className: 'text-sm text-toledo-slate' },
                  'Nothing due — you are all caught up.'
                )
              : React.createElement(
                  'div',
                  { className: 'space-y-2' },
                  React.createElement(
                    'p',
                    { className: 'text-lg font-bold text-toledo-blue mb-2' },
                    todayItems.length +
                      (todayItems.length === 1 ? ' priority task' : ' priority tasks')
                  ),
                  todayItems.map(function (t) {
                    const awaiting = t.my_status === 'pending_approval';
                    return React.createElement(
                      'button',
                      {
                        key: t.id,
                        onClick: function () {
                          onNavigate('guide');
                        },
                        className:
                          'w-full flex items-center gap-2.5 rounded-xl border border-toledo-border px-3 py-2.5 text-left hover:border-toledo-gold transition-colors',
                      },
                      React.createElement('span', {
                        className:
                          'w-2 h-2 rounded-full flex-shrink-0 ' +
                          (awaiting ? 'bg-warning' : 'bg-toledo-gold'),
                      }),
                      React.createElement(
                        'span',
                        { className: 'min-w-0 flex-1' },
                        React.createElement(
                          'span',
                          { className: 'block text-xs font-medium text-gray-900 truncate' },
                          t.title
                        ),
                        React.createElement(
                          'span',
                          { className: 'block text-[11px] text-toledo-slate' },
                          awaiting
                            ? 'Awaiting review'
                            : PHASE_META[t.phase]
                              ? PHASE_META[t.phase].label
                              : ''
                        )
                      )
                    );
                  }),
                  React.createElement(
                    'button',
                    {
                      onClick: function () {
                        onNavigate('guide');
                      },
                      className: 'text-xs font-semibold text-toledo-blue hover:underline pt-1',
                    },
                    'View all tasks →'
                  )
                )
        ),

        railCard(
          'Announcements',
          news.length === 0
            ? React.createElement(
                'p',
                { className: 'text-sm text-toledo-slate' },
                'No recent updates.'
              )
            : React.createElement(
                'div',
                { className: 'divide-y divide-gray-100' },
                news.map(function (a) {
                  return React.createElement(
                    'button',
                    {
                      key: a.id,
                      onClick: function () {
                        onNavigate('article', a.id);
                      },
                      className: 'w-full text-left py-2.5 first:pt-0 last:pb-0 group',
                    },
                    React.createElement(
                      'p',
                      {
                        className:
                          'text-xs font-medium text-gray-900 group-hover:text-toledo-blue transition-colors line-clamp-2',
                      },
                      a.title
                    ),
                    React.createElement(
                      'p',
                      { className: 'text-[11px] text-toledo-slate mt-0.5' },
                      'Updated ' + new Date(a.last_updated).toLocaleDateString()
                    )
                  );
                })
              )
        ),

        railCard(
          'Your Support Team',
          keyContacts.length === 0
            ? React.createElement(
                'p',
                { className: 'text-sm text-toledo-slate' },
                'No contacts available yet.'
              )
            : React.createElement(
                'div',
                { className: 'space-y-4' },
                keyContacts.map(function (c, i) {
                  return React.createElement(
                    'div',
                    { key: c.id || i, className: 'flex items-start gap-3' },
                    React.createElement(
                      'span',
                      {
                        className:
                          'w-9 h-9 rounded-full bg-toledo-blue text-toledo-gold flex items-center justify-center text-sm font-bold flex-shrink-0',
                      },
                      c.contact_name ? c.contact_name.charAt(0).toUpperCase() : '?'
                    ),
                    React.createElement(
                      'div',
                      { className: 'min-w-0 flex-1' },
                      React.createElement(
                        'p',
                        { className: 'text-sm font-semibold text-gray-900 truncate' },
                        c.contact_name
                      ),
                      (c.title || c.function_area) &&
                        React.createElement(
                          'p',
                          { className: 'text-[11px] text-toledo-slate truncate' },
                          c.title || c.function_area
                        ),
                      React.createElement(
                        'div',
                        { className: 'flex gap-2 mt-1.5' },
                        c.email &&
                          React.createElement(
                            'a',
                            {
                              href: 'mailto:' + c.email,
                              className:
                                'text-[11px] font-medium px-2 py-0.5 rounded-md bg-toledo-blue text-white hover:bg-toledo-navy transition-colors',
                            },
                            'Email'
                          ),
                        c.phone &&
                          React.createElement(
                            'a',
                            {
                              href: 'tel:' + c.phone,
                              className:
                                'text-[11px] font-medium px-2 py-0.5 rounded-md border border-toledo-border text-toledo-blue hover:border-toledo-blue transition-colors',
                            },
                            'Call'
                          )
                      )
                    )
                  );
                }),
                React.createElement(
                  'button',
                  {
                    onClick: function () {
                      onNavigate('contacts');
                    },
                    className: 'text-xs font-semibold text-toledo-blue hover:underline',
                  },
                  'Open directory →'
                )
              )
        )
      )
    )
  );
}
