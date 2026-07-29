import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { NavigateFn } from '../lib/types';

/** onNavigate is part of the page contract but this view has no internal links. */
export function ContactsPage(_props: { onNavigate: NavigateFn }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');

  useEffect(function () {
    api('/contacts').then(function (r) {
      if (r.success) setContacts(r.data || []);
      setLoading(false);
    });
  }, []);

  if (loading)
    return React.createElement(
      'div',
      { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' },
      'Loading...'
    );

  const areas: string[] = [];
  contacts.forEach(function (c) {
    const a = c.function_area || c.department;
    if (a && areas.indexOf(a) === -1) areas.push(a);
  });

  const q = search.trim().toLowerCase();
  const shown = contacts.filter(function (c) {
    const cArea = c.function_area || c.department;
    if (area !== 'all' && cArea !== area) return false;
    if (!q) return true;
    return (
      [
        c.contact_name || '',
        c.title || '',
        c.department || '',
        c.function_area || '',
        c.email || '',
      ]
        .join(' ')
        .toLowerCase()
        .indexOf(q) !== -1
    );
  });

  return React.createElement(
    'div',
    { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'h1',
      { className: 'display-title text-2xl text-toledo-blue mb-1' },
      'People & Contacts'
    ),
    React.createElement(
      'p',
      { className: 'text-toledo-slate text-sm mb-6' },
      'Find the right person by name, department, or role.'
    ),

    React.createElement('input', {
      type: 'text',
      value: search,
      onChange: function (e) {
        setSearch(e.target.value);
      },
      placeholder: 'Search by name, role, or department...',
      className:
        'w-full px-4 py-2.5 border border-toledo-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-toledo-blue bg-white mb-3',
    }),

    areas.length > 1 &&
      React.createElement(
        'div',
        { className: 'flex flex-wrap gap-2 mb-6' },
        ['all'].concat(areas).map(function (a) {
          const active = area === a;
          return React.createElement(
            'button',
            {
              key: a,
              onClick: function () {
                setArea(a);
              },
              className:
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ' +
                (active
                  ? 'bg-toledo-blue text-white border-toledo-blue'
                  : 'bg-white text-gray-600 border-toledo-border hover:border-toledo-blue/40 hover:text-toledo-blue'),
            },
            a === 'all' ? 'All' : a
          );
        })
      ),

    shown.length === 0
      ? React.createElement(
          'p',
          { className: 'text-center text-gray-400 py-8' },
          q || area !== 'all' ? 'No contacts match your search.' : 'No contacts available.'
        )
      : React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 stagger' },
          shown.map(function (contact, i) {
            const cArea = contact.function_area || contact.department;
            return React.createElement(
              'div',
              {
                key: contact.id || i,
                className:
                  'bg-white rounded-2xl border border-toledo-border p-5 hover:shadow-md transition-shadow',
              },
              React.createElement(
                'div',
                { className: 'flex items-start gap-3' },
                React.createElement(
                  'div',
                  {
                    className:
                      'w-10 h-10 bg-toledo-blue text-toledo-gold rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                  },
                  contact.contact_name ? contact.contact_name.charAt(0).toUpperCase() : '?'
                ),
                React.createElement(
                  'div',
                  { className: 'min-w-0 flex-1' },
                  React.createElement(
                    'h3',
                    { className: 'font-semibold text-gray-900 text-sm' },
                    contact.contact_name
                  ),
                  contact.title &&
                    React.createElement(
                      'p',
                      { className: 'text-xs text-toledo-slate' },
                      contact.title
                    ),
                  contact.department &&
                    React.createElement(
                      'p',
                      { className: 'text-xs text-gray-400' },
                      contact.department
                    )
                ),
                cArea &&
                  React.createElement(
                    'span',
                    {
                      className:
                        'flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-toledo-gold/20 text-toledo-blue',
                    },
                    cArea
                  )
              ),
              React.createElement(
                'div',
                { className: 'mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2' },
                contact.email &&
                  React.createElement(
                    'a',
                    {
                      href: 'mailto:' + contact.email,
                      className:
                        'text-xs font-medium px-3 py-1.5 rounded-lg bg-toledo-blue text-white hover:bg-toledo-navy transition-colors',
                    },
                    'Email'
                  ),
                contact.phone &&
                  React.createElement(
                    'a',
                    {
                      href: 'tel:' + contact.phone,
                      className:
                        'text-xs font-medium px-3 py-1.5 rounded-lg border border-toledo-border text-toledo-blue hover:border-toledo-blue transition-colors',
                    },
                    contact.phone
                  )
              )
            );
          })
        )
  );
}
