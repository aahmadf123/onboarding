import React, { useEffect, useState } from 'react';
import { formatDate } from '../lib/dates';
import { api } from '../lib/api';

/**
 * Who has outstanding required tasks. Email to utoledo.edu addresses is
 * filtered, so the weekly per-user reminder cannot be relied on; this gives HR
 * a list they can work from directly.
 */
export function AdminBehind() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState('');

  useEffect(function () {
    api('/admin/behind').then(function (r) {
      if (!r.success) {
        setRows([]);
        setError(r.error || 'Could not load the list.');
        return;
      }
      setRows(r.data || []);
    });
  }, []);

  return React.createElement(
    'div',
    null,
    React.createElement(
      'p',
      { className: 'text-sm text-toledo-slate mb-4' },
      'Active users with incomplete required or assigned tasks. Weekly reminder emails are often filtered by university mail, so use this list to follow up directly.'
    ),
    error &&
      React.createElement(
        'div',
        { className: 'mb-4 bg-red-50 border border-red-200 rounded-lg p-3', role: 'alert' },
        React.createElement('p', { className: 'text-sm text-red-700' }, error)
      ),
    rows === null
      ? React.createElement('p', { className: 'text-toledo-slate py-8 text-center' }, 'Loading…')
      : rows.length === 0
        ? React.createElement(
            'p',
            { className: 'text-toledo-slate py-8 text-center' },
            'Everyone is up to date.'
          )
        : React.createElement(
            'div',
            { className: 'bg-white rounded-xl border border-gray-200 overflow-x-auto' },
            React.createElement(
              'table',
              { className: 'w-full min-w-[560px]' },
              React.createElement(
                'thead',
                null,
                React.createElement(
                  'tr',
                  { className: 'bg-gray-50 border-b border-gray-200' },
                  ['Person', 'Outstanding', 'Last sign-in'].map(function (h) {
                    return React.createElement(
                      'th',
                      {
                        key: h,
                        className:
                          'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase',
                      },
                      h
                    );
                  })
                )
              ),
              React.createElement(
                'tbody',
                null,
                rows.map(function (row) {
                  return React.createElement(
                    'tr',
                    { key: row.id, className: 'border-b border-gray-100 last:border-0' },
                    React.createElement(
                      'td',
                      { className: 'px-4 py-2.5' },
                      React.createElement(
                        'p',
                        { className: 'text-sm text-gray-900' },
                        row.name || row.email
                      ),
                      row.name &&
                        React.createElement('p', { className: 'text-xs text-gray-500' }, row.email)
                    ),
                    React.createElement(
                      'td',
                      { className: 'px-4 py-2.5' },
                      React.createElement(
                        'span',
                        {
                          className:
                            'px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700',
                        },
                        row.open_tasks + (row.open_tasks === 1 ? ' task' : ' tasks')
                      )
                    ),
                    React.createElement(
                      'td',
                      { className: 'px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap' },
                      row.last_login_at
                        ? formatDate(row.last_login_at)
                        : 'Never signed in'
                    )
                  );
                })
              )
            )
          )
  );
}
