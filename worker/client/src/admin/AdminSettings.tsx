import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { AdminField, adminBtnPrimary, adminBtnSecondary, adminInputCls } from './shared';

export function AdminSettings() {
  const [cfg, setCfg] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(function () {
    api('/admin/settings').then(function (r) {
      if (r.success) setCfg(r.data);
    });
  }, []);

  function set(key: string, value: string) {
    setCfg(function (c: any) {
      const n = Object.assign({}, c);
      n[key] = value;
      return n;
    });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    api('/admin/settings', { method: 'PUT', body: JSON.stringify(cfg) }).then(function (r) {
      setSaving(false);
      if (r.success) {
        setCfg(r.data);
        setNotice('Settings saved.');
      } else setError(r.error || 'Save failed');
    });
  }

  function sendTest() {
    setNotice('');
    setError('');
    api('/admin/settings/test-email', { method: 'POST' }).then(function (r) {
      if (r.success) setNotice(r.message || 'Test email sent.');
      else setError(r.error || 'Test email failed — check the Email Log.');
    });
  }

  if (cfg === null)
    return React.createElement('p', { className: 'text-toledo-slate py-8 text-center' }, 'Loading…');

  return React.createElement(
    'form',
    { onSubmit: save, className: 'max-w-xl' },
    React.createElement(
      AdminField,
      {
        label: 'Email from-address',
        hint: 'onboarding@resend.dev only delivers to the Resend account owner. After verifying a domain in the Resend dashboard, change this to e.g. onboarding@yourdomain.com — no redeploy needed.',
      },
      React.createElement('input', {
        type: 'text',
        value: cfg.email_from_address,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          set('email_from_address', e.target.value),
        className: adminInputCls,
      })
    ),
    React.createElement(
      AdminField,
      { label: 'Email from-name' },
      React.createElement('input', {
        type: 'text',
        value: cfg.email_from_name,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => set('email_from_name', e.target.value),
        className: adminInputCls,
      })
    ),
    React.createElement(
      AdminField,
      { label: 'Portal base URL', hint: 'Used for links inside emails.' },
      React.createElement('input', {
        type: 'text',
        value: cfg.app_base_url,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => set('app_base_url', e.target.value),
        className: adminInputCls,
      })
    ),
    React.createElement(
      'label',
      { className: 'flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-4' },
      React.createElement('input', {
        type: 'checkbox',
        checked: cfg.weekly_reminder_enabled === '1',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          set('weekly_reminder_enabled', e.target.checked ? '1' : '0'),
      }),
      'Send weekly reminder emails (Mondays) to users with open required or assigned tasks'
    ),
    React.createElement(
      'label',
      { className: 'flex items-start gap-2 text-sm text-gray-700 cursor-pointer mb-1' },
      React.createElement('input', {
        type: 'checkbox',
        className: 'mt-1',
        checked: cfg.admin_digest_enabled === '1',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          set('admin_digest_enabled', e.target.checked ? '1' : '0'),
      }),
      'Send admins a weekly digest of who is behind'
    ),
    React.createElement(
      'p',
      { className: 'text-xs text-gray-500 mb-4 ml-6' },
      'Separate from the toggle above. Per-user reminders are often filtered by university mail, so the digest is usually the one worth keeping. The same list is always available under Who Is Behind.'
    ),
    notice && React.createElement('p', { className: 'text-green-600 text-sm mb-3' }, notice),
    error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
    React.createElement(
      'div',
      { className: 'flex gap-2' },
      React.createElement(
        'button',
        { type: 'submit', disabled: saving, className: adminBtnPrimary },
        saving ? 'Saving…' : 'Save Settings'
      ),
      React.createElement(
        'button',
        { type: 'button', onClick: sendTest, className: adminBtnSecondary },
        'Send me a test email'
      )
    )
  );
}
