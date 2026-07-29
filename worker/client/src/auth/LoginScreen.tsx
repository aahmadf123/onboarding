import React, { useState } from 'react';
import { api, takeSignOutReason } from '../lib/api';
import { AuthInput, AuthShell } from './AuthShell';

/** Invite-only email + password (or the one-time invite passcode). */
export function LoginScreen({ onLogin }: { onLogin: (data: any) => void }) {
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'sent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(takeSignOutReason);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password }),
    });
    setLoading(false);
    if (res.success) onLogin(res.data);
    else setError(res.error || 'Sign in failed');
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await api('/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email: email }),
    });
    setLoading(false);
    // The endpoint always reports success so account existence cannot be
    // probed, but a rate-limit or network failure must not be reported as
    // "check your inbox" — that leaves a locked-out user waiting forever.
    if (res && res.success === false) {
      setError(res.error || 'Could not send the reset link. Please try again shortly.');
      return;
    }
    setView('sent');
  }

  if (view === 'forgot' || view === 'sent') {
    return React.createElement(
      AuthShell,
      { subtitle: 'Reset your password' },
      view === 'sent'
        ? React.createElement(
            'div',
            { className: 'text-center space-y-4' },
            React.createElement(
              'p',
              { className: 'text-sm text-gray-600' },
              'If an account exists for ' +
                email +
                ', a reset link has been sent. The link is valid for 60 minutes.'
            ),
            React.createElement(
              'div',
              { className: 'bg-amber-50 border border-amber-200 rounded-lg p-3 text-left' },
              React.createElement(
                'p',
                { className: 'text-xs text-amber-800' },
                React.createElement('strong', null, 'Check your junk folder. '),
                'University mail filtering often blocks these, and it may never arrive. If it does not show up within a few minutes, ask an administrator to re-invite you from Admin → Users. They can read you a new passcode on the spot.'
              )
            ),
            React.createElement(
              'button',
              {
                onClick: function () {
                  setView('login');
                  setError('');
                },
                className:
                  'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold',
              },
              'Back to Sign In'
            )
          )
        : React.createElement(
            'form',
            { onSubmit: handleForgot, className: 'space-y-4' },
            React.createElement(AuthInput, {
              label: 'University Email',
              type: 'email',
              value: email,
              onChange: function (e) {
                setEmail(e.target.value);
              },
              placeholder: 'your.name@utoledo.edu',
              autoComplete: 'email',
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
              loading ? 'Sending...' : 'Email Me a Reset Link'
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: function () {
                  setView('login');
                  setError('');
                },
                className: 'w-full text-xs text-toledo-slate hover:text-gray-600 text-center',
              },
              '← Back to sign in'
            )
          )
    );
  }

  return React.createElement(
    AuthShell,
    null,
    React.createElement(
      'form',
      { onSubmit: handleLogin, className: 'space-y-4' },
      notice &&
        React.createElement(
          'div',
          { className: 'bg-amber-50 border border-amber-200 rounded-lg p-3', role: 'status' },
          React.createElement('p', { className: 'text-xs text-amber-800' }, notice)
        ),
      React.createElement(AuthInput, {
        label: 'University Email',
        type: 'email',
        value: email,
        onChange: function (e) {
          setEmail(e.target.value);
        },
        placeholder: 'your.name@utoledo.edu',
        autoComplete: 'email',
      }),
      React.createElement(AuthInput, {
        label: 'Password',
        type: 'password',
        value: password,
        onChange: function (e) {
          setPassword(e.target.value);
        },
        placeholder: '••••••••••',
        autoComplete: 'current-password',
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
        loading ? 'Signing in...' : 'Sign In'
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: function () {
            setView('forgot');
            setError('');
          },
          className: 'w-full text-xs text-toledo-blue hover:text-toledo-dark text-center font-medium',
        },
        'Forgot password?'
      ),
      React.createElement(
        'div',
        { className: 'bg-blue-50 rounded-lg p-3' },
        React.createElement(
          'p',
          { className: 'text-xs text-blue-700' },
          'First time here? Sign in with the one-time passcode from your invite as your password.'
        ),
        React.createElement(
          'p',
          { className: 'text-xs text-blue-700 mt-2' },
          'No passcode, or locked out? Invite emails are often blocked by university mail filtering. Ask the Athletics onboarding administrator to issue you a passcode directly from Admin → Users.'
        )
      )
    )
  );
}
