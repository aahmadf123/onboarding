import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { EVENTS, on } from '../lib/events';
import { IconCheck, IconX } from '../components/Icon';
import type { User } from '../lib/types';

interface FeedbackButtonProps {
  currentView: string;
  /** Part of the widget contract; the report is attributed server-side. */
  currentUser?: User | null;
}

export function FeedbackButton({ currentView }: FeedbackButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Posts to /api/feedback. This used to post to /api/tips/0/feedback, which
  // violated TipFeedback's foreign key, so every report failed silently while
  // the user was told it had been sent.
  function handleSubmit() {
    if (!feedback.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    api('/feedback', {
      method: 'POST',
      body: JSON.stringify({ message: feedback, page: currentView || null }),
    }).then(function (res) {
      setSubmitting(false);
      if (!res.success) {
        setError(res.error || 'Could not send that. Please try again.');
        return;
      }
      setSent(true);
      setTimeout(function () {
        setShowModal(false);
        setSent(false);
        setFeedback('');
      }, 2000);
    });
  }

  // Opened from the sidebar "Report an Issue" entry instead of a floating button.
  useEffect(function () {
    return on(EVENTS.OPEN_FEEDBACK, function () {
      setShowModal(true);
      setSent(false);
    });
  }, []);

  return React.createElement(
    'div',
    null,
    showModal &&
      React.createElement(
        'div',
        {
          className:
            'fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4',
        },
        React.createElement(
          'div',
          { className: 'bg-white rounded-2xl shadow-xl p-6 w-full max-w-md' },
          sent
            ? React.createElement(
                'div',
                { className: 'text-center py-4' },
                React.createElement(IconCheck),
                React.createElement(
                  'p',
                  { className: 'text-sm font-medium text-gray-900 mt-2' },
                  'Feedback sent! Thank you.'
                )
              )
            : React.createElement(
                'div',
                null,
                React.createElement(
                  'div',
                  { className: 'flex items-center justify-between mb-4' },
                  React.createElement(
                    'h3',
                    { className: 'font-semibold text-gray-900' },
                    'Report an Issue'
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: function () {
                        setShowModal(false);
                      },
                      className: 'text-gray-400 hover:text-gray-600',
                    },
                    React.createElement(IconX)
                  )
                ),
                React.createElement('textarea', {
                  value: feedback,
                  onChange: function (e: React.ChangeEvent<HTMLTextAreaElement>) {
                    setFeedback(e.target.value);
                  },
                  placeholder: 'Describe the issue you encountered...',
                  rows: 4,
                  className:
                    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-toledo-blue mb-3',
                }),
                error &&
                  React.createElement(
                    'p',
                    { className: 'text-red-600 text-sm mb-3', role: 'alert' },
                    error
                  ),
                React.createElement(
                  'button',
                  {
                    onClick: handleSubmit,
                    disabled: submitting || !feedback.trim(),
                    className:
                      'w-full py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark text-sm font-medium disabled:opacity-50',
                  },
                  submitting ? 'Sending…' : 'Submit Feedback'
                )
              )
        )
      )
  );
}
