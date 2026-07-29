import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../lib/dates';
import { api } from '../lib/api';
import { PRIMARY_SUPERADMIN_EMAIL } from '../lib/constants';
import {
  AdminField,
  AdminModal,
  PasscodeReveal,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInputCls,
  rolePill,
  statusPill,
} from './shared';
import type { User } from '../lib/types';

const ROLES = ['staff', 'moderator', 'admin'];

interface InviteUserModalProps {
  onClose: () => void;
  onInvited: (data: { email: string; passcode: string }) => void;
}

function InviteUserModal({ onClose, onInvited }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    api('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email: email, name: name, role: role }),
    }).then(function (r) {
      setLoading(false);
      if (r.success) onInvited({ email: r.data.user.email, passcode: r.data.passcode });
      else setError(r.error || 'Invite failed');
    });
  }

  return React.createElement(
    AdminModal,
    { title: 'Invite a user', onClose: onClose },
    React.createElement(
      'form',
      { onSubmit: submit },
      React.createElement(
        AdminField,
        { label: 'Email' },
        React.createElement('input', {
          type: 'email',
          required: true,
          value: email,
          onChange: function (e: React.ChangeEvent<HTMLInputElement>) {
            setEmail(e.target.value);
          },
          placeholder: 'their.name@utoledo.edu',
          className: adminInputCls,
        })
      ),
      React.createElement(
        AdminField,
        { label: 'Name (optional)' },
        React.createElement('input', {
          type: 'text',
          value: name,
          onChange: function (e: React.ChangeEvent<HTMLInputElement>) {
            setName(e.target.value);
          },
          className: adminInputCls,
        })
      ),
      React.createElement(
        AdminField,
        { label: 'Role' },
        React.createElement(
          'select',
          {
            value: role,
            onChange: function (e: React.ChangeEvent<HTMLSelectElement>) {
              setRole(e.target.value);
            },
            className: adminInputCls,
          },
          ROLES.map(function (r) {
            return React.createElement('option', { key: r, value: r }, r);
          })
        )
      ),
      error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
      React.createElement(
        'div',
        { className: 'flex gap-2 justify-end' },
        React.createElement(
          'button',
          { type: 'button', onClick: onClose, className: adminBtnSecondary },
          'Cancel'
        ),
        React.createElement(
          'button',
          { type: 'submit', disabled: loading, className: adminBtnPrimary },
          loading ? 'Inviting…' : 'Invite & Generate Passcode'
        )
      )
    )
  );
}

export function AdminUsers({ currentUser }: { currentUser: User | null }) {
  const [users, setUsers] = useState<any[] | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [reveal, setReveal] = useState<{ email: string; passcode: string } | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState('');

  function load() {
    api('/admin/users').then(function (r) {
      if (r.success) setUsers(r.data || []);
    });
  }
  useEffect(load, []);

  function updateUser(id: number, patch: Record<string, unknown>) {
    setBusy(id);
    api('/admin/users/' + id, { method: 'PUT', body: JSON.stringify(patch) }).then(function (r) {
      setBusy(null);
      if (r.success) load();
      else setError(r.error || 'Update failed');
    });
  }

  function reinvite(user: any) {
    if (
      !window.confirm(
        'Generate a new passcode for ' +
          user.email +
          '? Their current sessions and password will stop working.'
      )
    )
      return;
    setBusy(user.id);
    api('/admin/users/' + user.id + '/reinvite', { method: 'POST' }).then(function (r) {
      setBusy(null);
      if (r.success) {
        setReveal({ email: user.email, passcode: r.data.passcode });
        load();
      } else setError(r.error || 'Re-invite failed');
    });
  }

  function deleteUser(user: any) {
    if (
      !window.confirm(
        'Delete ' +
          user.email +
          '? This permanently removes their account, authored submissions/tips, and related records.'
      )
    )
      return;
    setBusy(user.id);
    api('/admin/users/' + user.id, { method: 'DELETE' }).then(function (r) {
      setBusy(null);
      if (r.success) load();
      else setError(r.error || 'Delete failed');
    });
  }

  if (users === null)
    return React.createElement('p', { className: 'text-toledo-slate py-8 text-center' }, 'Loading…');

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'flex items-center justify-between mb-4' },
      React.createElement('p', { className: 'text-sm text-gray-500' }, users.length + ' users'),
      React.createElement(
        'button',
        {
          onClick: function () {
            setShowInvite(true);
          },
          className: adminBtnPrimary,
        },
        '+ Invite User'
      )
    ),
    error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
    React.createElement(
      'div',
      { className: 'bg-white rounded-xl border border-gray-200 overflow-x-auto' },
      React.createElement(
        'table',
        { className: 'w-full min-w-[640px]' },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { className: 'bg-gray-50 border-b border-gray-200' },
            ['User', 'Role', 'Status', 'Last login', 'Actions'].map(function (h) {
              return React.createElement(
                'th',
                {
                  key: h,
                  className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase',
                },
                h
              );
            })
          )
        ),
        React.createElement(
          'tbody',
          null,
          users.map(function (u) {
            const isSelf = currentUser && u.id === currentUser.id;
            return React.createElement(
              'tr',
              { key: u.id, className: 'border-b border-gray-100 last:border-0' },
              React.createElement(
                'td',
                { className: 'px-4 py-3' },
                React.createElement('p', { className: 'text-sm text-gray-900' }, u.name || u.email),
                u.name && React.createElement('p', { className: 'text-xs text-toledo-slate' }, u.email)
              ),
              React.createElement(
                'td',
                { className: 'px-4 py-3' },
                isSelf
                  ? rolePill(u.role)
                  : React.createElement(
                      'select',
                      {
                        value: u.role,
                        disabled: busy === u.id,
                        onChange: function (e: React.ChangeEvent<HTMLSelectElement>) {
                          updateUser(u.id, { role: e.target.value });
                        },
                        className: 'text-xs border border-gray-200 rounded-lg px-2 py-1',
                      },
                      ROLES.map(function (r) {
                        return React.createElement('option', { key: r, value: r }, r);
                      })
                    )
              ),
              React.createElement('td', { className: 'px-4 py-3' }, statusPill(u.status)),
              React.createElement(
                'td',
                { className: 'px-4 py-3 text-xs text-gray-500' },
                formatDateTime(u.last_login_at)
              ),
              React.createElement(
                'td',
                { className: 'px-4 py-3' },
                React.createElement(
                  'div',
                  { className: 'flex flex-wrap items-center gap-1' },
                  u.status !== 'disabled' &&
                    React.createElement(
                      'button',
                      {
                        onClick: function () {
                          reinvite(u);
                        },
                        disabled: busy === u.id,
                        className:
                          'text-xs text-toledo-blue hover:underline disabled:opacity-50 px-2 py-2 min-h-[36px]',
                      },
                      'Re-invite'
                    ),
                  !isSelf &&
                    React.createElement(
                      'button',
                      {
                        onClick: function () {
                          const disable = u.status !== 'disabled';
                          if (
                            disable &&
                            !window.confirm(
                              'Disable ' + u.email + '? They will be signed out immediately.'
                            )
                          )
                            return;
                          updateUser(u.id, { status: disable ? 'disabled' : 'active' });
                        },
                        disabled: busy === u.id,
                        className:
                          'text-xs px-2 py-2 min-h-[36px] ' +
                          (u.status === 'disabled' ? 'text-green-600' : 'text-red-500') +
                          ' hover:underline disabled:opacity-50',
                      },
                      u.status === 'disabled' ? 'Enable' : 'Disable'
                    ),
                  // Delete is separated from Re-invite and Disable, and given a
                  // border rather than being a third bare link in a row. On a
                  // phone these were ~16px targets sitting flush together, so a
                  // mistap on Re-invite deleted the account instead.
                  !isSelf &&
                    u.email !== PRIMARY_SUPERADMIN_EMAIL &&
                    React.createElement(
                      'button',
                      {
                        onClick: function () {
                          deleteUser(u);
                        },
                        disabled: busy === u.id,
                        className:
                          'text-xs text-red-700 disabled:opacity-50 px-2 py-2 min-h-[36px] ml-3 border-l border-toledo-border pl-3 hover:bg-red-50 rounded-r',
                      },
                      'Delete'
                    )
                )
              )
            );
          })
        )
      )
    ),
    showInvite &&
      React.createElement(InviteUserModal, {
        onClose: function () {
          setShowInvite(false);
        },
        onInvited: function (data) {
          setShowInvite(false);
          setReveal(data);
          load();
        },
      }),
    reveal &&
      React.createElement(PasscodeReveal, {
        data: reveal,
        onClose: function () {
          setReveal(null);
        },
      })
  );
}
