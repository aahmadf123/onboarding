import React from 'react';

/**
 * The loading / error / empty states every list and detail page needs.
 *
 * These were inconsistent or absent: some pages rendered "Loading..." forever
 * on failure, others showed an empty-state message before their fetch had even
 * resolved, so "No contacts available yet" appeared on every page load.
 */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return React.createElement(
    'p',
    { className: 'text-center text-toledo-slate py-12 text-sm', role: 'status' },
    label
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
}

export function ErrorState({ message, onRetry, onBack, backLabel }: ErrorStateProps) {
  return React.createElement(
    'div',
    { className: 'max-w-lg mx-auto text-center py-12 px-4', role: 'alert' },
    React.createElement(
      'p',
      { className: 'text-gray-900 font-semibold mb-1' },
      'This did not load'
    ),
    React.createElement('p', { className: 'text-sm text-toledo-slate mb-5' }, message),
    React.createElement(
      'div',
      { className: 'flex items-center justify-center gap-3' },
      onRetry &&
        React.createElement(
          'button',
          {
            onClick: onRetry,
            className:
              'px-4 py-2 bg-toledo-blue text-white rounded-lg text-sm font-medium hover:bg-toledo-navy transition-colors',
          },
          'Try again'
        ),
      onBack &&
        React.createElement(
          'button',
          {
            onClick: onBack,
            className:
              'px-4 py-2 border border-toledo-border text-toledo-blue rounded-lg text-sm font-medium hover:border-toledo-blue transition-colors',
          },
          backLabel || 'Go back'
        )
    )
  );
}

/** Distinct from ErrorState: nothing is wrong, there is simply nothing here. */
export function EmptyState({ message }: { message: string }) {
  return React.createElement(
    'p',
    { className: 'text-center text-toledo-slate py-12 text-sm' },
    message
  );
}
