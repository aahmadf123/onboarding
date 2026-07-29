import React, { useState } from 'react';
import { api } from '../lib/api';
import { AuthInput, AuthShell } from './AuthShell';
import type { User } from '../lib/types';

interface ForceResetScreenProps {
  currentUser: User | null;
  onComplete: (data: any) => void;
  onSignOut?: () => void;
}

/**
 * Shown after first login (or an admin-forced reset) until the user chooses
 * their own password.
 */
export function ForceResetScreen({ currentUser, onComplete, onSignOut }: ForceResetScreenProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (next.length < 10) {
      setError('New password must be at least 10 characters.');
      return;
    }
    if (next !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await api('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: current, new_password: next }),
    });
    setLoading(false);
    if (res.success) onComplete(res.data);
    else setError(res.error || 'Could not update the password');
  }

  return React.createElement(
    AuthShell,
    { subtitle: 'Choose your password' },
    React.createElement(
      'form',
      { onSubmit: handleSubmit, className: 'space-y-4' },
      React.createElement(
        'p',
        { className: 'text-sm text-gray-600' },
        'Welcome' +
          (currentUser && (currentUser.name || currentUser.email)
            ? ', ' + (currentUser.name || currentUser.email)
            : '') +
          '! Before continuing, set a password of your own.'
      ),
      React.createElement(AuthInput, {
        label: 'Invite passcode (or current password)',
        type: 'password',
        value: current,
        onChange: function (e) {
          setCurrent(e.target.value);
        },
        autoComplete: 'current-password',
      }),
      React.createElement(AuthInput, {
        label: 'New password',
        type: 'password',
        value: next,
        onChange: function (e) {
          setNext(e.target.value);
        },
        hint: 'At least 10 characters.',
        autoComplete: 'new-password',
      }),
      React.createElement(AuthInput, {
        label: 'Confirm new password',
        type: 'password',
        value: confirm,
        onChange: function (e) {
          setConfirm(e.target.value);
        },
        autoComplete: 'new-password',
      }),
      error && React.createElement('p', { className: 'text-red-500 text-sm' }, error),
      React.createElement(
        'button',
        {
          type: 'submit',
          disabled: loading,
          className:
            'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold disabled:opacity-50',
        },
        loading ? 'Saving...' : 'Set Password & Continue'
      ),
      React.createElement(
        'p',
        { className: 'text-xs text-gray-400 text-center' },
        'Lost your passcode? An administrator can issue a new one from Admin → Users.'
      ),
      onSignOut &&
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: onSignOut,
            className: 'w-full text-xs text-gray-400 hover:text-gray-600 text-center',
          },
          'Sign out'
        )
    )
  );
}
