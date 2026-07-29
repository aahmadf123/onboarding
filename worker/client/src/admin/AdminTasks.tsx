import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  AdminField,
  AdminModal,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInputCls,
  statusPill,
} from './shared';

export const ADMIN_PHASES = [
  { id: 'first-day', label: 'First Day' },
  { id: 'first-week', label: 'First Week' },
  { id: 'first-month', label: 'First Month' },
  { id: 'first-90-days', label: 'First 90 Days' },
];

const PRIORITIES = ['required', 'recommended', 'optional'];

interface TaskFormModalProps {
  task: any | null;
  onClose: () => void;
  onSaved: () => void;
}

function TaskFormModal({ task, onClose, onSaved }: TaskFormModalProps) {
  const [form, setForm] = useState<Record<string, any>>({
    title: task ? task.title : '',
    phase: task ? task.phase : 'first-day',
    priority: task ? task.priority : 'recommended',
    audience: task ? task.audience : 'all',
    description: task ? task.description || '' : '',
    display_order: task ? task.display_order : 0,
    requires_approval: task ? !!task.requires_approval : false,
    link_view: task ? task.link_view || '' : '',
    link_param: task ? task.link_param || '' : '',
    is_active: task ? !!task.is_active : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, value: unknown) {
    setForm(function (f) {
      const n = Object.assign({}, f);
      n[key] = value;
      return n;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = Object.assign({}, form, {
      display_order: Number(form.display_order) || 0,
      link_view: form.link_view || null,
      link_param: form.link_param || null,
    });
    const req = task
      ? api('/admin/tasks/' + task.id, { method: 'PUT', body: JSON.stringify(payload) })
      : api('/admin/tasks', { method: 'POST', body: JSON.stringify(payload) });
    req.then(function (r) {
      setLoading(false);
      if (r.success) onSaved();
      else setError(r.error || 'Save failed');
    });
  }

  return React.createElement(
    AdminModal,
    { title: task ? 'Edit task' : 'New task', onClose: onClose, wide: true },
    React.createElement(
      'form',
      { onSubmit: submit },
      React.createElement(
        AdminField,
        { label: 'Title' },
        React.createElement('input', {
          type: 'text',
          required: true,
          value: form.title,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => set('title', e.target.value),
          className: adminInputCls,
        })
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-2 gap-4' },
        React.createElement(
          AdminField,
          { label: 'Phase' },
          React.createElement(
            'select',
            {
              value: form.phase,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => set('phase', e.target.value),
              className: adminInputCls,
            },
            ADMIN_PHASES.map(function (p) {
              return React.createElement('option', { key: p.id, value: p.id }, p.label);
            })
          )
        ),
        React.createElement(
          AdminField,
          { label: 'Priority' },
          React.createElement(
            'select',
            {
              value: form.priority,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                set('priority', e.target.value),
              className: adminInputCls,
            },
            PRIORITIES.map(function (p) {
              return React.createElement('option', { key: p, value: p }, p);
            })
          )
        )
      ),
      React.createElement(
        AdminField,
        { label: 'Description' },
        React.createElement('textarea', {
          rows: 3,
          value: form.description,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
            set('description', e.target.value),
          className: adminInputCls,
        })
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-2 gap-4' },
        React.createElement(
          AdminField,
          {
            label: 'Audience',
            hint: '"Everyone" shows in all checklists; "Assigned only" reaches just the people you assign.',
          },
          React.createElement(
            'select',
            {
              value: form.audience,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                set('audience', e.target.value),
              className: adminInputCls,
            },
            React.createElement('option', { value: 'all' }, 'Everyone'),
            React.createElement('option', { value: 'assigned' }, 'Assigned only')
          )
        ),
        React.createElement(
          AdminField,
          { label: 'Display order' },
          React.createElement('input', {
            type: 'number',
            value: form.display_order,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              set('display_order', e.target.value),
            className: adminInputCls,
          })
        )
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-2 gap-4' },
        React.createElement(
          AdminField,
          { label: 'Link view (optional)', hint: 'Where "Explore full details" points.' },
          React.createElement(
            'select',
            {
              value: form.link_view,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                set('link_view', e.target.value),
              className: adminInputCls,
            },
            React.createElement('option', { value: '' }, 'No link'),
            React.createElement('option', { value: 'category' }, 'Category (set id below)'),
            React.createElement('option', { value: 'contacts' }, 'Contacts page'),
            React.createElement('option', { value: 'resources' }, 'Resources page'),
            React.createElement('option', { value: 'policies' }, 'Policies page')
          )
        ),
        React.createElement(
          AdminField,
          { label: 'Link parameter' },
          React.createElement('input', {
            type: 'text',
            value: form.link_param,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => set('link_param', e.target.value),
            placeholder: 'e.g. 6 for IT & Campus Access',
            className: adminInputCls,
          })
        )
      ),
      React.createElement(
        'div',
        { className: 'flex items-center gap-6 mb-4' },
        React.createElement(
          'label',
          { className: 'flex items-center gap-2 text-sm text-gray-700 cursor-pointer' },
          React.createElement('input', {
            type: 'checkbox',
            checked: form.requires_approval,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              set('requires_approval', e.target.checked),
          }),
          'Requires admin sign-off'
        ),
        task &&
          React.createElement(
            'label',
            { className: 'flex items-center gap-2 text-sm text-gray-700 cursor-pointer' },
            React.createElement('input', {
              type: 'checkbox',
              checked: form.is_active,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                set('is_active', e.target.checked),
            }),
            'Visible'
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
          loading ? 'Saving…' : 'Save Task'
        )
      )
    )
  );
}

interface AssignTaskModalProps {
  task: any;
  onClose: () => void;
  onAssigned: (count: number) => void;
}

function AssignTaskModal({ task, onClose, onAssigned }: AssignTaskModalProps) {
  const [users, setUsers] = useState<any[] | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(function () {
    api('/admin/users').then(function (r) {
      if (r.success)
        setUsers(
          (r.data || []).filter(function (u: any) {
            return u.status !== 'disabled';
          })
        );
    });
  }, []);

  function toggleUser(id: number) {
    setSelected(function (s) {
      const n = Object.assign({}, s);
      n[id] = !n[id];
      return n;
    });
  }

  function submit() {
    const ids = Object.keys(selected)
      .filter(function (k) {
        return selected[k];
      })
      .map(Number);
    if (ids.length === 0) {
      setError('Pick at least one person.');
      return;
    }
    setLoading(true);
    setError('');
    api('/admin/tasks/' + task.id + '/assign', {
      method: 'POST',
      body: JSON.stringify({ user_ids: ids }),
    }).then(function (r) {
      setLoading(false);
      if (r.success) onAssigned(r.data.assigned);
      else setError(r.error || 'Assignment failed');
    });
  }

  return React.createElement(
    AdminModal,
    { title: 'Assign "' + task.title + '"', onClose: onClose },
    React.createElement(
      'p',
      { className: 'text-xs text-gray-500 mb-3' },
      'Each selected person gets this task in their checklist and an email notification.'
    ),
    users === null
      ? React.createElement('p', { className: 'text-toledo-slate text-sm' }, 'Loading…')
      : React.createElement(
          'div',
          {
            className:
              'max-h-64 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100 mb-4',
          },
          users.map(function (u) {
            return React.createElement(
              'label',
              {
                key: u.id,
                className: 'flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50',
              },
              React.createElement('input', {
                type: 'checkbox',
                checked: !!selected[u.id],
                onChange: function () {
                  toggleUser(u.id);
                },
              }),
              React.createElement(
                'span',
                { className: 'text-sm text-gray-800 flex-1' },
                (u.name ? u.name + ' — ' : '') + u.email
              ),
              statusPill(u.status)
            );
          })
        ),
    error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
    React.createElement(
      'div',
      { className: 'flex gap-2 justify-end' },
      React.createElement('button', { onClick: onClose, className: adminBtnSecondary }, 'Cancel'),
      React.createElement(
        'button',
        { onClick: submit, disabled: loading, className: adminBtnPrimary },
        loading ? 'Assigning…' : 'Assign & Notify'
      )
    )
  );
}

export function AdminTasks() {
  const [tasks, setTasks] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any>(null); // null | 'new' | task object
  const [assigning, setAssigning] = useState<any>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function load() {
    api('/admin/tasks').then(function (r) {
      if (r.success) setTasks(r.data || []);
    });
  }
  useEffect(load, []);

  function deactivate(task: any) {
    if (!window.confirm('Hide "' + task.title + '" for everyone? Existing progress is kept.'))
      return;
    setError('');
    // .then(load) discarded the result, so a rejected delete looked identical
    // to a successful one: the list simply reloaded unchanged.
    api('/admin/tasks/' + task.id, { method: 'DELETE' }).then(function (r) {
      if (!r.success) {
        setError(r.error || 'Could not hide that task.');
        return;
      }
      load();
    });
  }

  if (tasks === null)
    return React.createElement('p', { className: 'text-toledo-slate py-8 text-center' }, 'Loading…');

  function taskRow(t: any) {
    return React.createElement(
      'div',
      {
        key: t.id,
        className:
          'bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-3' +
          (t.is_active ? '' : ' opacity-50'),
      },
      React.createElement(
        'div',
        { className: 'min-w-0' },
        React.createElement(
          'div',
          { className: 'flex flex-wrap items-center gap-2' },
          React.createElement('p', { className: 'text-sm font-semibold text-gray-900' }, t.title),
          React.createElement(
            'span',
            { className: 'text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500' },
            t.priority
          ),
          !!t.requires_approval &&
            React.createElement(
              'span',
              { className: 'text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700' },
              '🔏 needs sign-off'
            ),
          t.audience === 'assigned' &&
            React.createElement(
              'span',
              { className: 'text-xs px-2 py-0.5 rounded-full bg-toledo-gold/20 text-toledo-blue' },
              '📌 assigned only'
            ),
          !t.is_active &&
            React.createElement(
              'span',
              { className: 'text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500' },
              'hidden'
            )
        ),
        t.description &&
          React.createElement(
            'p',
            { className: 'text-xs text-gray-500 mt-1 line-clamp-2' },
            t.description
          )
      ),
      React.createElement(
        'div',
        { className: 'flex gap-2 flex-shrink-0' },
        React.createElement(
          'button',
          {
            onClick: function () {
              setAssigning(t);
            },
            className: 'text-xs text-toledo-blue hover:underline',
          },
          'Assign'
        ),
        React.createElement(
          'button',
          {
            onClick: function () {
              setEditing(t);
            },
            className: 'text-xs text-gray-500 hover:underline',
          },
          'Edit'
        ),
        !!t.is_active &&
          React.createElement(
            'button',
            {
              onClick: function () {
                deactivate(t);
              },
              className: 'text-xs text-red-500 hover:underline',
            },
            'Hide'
          )
      )
    );
  }

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'flex items-center justify-between mb-4' },
      React.createElement(
        'p',
        { className: 'text-sm text-gray-500' },
        'Required steps apply to everyone; assigned-only tasks reach just the people you pick.'
      ),
      React.createElement(
        'button',
        {
          onClick: function () {
            setEditing('new');
          },
          className: adminBtnPrimary,
        },
        '+ New Task'
      )
    ),
    notice && React.createElement('p', { className: 'text-green-600 text-sm mb-3' }, notice),
    error &&
      React.createElement(
        'div',
        { className: 'mb-3 bg-red-50 border border-red-200 rounded-lg p-3', role: 'alert' },
        React.createElement('p', { className: 'text-sm text-red-700' }, error)
      ),
    ADMIN_PHASES.map(function (phase) {
      const phaseTasks = tasks.filter(function (t) {
        return t.phase === phase.id;
      });
      if (phaseTasks.length === 0) return null;
      return React.createElement(
        'div',
        { key: phase.id, className: 'mb-6' },
        React.createElement('h3', { className: 'text-sm font-bold text-gray-700 mb-2' }, phase.label),
        React.createElement('div', { className: 'space-y-2' }, phaseTasks.map(taskRow))
      );
    }),
    editing &&
      React.createElement(TaskFormModal, {
        task: editing === 'new' ? null : editing,
        onClose: function () {
          setEditing(null);
        },
        onSaved: function () {
          setEditing(null);
          load();
        },
      }),
    assigning &&
      React.createElement(AssignTaskModal, {
        task: assigning,
        onClose: function () {
          setAssigning(null);
        },
        onAssigned: function (n) {
          setAssigning(null);
          setNotice(
            'Assigned to ' + n + ' user' + (n === 1 ? '' : 's') + ' — notification emails sent.'
          );
          setTimeout(function () {
            setNotice('');
          }, 4000);
        },
      })
  );
}
