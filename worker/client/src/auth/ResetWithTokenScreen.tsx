import React, { useState } from 'react';
import { api } from '../lib/api';
import { AuthInput, AuthShell } from './AuthShell';

/** Landing page for /reset-password?token=… links. */
export function ResetWithTokenScreen({ token }: { token: string }) {
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

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
    const res = await api('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token: token, new_password: next }),
    });
    setLoading(false);
    if (res.success) setDone(true);
    else setError(res.error || 'Could not reset the password');
  }

  return React.createElement(
    AuthShell,
    { subtitle: 'Reset your password' },
    done
      ? React.createElement(
          'div',
          { className: 'text-center space-y-4' },
          React.createElement(
            'p',
            { className: 'text-sm text-gray-600' },
            'Your password has been updated. Sign in with your new password.'
          ),
          React.createElement(
            'button',
            {
              onClick: function () {
                window.location.href = '/';
              },
              className:
                'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold',
            },
            'Go to Sign In'
          )
        )
      : React.createElement(
          'form',
          { onSubmit: handleSubmit, className: 'space-y-4' },
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
            loading ? 'Saving...' : 'Reset Password'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: function () {
                window.location.href = '/';
              },
              className: 'w-full text-xs text-toledo-slate hover:text-gray-600 text-center',
            },
            '← Back to sign in'
          )
        )
  );
}
