import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { IconExternalLink, IconLink, IconServer } from '../components/Icon';
import type { NavigateFn } from '../lib/types';

const TABS = [
  { id: 'links', label: 'Quick Links', icon: IconLink },
  { id: 'systems', label: 'Systems', icon: IconServer },
];

/** onNavigate is part of the page contract but this view has no internal links. */
export function ResourcesPage(_props: { onNavigate: NavigateFn }) {
  const [links, setLinks] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('links');
  const [filter, setFilter] = useState('');

  useEffect(function () {
    Promise.all([
      api('/quicklinks').then(function (r) {
        if (r.success) setLinks(r.data || []);
      }),
      api('/systems').then(function (r) {
        if (r.success) setSystems(r.data || []);
      }),
    ]).then(function () {
      setLoading(false);
    });
  }, []);

  if (loading)
    return React.createElement(
      'div',
      { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' },
      'Loading...'
    );

  const q = filter.trim().toLowerCase();
  function matches(parts: string[]) {
    if (!q) return true;
    return parts.join(' ').toLowerCase().indexOf(q) !== -1;
  }
  const shownLinks = links.filter(function (l) {
    return matches([l.title || '', l.description || '', l.category || '']);
  });
  const shownSystems = systems.filter(function (s) {
    return matches([
      s.system_name || '',
      s.description || '',
      s.category || '',
      s.owner_department || '',
    ]);
  });

  return React.createElement(
    'div',
    { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'h1',
      { className: 'display-title text-2xl text-toledo-blue mb-1' },
      'Systems & Tools'
    ),
    React.createElement(
      'p',
      { className: 'text-toledo-slate text-sm mb-6' },
      'Quick links, tools, and system access for your daily work.'
    ),

    // Tabs + filter
    React.createElement(
      'div',
      { className: 'flex flex-col sm:flex-row sm:items-center gap-3 mb-6' },
      React.createElement(
        'div',
        { className: 'flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-shrink-0' },
        TABS.map(function (t) {
          return React.createElement(
            'button',
            {
              key: t.id,
              onClick: function () {
                setTab(t.id);
              },
              className:
                'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ' +
                (tab === t.id
                  ? 'bg-toledo-blue text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'),
            },
            React.createElement(t.icon),
            t.label
          );
        })
      ),
      React.createElement('input', {
        type: 'text',
        value: filter,
        onChange: function (e) {
          setFilter(e.target.value);
        },
        placeholder: 'Filter by name, category, or department...',
        className:
          'flex-1 px-4 py-2 border border-toledo-border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-toledo-blue bg-white',
      })
    ),

    // Quick Links tab
    tab === 'links' &&
      React.createElement(
        'div',
        null,
        shownLinks.length === 0
          ? React.createElement(
              'p',
              { className: 'text-center text-gray-400 py-8' },
              q ? 'No quick links match your filter.' : 'No quick links available.'
            )
          : React.createElement(
              'div',
              { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger' },
              shownLinks.map(function (link, i) {
                return React.createElement(
                  'a',
                  {
                    key: link.id || i,
                    href: link.url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className:
                      'bg-white rounded-2xl border border-toledo-border p-5 hover:shadow-md hover:border-toledo-gold transition-all group block',
                  },
                  React.createElement(
                    'div',
                    { className: 'flex items-start justify-between mb-2' },
                    React.createElement(
                      'h3',
                      {
                        className:
                          'font-semibold text-gray-900 group-hover:text-toledo-blue transition-colors text-sm',
                      },
                      link.title
                    ),
                    React.createElement(IconExternalLink)
                  ),
                  link.description &&
                    React.createElement(
                      'p',
                      { className: 'text-sm text-toledo-slate line-clamp-2' },
                      link.description
                    ),
                  link.category &&
                    React.createElement(
                      'span',
                      {
                        className:
                          'inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-toledo-blue/8 text-toledo-blue font-medium',
                      },
                      link.category
                    )
                );
              })
            )
      ),

    // Systems tab — clickable cards like Quick Links
    tab === 'systems' &&
      React.createElement(
        'div',
        null,
        shownSystems.length === 0
          ? React.createElement(
              'p',
              { className: 'text-center text-gray-400 py-8' },
              q ? 'No systems match your filter.' : 'No systems available.'
            )
          : React.createElement(
              'div',
              { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger' },
              shownSystems.map(function (sys, i) {
                return React.createElement(
                  'a',
                  {
                    key: sys.id || i,
                    href: sys.access_url || '#',
                    target: sys.access_url ? '_blank' : undefined,
                    rel: sys.access_url ? 'noopener noreferrer' : undefined,
                    className:
                      'bg-white rounded-2xl border border-toledo-border p-5 hover:shadow-md hover:border-toledo-gold transition-all group block',
                  },
                  React.createElement(
                    'div',
                    { className: 'flex items-start justify-between mb-2' },
                    React.createElement(
                      'h3',
                      {
                        className:
                          'font-semibold text-gray-900 group-hover:text-toledo-blue transition-colors text-sm',
                      },
                      sys.system_name
                    ),
                    sys.access_url && React.createElement(IconExternalLink)
                  ),
                  sys.description &&
                    React.createElement(
                      'p',
                      { className: 'text-sm text-toledo-slate mb-2 line-clamp-2' },
                      sys.description
                    ),
                  sys.login_notes &&
                    React.createElement(
                      'p',
                      {
                        className:
                          'text-xs text-warning bg-amber-50 border border-amber-100 rounded-lg px-2 py-1',
                      },
                      'Note: ' + sys.login_notes
                    )
                );
              })
            )
      )
  );
}
