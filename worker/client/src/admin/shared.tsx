import React, { useState } from 'react';
import { IconX } from '../components/Icon';

export const adminInputCls =
  'w-full px-3 py-2 border border-toledo-border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-toledo-blue';
export const adminBtnPrimary =
  'px-4 py-2 bg-toledo-blue text-white rounded-lg text-sm font-medium hover:bg-toledo-navy disabled:opacity-50 transition-colors';
export const adminBtnSecondary =
  'px-4 py-2 border border-toledo-border text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors';

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
  wide?: boolean;
}

export function AdminModal({ title, onClose, children, wide }: AdminModalProps) {
  return React.createElement(
    'div',
    { className: 'fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4' },
    React.createElement(
      'div',
      {
        className:
          'bg-white rounded-2xl border border-toledo-border shadow-xl w-full ' +
          (wide ? 'max-w-3xl' : 'max-w-lg') +
          ' max-h-[90vh] overflow-y-auto',
      },
      React.createElement(
        'div',
        {
          className:
            'flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl',
        },
        React.createElement('h3', { className: 'font-semibold text-gray-900' }, title),
        React.createElement(
          'button',
          { onClick: onClose, className: 'text-gray-400 hover:text-gray-600' },
          React.createElement(IconX)
        )
      ),
      React.createElement('div', { className: 'p-6' }, children)
    )
  );
}

interface AdminFieldProps {
  label: string;
  children?: React.ReactNode;
  hint?: string;
}

export function AdminField({ label, children, hint }: AdminFieldProps) {
  return React.createElement(
    'div',
    { className: 'mb-4' },
    React.createElement(
      'label',
      { className: 'block text-sm font-medium text-gray-700 mb-1' },
      label
    ),
    children,
    hint && React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, hint)
  );
}

const STATUS_PILL: Record<string, string> = {
  invited: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  disabled: 'bg-gray-200 text-gray-500',
};

export function statusPill(status: string) {
  return React.createElement(
    'span',
    {
      className:
        'px-2 py-0.5 rounded-full text-xs font-medium ' +
        (STATUS_PILL[status] || 'bg-gray-100 text-gray-600'),
    },
    status
  );
}

const ROLE_PILL: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  moderator: 'bg-blue-100 text-blue-700',
  staff: 'bg-gray-100 text-gray-600',
};

export function rolePill(role: string) {
  return React.createElement(
    'span',
    { className: 'px-2 py-0.5 rounded-full text-xs font-medium ' + (ROLE_PILL[role] || '') },
    role
  );
}

interface PasscodeRevealProps {
  data: { email: string; passcode: string };
  onClose: () => void;
}

/** Shown after an invite or re-invite. The passcode is never retrievable again. */
export function PasscodeReveal({ data, onClose }: PasscodeRevealProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    try {
      navigator.clipboard.writeText(data.passcode).then(function () {
        setCopied(true);
      });
    } catch {
      /* clipboard blocked; the code is selectable on screen */
    }
  }

  return React.createElement(
    AdminModal,
    { title: 'One-time passcode', onClose: onClose },
    React.createElement(
      'p',
      { className: 'text-sm text-gray-600 mb-3' },
      'Share this passcode with ' +
        data.email +
        ' — they sign in with it and will be asked to set their own password. It is shown only once and expires in 14 days.'
    ),
    React.createElement(
      'div',
      { className: 'flex items-center gap-2 mb-4' },
      React.createElement(
        'code',
        {
          className:
            'flex-1 text-lg font-bold tracking-widest bg-gray-100 rounded-lg px-4 py-3 text-center',
        },
        data.passcode
      ),
      React.createElement(
        'button',
        { onClick: copy, className: adminBtnSecondary },
        copied ? '✓ Copied' : 'Copy'
      )
    ),
    React.createElement(
      'div',
      { className: 'bg-amber-50 rounded-lg p-3 text-xs text-amber-700 mb-4' },
      "An invite email was also sent, but do not count on it arriving. Mail to utoledo.edu addresses is accepted by the university's servers and then filtered, so it can show as accepted in the Email Log and never reach the inbox. Hand this passcode over directly."
    ),
    React.createElement(
      'button',
      { onClick: onClose, className: adminBtnPrimary + ' w-full' },
      'Done'
    )
  );
}
