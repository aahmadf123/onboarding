import React, { useCallback, useEffect, useState } from 'react';
import { formatDateTime } from '../lib/dates';
import { api } from '../lib/api';
import { IconCheck, IconX } from '../components/Icon';
import type { NavigateFn, User } from '../lib/types';

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-toledo-blue';

interface ModerationDashboardProps {
  /** Part of the page contract; the queue is gated server-side by role. */
  currentUser?: User | null;
  onNavigate?: NavigateFn;
}

export function ModerationDashboard(_props: ModerationDashboardProps) {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  // busyId tracks the in-flight request; reviewNotes is keyed per item. These
  // used to be one variable, so typing a note disabled every card's buttons.
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [assignmentContactId, setAssignmentContactId] = useState<Record<string, string>>({});
  const [assignmentReason, setAssignmentReason] = useState<Record<string, string>>({});

  const loadData = useCallback(() => {
    api('/submissions?status=' + filter).then((r) => r.success && setItems(r.data));
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    api('/contacts').then((r) => r.success && setContacts(r.data || []));
  }, []);

  async function handleAction(id: number, action: string) {
    setBusyId(id);
    setError('');
    const res = await api('/submissions/' + id + '/' + action, {
      method: 'PUT',
      body: JSON.stringify({ review_notes: reviewNotes[id] || '' }),
    });
    setBusyId(null);
    if (!res.success) {
      setError(res.error || 'Could not save that decision. Please try again.');
      return;
    }
    setReviewNotes(function (prev) {
      const next = Object.assign({}, prev);
      delete next[id];
      return next;
    });
    loadData();
  }

  async function handleReassign(itemId: number) {
    const contactId = assignmentContactId[itemId];
    if (!contactId) return;
    setBusyId('assign-' + itemId);
    setError('');
    const res = await api('/submissions/' + itemId + '/assignment', {
      method: 'PUT',
      body: JSON.stringify({
        contact_id: Number(contactId),
        assignment_reason: assignmentReason[itemId] || undefined,
      }),
    });
    setBusyId(null);
    if (!res.success) {
      setError(res.error || 'Could not reassign that ticket. Please try again.');
      return;
    }
    loadData();
  }

  return React.createElement(
    'div',
    { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'h1',
      { className: 'display-title text-2xl text-toledo-blue mb-1' },
      'Moderation Queue'
    ),
    React.createElement(
      'p',
      { className: 'text-toledo-slate text-sm mb-5' },
      'Review and manage community submissions'
    ),
    // A Submissions / Tips tab strip stood here. Tips is gone, and a tab strip
    // with one tab in it is just a decorated heading.
    error &&
      React.createElement(
        'div',
        { className: 'mb-4 bg-red-50 border border-red-200 rounded-lg p-3', role: 'alert' },
        React.createElement('p', { className: 'text-sm text-red-700' }, error)
      ),
    React.createElement(
      'div',
      { className: 'flex gap-2 mb-6' },
      ['pending', 'approved', 'rejected'].map((s) =>
        React.createElement(
          'button',
          {
            key: s,
            onClick: () => {
              setFilter(s);
              setError('');
            },
            className:
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
              (filter === s
                ? s === 'pending'
                  ? 'bg-orange-100 text-orange-700'
                  : s === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'),
          },
          s.charAt(0).toUpperCase() + s.slice(1)
        )
      )
    ),
    items.length === 0
      ? React.createElement(
          'div',
          { className: 'text-center py-12 text-toledo-slate' },
          'No ' + filter + ' submissions.'
        )
      : React.createElement(
          'div',
          { className: 'space-y-4' },
          items.map((item) =>
            React.createElement(
              'div',
              { key: item.id, className: 'bg-white rounded-xl border border-gray-200 p-5' },
              React.createElement(
                'div',
                { className: 'flex items-start justify-between mb-3' },
                React.createElement(
                  'div',
                  { className: 'flex-1 min-w-0' },
                  React.createElement(
                    'h3',
                    { className: 'font-semibold text-gray-900' },
                    item.proposed_title ||
                      item.title ||
                      (item.article_title ? 'Edit: ' + item.article_title : 'Item #' + item.id)
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex flex-wrap gap-3 mt-1 text-xs text-gray-500' },
                    React.createElement('span', null, 'By: ' + (item.author_email || 'Unknown')),
                    React.createElement('span', null, formatDateTime(item.submitted_at))
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex flex-wrap gap-2 mt-3' },
                    item.request_type &&
                      React.createElement(
                        'span',
                        {
                          className:
                            'px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium',
                        },
                        item.request_type.replace(/_/g, ' ')
                      ),
                    item.priority &&
                      React.createElement(
                        'span',
                        {
                          className:
                            'px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium',
                        },
                        item.priority
                      ),
                    item.topic_area &&
                      React.createElement(
                        'span',
                        {
                          className:
                            'px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium',
                        },
                        item.topic_area
                      )
                  ),
                  item.assigned_team &&
                    React.createElement(
                      'div',
                      {
                        className:
                          'mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700',
                      },
                      React.createElement(
                        'p',
                        { className: 'font-medium text-slate-900' },
                        'Assigned queue: ' + item.assigned_team
                      ),
                      item.assigned_to_name &&
                        React.createElement(
                          'p',
                          { className: 'text-xs text-slate-600 mt-1' },
                          item.assigned_to_name +
                            (item.assigned_to_email ? ' • ' + item.assigned_to_email : '')
                        ),
                      item.assignment_reason &&
                        React.createElement(
                          'p',
                          { className: 'text-xs text-slate-500 mt-2' },
                          item.assignment_reason
                        )
                    ),
                  filter === 'pending' &&
                    React.createElement(
                      'div',
                      { className: 'mt-3 bg-white border border-gray-200 rounded-lg p-3' },
                      React.createElement(
                        'p',
                        { className: 'text-xs uppercase tracking-wide text-gray-500 mb-2' },
                        'Manual reassignment'
                      ),
                      React.createElement(
                        'div',
                        {
                          className:
                            'grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-2',
                        },
                        React.createElement(
                          'div',
                          { className: 'space-y-2' },
                          React.createElement(
                            'select',
                            {
                              value: assignmentContactId[item.id] || '',
                              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                                setAssignmentContactId((prev) =>
                                  Object.assign({}, prev, { [item.id]: e.target.value })
                                ),
                              className: INPUT_CLS + ' bg-white',
                            },
                            React.createElement(
                              'option',
                              { value: '' },
                              'Choose a contact to assign'
                            ),
                            contacts.map((contact) =>
                              React.createElement(
                                'option',
                                { key: contact.id, value: contact.id },
                                (contact.function_area || contact.department || 'General') +
                                  ' — ' +
                                  (contact.contact_name || contact.email || 'Unassigned contact')
                              )
                            )
                          ),
                          React.createElement('input', {
                            type: 'text',
                            value: assignmentReason[item.id] || '',
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                              setAssignmentReason((prev) =>
                                Object.assign({}, prev, { [item.id]: e.target.value })
                              ),
                            placeholder: 'Optional note about why this ticket is being rerouted',
                            className: INPUT_CLS,
                          })
                        ),
                        React.createElement(
                          'button',
                          {
                            type: 'button',
                            onClick: () => handleReassign(item.id),
                            disabled:
                              busyId === 'assign-' + item.id || !assignmentContactId[item.id],
                            className:
                              'px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50',
                          },
                          busyId === 'assign-' + item.id ? 'Updating...' : 'Reassign'
                        )
                      )
                    )
                ),
                React.createElement(
                  'span',
                  {
                    className:
                      'ml-3 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ' +
                      (item.status === 'pending'
                        ? 'bg-orange-100 text-orange-700'
                        : item.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'),
                  },
                  item.status
                )
              ),
              React.createElement(
                'div',
                {
                  className:
                    'bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto mb-3',
                },
                item.proposed_content || item.content
              ),
              item.review_notes &&
                React.createElement(
                  'div',
                  { className: 'bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mb-3' },
                  React.createElement('strong', null, 'Review notes: '),
                  item.review_notes
                ),
              filter === 'pending' &&
                React.createElement(
                  'div',
                  { className: 'space-y-3' },
                  React.createElement('textarea', {
                    value: reviewNotes[item.id] || '',
                    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      const value = e.target.value;
                      setReviewNotes(function (prev) {
                        const next = Object.assign({}, prev);
                        next[item.id] = value;
                        return next;
                      });
                    },
                    placeholder: 'Optional review notes...',
                    rows: 2,
                    className: INPUT_CLS,
                  }),
                  React.createElement(
                    'div',
                    { className: 'flex gap-2' },
                    React.createElement(
                      'button',
                      {
                        onClick: () => handleAction(item.id, 'approve'),
                        disabled: busyId === item.id,
                        className:
                          'flex items-center gap-1 px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50',
                      },
                      React.createElement(IconCheck),
                      busyId === item.id ? 'Saving…' : 'Approve & Publish'
                    ),
                    React.createElement(
                      'button',
                      {
                        onClick: () => handleAction(item.id, 'reject'),
                        disabled: busyId === item.id,
                        className:
                          'flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50',
                      },
                      React.createElement(IconX),
                      'Reject'
                    )
                  )
                )
            )
          )
        )
  );
}
