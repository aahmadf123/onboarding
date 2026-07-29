import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../lib/dates';
import { api } from '../lib/api';

const TYPE_OPTIONS = [
  '',
  'invite',
  'password_reset',
  'task_assigned',
  'weekly_reminder',
  'admin_digest',
  'approval_decision',
  'test',
];

const SELECT_CLS = 'text-sm border border-gray-200 rounded-lg px-2 py-1.5';

export function AdminEmailLog() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(
    function () {
      const qs: string[] = [];
      if (type) qs.push('type=' + type);
      if (status) qs.push('status=' + status);
      api('/admin/email-log' + (qs.length ? '?' + qs.join('&') : '')).then(function (r) {
        if (r.success) setRows(r.data || []);
      });
    },
    [type, status]
  );

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3' },
      React.createElement(
        'p',
        { className: 'text-xs text-amber-800' },
        React.createElement('strong', null, '"Accepted" is not "delivered". '),
        "It means the recipient's mail server took the message. University mail systems accept first and filter afterwards, so mail to utoledo.edu addresses can show as accepted here and never reach the inbox. Hand invite passcodes over directly, and use Who Is Behind rather than relying on reminder emails."
      )
    ),
    React.createElement(
      'div',
      { className: 'flex gap-2 mb-4' },
      React.createElement(
        'select',
        {
          value: type,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value),
          className: SELECT_CLS,
        },
        TYPE_OPTIONS.map(function (t) {
          return React.createElement('option', { key: t, value: t }, t || 'All types');
        })
      ),
      React.createElement(
        'select',
        {
          value: status,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value),
          className: SELECT_CLS,
        },
        ['', 'sent', 'error'].map(function (s) {
          return React.createElement('option', { key: s, value: s }, s || 'All statuses');
        })
      )
    ),
    rows === null
      ? React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Loading…')
      : rows.length === 0
        ? React.createElement(
            'p',
            { className: 'text-gray-400 py-8 text-center' },
            'No emails logged yet.'
          )
        : React.createElement(
            'div',
            { className: 'bg-white rounded-xl border border-gray-200 overflow-x-auto' },
            React.createElement(
              'table',
              { className: 'w-full min-w-[640px]' },
              React.createElement(
                'thead',
                null,
                React.createElement(
                  'tr',
                  { className: 'bg-gray-50 border-b border-gray-200' },
                  ['When', 'To', 'Type', 'Status', 'Subject'].map(function (h) {
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
                    React.Fragment,
                    { key: row.id },
                    React.createElement(
                      'tr',
                      {
                        className:
                          'border-b border-gray-100 last:border-0' +
                          (row.status === 'error' ? ' bg-red-50/50 cursor-pointer' : ''),
                        onClick: function () {
                          if (row.status === 'error')
                            setExpanded(expanded === row.id ? null : row.id);
                        },
                      },
                      React.createElement(
                        'td',
                        { className: 'px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap' },
                        formatDateTime(row.created_at)
                      ),
                      React.createElement(
                        'td',
                        { className: 'px-4 py-2.5 text-xs text-gray-800' },
                        row.to_email
                      ),
                      React.createElement(
                        'td',
                        { className: 'px-4 py-2.5 text-xs text-gray-500' },
                        row.email_type
                      ),
                      React.createElement(
                        'td',
                        { className: 'px-4 py-2.5' },
                        React.createElement(
                          'span',
                          {
                            className:
                              'px-2 py-0.5 rounded-full text-xs font-medium ' +
                              (row.status === 'sent'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'),
                          },
                          row.status === 'sent' ? 'accepted' : row.status
                        )
                      ),
                      React.createElement(
                        'td',
                        { className: 'px-4 py-2.5 text-xs text-gray-500 truncate max-w-[220px]' },
                        row.subject || ''
                      )
                    ),
                    expanded === row.id &&
                      row.error_text &&
                      React.createElement(
                        'tr',
                        { className: 'bg-red-50' },
                        React.createElement(
                          'td',
                          {
                            colSpan: 5,
                            className: 'px-4 py-2 text-xs text-red-700 whitespace-pre-wrap',
                          },
                          row.error_text
                        )
                      )
                  );
                })
              )
            )
          )
  );
}
