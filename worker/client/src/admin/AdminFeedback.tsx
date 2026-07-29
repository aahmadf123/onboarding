import React, { useCallback, useEffect, useState } from 'react';
import { formatDateTime } from '../lib/dates';
import { api } from '../lib/api';

/**
 * "Report an Issue" submissions. These previously went into a table with no
 * read path at all, so nobody ever saw them.
 */
export function AdminFeedback({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [status, setStatus] = useState('open');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(function () {
    setRows(null);
    api('/admin/feedback?status=' + status).then(function (r) {
      if (!r.success) {
        setRows([]);
        setError(r.error || 'Could not load reported issues.');
        return;
      }
      setRows(r.data || []);
      if (onCountChange) onCountChange(r.open_count || 0);
    });
  }, [status]);

  useEffect(
    function () {
      load();
    },
    [load]
  );

  function setItemStatus(id: number, next: string) {
    setBusy(id);
    setError('');
    api('/admin/feedback/' + id, { method: 'PUT', body: JSON.stringify({ status: next }) }).then(
      function (r) {
        setBusy(null);
        if (!r.success) {
          setError(r.error || 'Could not update that report.');
          return;
        }
        load();
      }
    );
  }

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'flex gap-2 mb-4' },
      ['open', 'resolved', 'all'].map(function (s) {
        return React.createElement(
          'button',
          {
            key: s,
            onClick: function () {
              setStatus(s);
              setError('');
            },
            className:
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' +
              (status === s
                ? 'bg-toledo-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'),
          },
          s.charAt(0).toUpperCase() + s.slice(1)
        );
      })
    ),
    error &&
      React.createElement(
        'div',
        { className: 'mb-4 bg-red-50 border border-red-200 rounded-lg p-3', role: 'alert' },
        React.createElement('p', { className: 'text-sm text-red-700' }, error)
      ),
    rows === null
      ? React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Loading…')
      : rows.length === 0
        ? React.createElement(
            'p',
            { className: 'text-gray-400 py-8 text-center' },
            'No ' + (status === 'all' ? '' : status + ' ') + 'reports.'
          )
        : React.createElement(
            'div',
            { className: 'space-y-3' },
            rows.map(function (row) {
              return React.createElement(
                'div',
                { key: row.id, className: 'bg-white rounded-xl border border-gray-200 p-4' },
                React.createElement(
                  'div',
                  { className: 'flex items-start justify-between gap-3 mb-2' },
                  React.createElement(
                    'div',
                    { className: 'min-w-0' },
                    React.createElement(
                      'p',
                      { className: 'text-xs text-gray-500' },
                      formatDateTime(row.created_at) +
                        (row.reporter_email ? ' · ' + row.reporter_email : ' · (deleted user)') +
                        (row.page ? ' · on ' + row.page : '')
                    )
                  ),
                  React.createElement(
                    'span',
                    {
                      className:
                        'flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ' +
                        (row.status === 'open'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'),
                    },
                    row.status
                  )
                ),
                React.createElement(
                  'p',
                  { className: 'text-sm text-gray-800 whitespace-pre-wrap mb-3' },
                  row.message
                ),
                React.createElement(
                  'button',
                  {
                    onClick: function () {
                      setItemStatus(row.id, row.status === 'open' ? 'resolved' : 'open');
                    },
                    disabled: busy === row.id,
                    className:
                      'text-xs font-semibold text-toledo-blue hover:text-toledo-dark border border-toledo-blue/30 hover:border-toledo-blue px-3 py-1.5 rounded-lg disabled:opacity-50',
                  },
                  busy === row.id
                    ? 'Saving…'
                    : row.status === 'open'
                      ? 'Mark resolved'
                      : 'Reopen'
                )
              );
            })
          )
  );
}
