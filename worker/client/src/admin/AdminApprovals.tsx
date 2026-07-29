import React, { useCallback, useEffect, useState } from 'react';
import { formatDateTime } from '../lib/dates';
import { api } from '../lib/api';
import { IconCheck, IconX } from '../components/Icon';
import { adminInputCls } from './shared';

const TABS = [
  { id: 'tasks', label: '🔏 Task sign-offs' },
  { id: 'submissions', label: '📝 Submissions' },
];

export function AdminApprovals({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const [tab, setTab] = useState('tasks');
  const [items, setItems] = useState<any[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(function () {
    setItems(null);
    if (tab === 'tasks') {
      api('/admin/approvals').then(function (r) {
        if (r.success) {
          setItems(r.data || []);
          if (onCountChange) onCountChange(r.data.length);
        }
      });
    } else {
      api('/submissions?status=pending').then(function (r) {
        if (r.success) setItems(r.data || []);
      });
    }
  }, [tab]);

  useEffect(
    function () {
      load();
    },
    [load]
  );

  function setNote(id: number, value: string) {
    setNotes(function (n) {
      const copy = Object.assign({}, n);
      copy[id] = value;
      return copy;
    });
  }

  function decideTask(item: any, approve: boolean) {
    const note = notes[item.id] || '';
    if (!approve && !note.trim()) {
      window.alert('Add a note explaining what to fix before sending it back.');
      return;
    }
    setBusy(item.id);
    api('/admin/approvals/' + item.id + '/' + (approve ? 'approve' : 'reject'), {
      method: 'PUT',
      body: JSON.stringify({ note: note }),
    }).then(function (r) {
      setBusy(null);
      if (!r.success) {
        setError(r.error || 'Could not record that decision.');
        return;
      }
      load();
    });
  }

  function decideContent(item: any, action: string) {
    setBusy(item.id);
    api('/submissions/' + item.id + '/' + action, {
      method: 'PUT',
      body: JSON.stringify({ review_notes: notes[item.id] || '' }),
    }).then(function (r) {
      if (!r.success) {
        setBusy(null);
        setError(r.error || 'Could not record that decision.');
        return;
      }
      setBusy(null);
      load();
    });
  }

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit' },
      TABS.map(function (t) {
        return React.createElement(
          'button',
          {
            key: t.id,
            onClick: function () {
              setTab(t.id);
            },
            className:
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors ' +
              (tab === t.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'),
          },
          t.label
        );
      })
    ),
    error &&
      React.createElement(
        'div',
        { className: 'mb-4 bg-red-50 border border-red-200 rounded-lg p-3', role: 'alert' },
        React.createElement('p', { className: 'text-sm text-red-700' }, error)
      ),
    items === null
      ? React.createElement('p', { className: 'text-toledo-slate py-8 text-center' }, 'Loading…')
      : items.length === 0
        ? React.createElement(
            'p',
            { className: 'text-toledo-slate py-8 text-center' },
            'Nothing waiting for review. 🎉'
          )
        : React.createElement(
            'div',
            { className: 'space-y-4' },
            items.map(function (item) {
              const isTask = tab === 'tasks';
              return React.createElement(
                'div',
                { key: item.id, className: 'bg-white rounded-xl border border-gray-200 p-5' },
                React.createElement(
                  'div',
                  { className: 'flex items-start justify-between mb-3' },
                  React.createElement(
                    'div',
                    null,
                    React.createElement(
                      'h3',
                      { className: 'font-semibold text-gray-900' },
                      isTask
                        ? item.task_title
                        : item.proposed_title ||
                          item.title ||
                          (item.article_title
                            ? 'Edit: ' + item.article_title
                            : 'Item #' + item.id)
                    ),
                    React.createElement(
                      'p',
                      { className: 'text-xs text-gray-500 mt-1' },
                      isTask
                        ? (item.user_name ? item.user_name + ' — ' : '') +
                            item.user_email +
                            ' · marked complete ' +
                            (item.completed_at ? formatDateTime(item.completed_at) : '')
                        : 'By: ' +
                            (item.author_email || 'Unknown') +
                            ' · ' +
                            formatDateTime(item.submitted_at)
                    )
                  ),
                  isTask &&
                    React.createElement(
                      'span',
                      {
                        className:
                          'text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0',
                      },
                      item.task_phase
                    )
                ),
                !isTask &&
                  React.createElement(
                    'div',
                    {
                      className:
                        'bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto mb-3',
                    },
                    item.proposed_content || item.content
                  ),
                React.createElement('textarea', {
                  value: notes[item.id] || '',
                  onChange: function (e: React.ChangeEvent<HTMLTextAreaElement>) {
                    setNote(item.id, e.target.value);
                  },
                  placeholder: isTask
                    ? 'Note to the employee (required when sending back)…'
                    : 'Optional review notes…',
                  rows: 2,
                  className: adminInputCls + ' mb-3',
                }),
                React.createElement(
                  'div',
                  { className: 'flex gap-2' },
                  React.createElement(
                    'button',
                    {
                      onClick: function () {
                        isTask ? decideTask(item, true) : decideContent(item, 'approve');
                      },
                      disabled: busy === item.id,
                      className:
                        'flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50',
                    },
                    React.createElement(IconCheck),
                    isTask ? 'Approve' : 'Approve & Publish'
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: function () {
                        isTask ? decideTask(item, false) : decideContent(item, 'reject');
                      },
                      disabled: busy === item.id,
                      className:
                        'flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50',
                    },
                    React.createElement(IconX),
                    isTask ? 'Send back' : 'Reject'
                  )
                )
              );
            })
          )
  );
}
