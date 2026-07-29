import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { IconCheck } from '../components/Icon';
import type { NavigateFn, User } from '../lib/types';

const REQUEST_TYPES = [
  {
    id: 'content_update',
    label: 'Edit existing content',
    desc: 'Route a correction or rewrite request',
  },
  { id: 'new_article', label: 'New knowledge article', desc: 'Add missing onboarding information' },
  {
    id: 'access_request',
    label: 'Access or setup issue',
    desc: 'Account, door, or system access gaps',
  },
  {
    id: 'policy_question',
    label: 'Policy clarification',
    desc: 'Rules, compliance, or process interpretation',
  },
  {
    id: 'process_gap',
    label: 'Workflow gap',
    desc: 'Something in onboarding is missing or confusing',
  },
  { id: 'bug_report', label: 'Portal bug', desc: 'Broken page, wrong link, or bad data' },
];

const FIELD_CLS =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-toledo-blue text-sm';
const SELECT_CLS = FIELD_CLS + ' bg-white';
const TEXTAREA_CLS = FIELD_CLS + ' resize-y';

interface SubmitFormProps {
  currentUser: User | null;
  categories: any[];
  onNavigate: NavigateFn;
}

export function SubmitForm({ currentUser, categories, onNavigate }: SubmitFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [articleId, setArticleId] = useState('');
  const [requestType, setRequestType] = useState('content_update');
  const [priority, setPriority] = useState('normal');
  const [topicArea, setTopicArea] = useState('');
  const [sourceContext, setSourceContext] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);
  const [assignmentPreview, setAssignmentPreview] = useState<any>(null);

  useEffect(() => {
    api('/articles').then((r) => r.success && setArticles(r.data));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (!title.trim() && !content.trim() && !articleId && !topicArea && !sourceContext.trim()) {
      setAssignmentPreview(null);
      return;
    }

    const timer = setTimeout(() => {
      api('/submissions/assignment-preview', {
        method: 'POST',
        body: JSON.stringify({
          article_id: articleId ? parseInt(articleId, 10) : undefined,
          proposed_title: title,
          proposed_content: content,
          request_type: requestType,
          topic_area: topicArea || undefined,
          source_context: sourceContext || undefined,
        }),
      }).then((r) => {
        if (r.success) setAssignmentPreview(r.data);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [articleId, content, currentUser, requestType, sourceContext, title, topicArea]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    const payload = {
      proposed_content: content,
      proposed_title: requestType === 'content_update' ? undefined : title,
      article_id:
        requestType === 'content_update' && articleId ? parseInt(articleId, 10) : undefined,
      request_type: requestType,
      priority,
      topic_area: topicArea || undefined,
      source_context: sourceContext || undefined,
    };
    const res = await api('/submissions', { method: 'POST', body: JSON.stringify(payload) });
    setSubmitting(false);
    if (res.success) {
      setSubmittedTicket(res.data || { id: res.id, assignment: assignmentPreview });
      setTitle('');
      setContent('');
      setArticleId('');
      setSourceContext('');
      setPriority('normal');
      setTopicArea('');
      setAssignmentPreview(null);
    }
  }

  const isEditFlow = requestType === 'content_update';

  if (!currentUser)
    return React.createElement(
      'div',
      { className: 'max-w-2xl mx-auto px-4 py-12 text-center' },
      React.createElement('p', { className: 'text-gray-500' }, 'Please log in to contribute.')
    );

  if (submittedTicket)
    return React.createElement(
      'div',
      { className: 'max-w-3xl mx-auto px-4 py-12 fade-in' },
      React.createElement(
        'div',
        { className: 'bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xs' },
        React.createElement(
          'div',
          {
            className:
              'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4',
          },
          React.createElement(IconCheck)
        ),
        React.createElement(
          'p',
          { className: 'text-xs uppercase tracking-[0.2em] text-green-600 font-semibold mb-2' },
          'Ticket queued'
        ),
        React.createElement(
          'h2',
          { className: 'text-2xl font-bold text-gray-900 mb-2' },
          'Contribution Ticket #' + submittedTicket.id
        ),
        React.createElement(
          'p',
          { className: 'text-gray-500 mb-6' },
          'Your request is now in the moderation queue with a suggested owner from the current portal knowledge.'
        ),
        submittedTicket.assignment &&
          React.createElement(
            'div',
            {
              className:
                'bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-xl mx-auto mb-6',
            },
            React.createElement(
              'p',
              { className: 'text-xs uppercase tracking-wide text-slate-500 mb-2' },
              'Suggested routing'
            ),
            React.createElement(
              'p',
              { className: 'text-sm font-semibold text-slate-900' },
              submittedTicket.assignment.assigned_team || 'General Review Queue'
            ),
            submittedTicket.assignment.assigned_to_name &&
              React.createElement(
                'p',
                { className: 'text-sm text-slate-600 mt-1' },
                submittedTicket.assignment.assigned_to_name +
                  (submittedTicket.assignment.assigned_to_email
                    ? ' • ' + submittedTicket.assignment.assigned_to_email
                    : '')
              ),
            submittedTicket.assignment.assignment_reason &&
              React.createElement(
                'p',
                { className: 'text-xs text-slate-500 mt-2' },
                submittedTicket.assignment.assignment_reason
              )
          ),
        React.createElement(
          'div',
          { className: 'flex items-center justify-center gap-3' },
          React.createElement(
            'button',
            {
              onClick: () => setSubmittedTicket(null),
              className:
                'px-6 py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium',
            },
            'Open Another Ticket'
          ),
          React.createElement(
            'button',
            {
              onClick: () => onNavigate('home'),
              className:
                'px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-toledo-blue hover:text-toledo-blue transition-colors text-sm font-medium',
            },
            'Back to Home'
          )
        )
      )
    );

  return React.createElement(
    'div',
    { className: 'max-w-6xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'div',
      { className: 'flex items-end justify-between gap-4 mb-8' },
      React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          { className: 'text-xs uppercase tracking-[0.2em] text-toledo-blue font-semibold mb-2' },
          'Contribution Desk'
        ),
        React.createElement(
          'h1',
          { className: 'display-title text-2xl md:text-3xl text-toledo-blue mb-2' },
          'Give Feedback'
        ),
        React.createElement(
          'p',
          { className: 'text-gray-500 max-w-2xl' },
          'Turn corrections, missing content, access issues, and policy questions into structured tickets. The form suggests an owner using the existing portal knowledge base and contact directory.'
        )
      ),
      React.createElement(
        'div',
        {
          className:
            'hidden lg:block bg-toledo-navy navy-texture text-white rounded-2xl px-5 py-4 min-w-[240px]',
        },
        React.createElement(
          'p',
          { className: 'text-xs uppercase tracking-wide text-blue-200 mb-1' },
          'Routing mode'
        ),
        React.createElement('p', { className: 'text-lg font-semibold' }, 'Portal-aware assignment'),
        React.createElement(
          'p',
          { className: 'text-xs text-blue-200 mt-1' },
          'Uses current articles, categories, and contacts to suggest the right queue.'
        )
      )
    ),
    React.createElement(
      'form',
      {
        onSubmit: handleSubmit,
        className: 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6',
      },
      React.createElement(
        'div',
        { className: 'bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-xs' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            { className: 'block text-sm font-medium text-gray-700 mb-3' },
            'Ticket type'
          ),
          React.createElement(
            'div',
            { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
            REQUEST_TYPES.map(function (type) {
              const active = requestType === type.id;
              return React.createElement(
                'button',
                {
                  key: type.id,
                  type: 'button',
                  onClick: () => setRequestType(type.id),
                  className:
                    'text-left rounded-xl border p-4 transition-colors border-l-4 ' +
                    (active
                      ? 'border-toledo-blue border-l-toledo-gold bg-toledo-blue/5'
                      : 'border-gray-200 border-l-gray-200 hover:border-toledo-blue/40 hover:bg-gray-50'),
                },
                React.createElement(
                  'p',
                  { className: 'text-sm font-semibold text-gray-900' },
                  type.label
                ),
                React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, type.desc)
              );
            })
          )
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { className: 'block text-sm font-medium text-gray-700 mb-1' },
              'Priority'
            ),
            React.createElement(
              'select',
              {
                value: priority,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value),
                className: SELECT_CLS,
              },
              ['low', 'normal', 'high', 'urgent'].map((level) =>
                React.createElement(
                  'option',
                  { key: level, value: level },
                  level.charAt(0).toUpperCase() + level.slice(1)
                )
              )
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { className: 'block text-sm font-medium text-gray-700 mb-1' },
              'Topic area'
            ),
            React.createElement(
              'select',
              {
                value: topicArea,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setTopicArea(e.target.value),
                className: SELECT_CLS,
              },
              React.createElement(
                'option',
                { value: '' },
                'Use the ticket details to infer this'
              ),
              categories.map((cat) =>
                React.createElement('option', { key: cat.id, value: cat.name }, cat.name)
              )
            )
          )
        ),
        isEditFlow &&
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { className: 'block text-sm font-medium text-gray-700 mb-1' },
              'Related article on the site'
            ),
            React.createElement(
              'select',
              {
                value: articleId,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setArticleId(e.target.value),
                required: isEditFlow,
                className: SELECT_CLS,
              },
              React.createElement('option', { value: '' }, '-- Select an article to update --'),
              articles.map((a) =>
                React.createElement('option', { key: a.id, value: a.id }, a.title)
              )
            )
          ),
        !isEditFlow &&
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { className: 'block text-sm font-medium text-gray-700 mb-1' },
              'Ticket summary'
            ),
            React.createElement('input', {
              type: 'text',
              value: title,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value),
              required: !isEditFlow,
              placeholder: 'Summarize what should be added or fixed',
              className: FIELD_CLS,
            })
          ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            { className: 'block text-sm font-medium text-gray-700 mb-1' },
            'What on the site pointed you here?'
          ),
          React.createElement('textarea', {
            value: sourceContext,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setSourceContext(e.target.value),
            rows: 3,
            placeholder:
              'Example: The parking article is missing visitor permit details, or the MyUT setup page links to the wrong step.',
            className: TEXTAREA_CLS,
          })
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            { className: 'block text-sm font-medium text-gray-700 mb-1' },
            isEditFlow ? 'Requested changes' : 'Ticket details'
          ),
          React.createElement('textarea', {
            value: content,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value),
            required: true,
            rows: 12,
            placeholder: isEditFlow
              ? 'Describe the correction, missing step, or rewrite needed...'
              : 'Describe the missing knowledge, bug, access issue, or question in enough detail for review...',
            className: TEXTAREA_CLS,
          })
        ),
        React.createElement(
          'div',
          { className: 'flex items-center justify-between gap-4 pt-2' },
          React.createElement(
            'p',
            { className: 'text-xs text-gray-500 max-w-md' },
            'Tickets stay in moderation until approved. New article and content update tickets can still be published directly from the moderation queue.'
          ),
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: submitting,
              className:
                'px-6 py-3 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap',
            },
            submitting ? 'Routing ticket...' : 'Submit Ticket'
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          'div',
          { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-xs' },
          React.createElement(
            'p',
            { className: 'text-xs uppercase tracking-wide text-gray-500 mb-2' },
            'Suggested owner'
          ),
          assignmentPreview
            ? React.createElement(
                'div',
                null,
                React.createElement(
                  'p',
                  { className: 'text-lg font-semibold text-gray-900' },
                  assignmentPreview.assigned_team || 'General Review Queue'
                ),
                assignmentPreview.assigned_to_name &&
                  React.createElement(
                    'p',
                    { className: 'text-sm text-gray-600 mt-1' },
                    assignmentPreview.assigned_to_name +
                      (assignmentPreview.assigned_to_email
                        ? ' • ' + assignmentPreview.assigned_to_email
                        : '')
                  ),
                React.createElement(
                  'p',
                  { className: 'text-xs text-gray-500 mt-3 leading-relaxed' },
                  assignmentPreview.assignment_reason
                )
              )
            : React.createElement(
                'p',
                { className: 'text-sm text-gray-500' },
                'Start filling in the ticket and the portal will suggest the best queue and contact.'
              )
        ),
        React.createElement(
          'div',
          { className: 'bg-toledo-navy navy-texture text-white rounded-2xl p-5 shadow-xs' },
          React.createElement(
            'p',
            { className: 'text-xs uppercase tracking-wide text-blue-200 mb-2' },
            'How this works'
          ),
          React.createElement(
            'ol',
            { className: 'space-y-3 text-sm text-blue-50 list-decimal pl-4' },
            React.createElement('li', null, 'Pick the ticket type and describe the gap.'),
            React.createElement(
              'li',
              null,
              'The system checks existing categories, articles, and contacts.'
            ),
            React.createElement(
              'li',
              null,
              'Moderators can approve, reject, or re-route from the queue.'
            )
          )
        )
      )
    )
  );
}
