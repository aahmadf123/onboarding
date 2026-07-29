import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';
import { AdminField, AdminModal, adminBtnPrimary, adminBtnSecondary, adminInputCls } from './shared';

interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'markdown' | 'category';
  required?: boolean;
}

interface ContentEntity {
  id: string;
  label: string;
  titleField: string;
  fields: ContentField[];
}

export const CONTENT_ENTITIES: ContentEntity[] = [
  {
    id: 'articles',
    label: '📄 Articles',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category_id', label: 'Category', type: 'category' },
      { key: 'current_content', label: 'Content (Markdown)', type: 'markdown' },
    ],
  },
  {
    id: 'categories',
    label: '🗂 Categories',
    titleField: 'name',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    id: 'contacts',
    label: '👥 Contacts',
    titleField: 'function_area',
    fields: [
      { key: 'function_area', label: 'Function area', type: 'text', required: true },
      { key: 'contact_name', label: 'Contact name', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      { key: 'display_order', label: 'Display order', type: 'number' },
    ],
  },
  {
    id: 'quicklinks',
    label: '🔗 Quick Links',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'audience', label: 'Audience', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'display_order', label: 'Display order', type: 'number' },
    ],
  },
  {
    id: 'systems',
    label: '💻 Systems',
    titleField: 'system_name',
    fields: [
      { key: 'system_name', label: 'System name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'access_url', label: 'Access URL', type: 'text' },
      { key: 'login_notes', label: 'Login notes', type: 'textarea' },
      { key: 'owner_department', label: 'Owner department', type: 'text' },
      { key: 'support_contact', label: 'Support contact', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'display_order', label: 'Display order', type: 'number' },
    ],
  },
  {
    id: 'policies',
    label: '📋 Policies',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'policy_code', label: 'Policy code', type: 'text' },
      { key: 'applies_to', label: 'Applies to', type: 'text' },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'display_order', label: 'Display order', type: 'number' },
    ],
  },
];

interface ContentFormModalProps {
  entity: ContentEntity;
  row: any | null;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}

function ContentFormModal({ entity, row, categories, onClose, onSaved }: ContentFormModalProps) {
  const initial: Record<string, any> = {};
  entity.fields.forEach(function (f) {
    initial[f.key] = row && row[f.key] != null ? row[f.key] : f.type === 'number' ? 0 : '';
  });

  const [form, setForm] = useState<Record<string, any>>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  function set(key: string, value: unknown) {
    setForm(function (f) {
      const n = Object.assign({}, f);
      n[key] = value;
      return n;
    });
  }

  function insertMap(key: string) {
    set(
      key,
      (form[key] || '') +
        '\n\n::map https://www.google.com/maps?q=Thompson+Student+Union,+Toledo,+OH&output=embed\n'
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload: Record<string, any> = {};
    entity.fields.forEach(function (f) {
      let v = form[f.key];
      if (f.type === 'number') v = Number(v) || 0;
      if (f.type === 'category') v = v ? Number(v) : null;
      payload[f.key] = v;
    });
    const req = row
      ? api('/admin/content/' + entity.id + '/' + row.id, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      : api('/admin/content/' + entity.id, { method: 'POST', body: JSON.stringify(payload) });
    req.then(function (r) {
      setLoading(false);
      if (r.success) onSaved();
      else setError(r.error || 'Save failed');
    });
  }

  function renderField(f: ContentField) {
    if (f.type === 'textarea') {
      return React.createElement('textarea', {
        rows: 3,
        value: form[f.key],
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => set(f.key, e.target.value),
        className: adminInputCls,
      });
    }
    if (f.type === 'markdown') {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { className: 'flex gap-2 mb-2' },
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: function () {
                setPreview(!preview);
              },
              className: 'text-xs text-toledo-blue hover:underline',
            },
            preview ? 'Hide preview' : 'Show preview'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: function () {
                insertMap(f.key);
              },
              className: 'text-xs text-toledo-blue hover:underline',
              title: 'Inserts a ::map line — replace the URL with your Google Maps embed link',
            },
            '+ Insert map embed'
          )
        ),
        React.createElement(
          'div',
          { className: preview ? 'grid grid-cols-2 gap-3' : '' },
          React.createElement('textarea', {
            rows: 14,
            value: form[f.key],
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => set(f.key, e.target.value),
            className: adminInputCls + ' font-mono text-xs',
          }),
          preview &&
            React.createElement('div', {
              className:
                'prose prose-sm max-w-none border border-gray-100 rounded-lg p-3 overflow-y-auto bg-gray-50',
              style: { maxHeight: '340px' },
              // Same path as the live article page, so the preview cannot drift
              // from what readers actually get.
              dangerouslySetInnerHTML: { __html: renderMarkdown(form[f.key] || '') },
            })
        ),
        React.createElement(
          'p',
          { className: 'text-xs text-toledo-slate mt-1' },
          'Tip: a line like "::map <google-maps-embed-url>" becomes an embedded map on the article page.'
        )
      );
    }
    if (f.type === 'category') {
      return React.createElement(
        'select',
        {
          value: form[f.key] || '',
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => set(f.key, e.target.value),
          className: adminInputCls,
        },
        React.createElement('option', { value: '' }, '— none —'),
        categories.map(function (cat) {
          return React.createElement('option', { key: cat.id, value: cat.id }, cat.name);
        })
      );
    }
    return React.createElement('input', {
      type: f.type === 'number' ? 'number' : 'text',
      required: !!f.required,
      value: form[f.key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(f.key, e.target.value),
      className: adminInputCls,
    });
  }

  return React.createElement(
    AdminModal,
    {
      title: (row ? 'Edit ' : 'New ') + entity.label.replace(/^[^ ]+ /, ''),
      onClose: onClose,
      wide: true,
    },
    React.createElement(
      'form',
      { onSubmit: submit },
      entity.fields.map(function (f) {
        return React.createElement(
          AdminField,
          { key: f.key, label: f.label + (f.required ? ' *' : '') },
          renderField(f)
        );
      }),
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
          loading ? 'Saving…' : 'Save'
        )
      )
    )
  );
}

export function AdminContent() {
  const [entityId, setEntityId] = useState('articles');
  const [rows, setRows] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any>(null); // null | 'new' | row
  const [categories, setCategories] = useState<any[]>([]);

  const entity = CONTENT_ENTITIES.find(function (e) {
    return e.id === entityId;
  })!;

  const load = useCallback(function () {
    setRows(null);
    api('/admin/content/' + entityId).then(function (r) {
      if (r.success) setRows(r.data || []);
    });
  }, [entityId]);

  useEffect(
    function () {
      load();
    },
    [load]
  );

  useEffect(function () {
    api('/categories').then(function (r) {
      if (r.success) setCategories(r.data || []);
    });
  }, []);

  function remove(row: any) {
    const label = row[entity.titleField] || '#' + row.id;
    if (
      !window.confirm(
        entityId === 'categories'
          ? 'Delete category "' + label + '"? Only possible when no articles use it.'
          : 'Hide "' + label + '" from the site?'
      )
    )
      return;
    api('/admin/content/' + entityId + '/' + row.id, { method: 'DELETE' }).then(function (r) {
      if (!r.success && r.error) window.alert(r.error);
      load();
    });
  }

  function restore(row: any) {
    api('/admin/content/' + entityId + '/' + row.id, {
      method: 'PUT',
      body: JSON.stringify({ is_active: 1 }),
    }).then(load);
  }

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      { className: 'flex flex-wrap gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit' },
      CONTENT_ENTITIES.map(function (e) {
        return React.createElement(
          'button',
          {
            key: e.id,
            onClick: function () {
              setEntityId(e.id);
              setEditing(null);
            },
            className:
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' +
              (entityId === e.id
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'),
          },
          e.label
        );
      })
    ),
    React.createElement(
      'div',
      { className: 'flex items-center justify-between mb-4' },
      React.createElement(
        'p',
        { className: 'text-sm text-gray-500' },
        'Changes go live immediately — no redeploy needed.'
      ),
      React.createElement(
        'button',
        {
          onClick: function () {
            setEditing('new');
          },
          className: adminBtnPrimary,
        },
        '+ Add'
      )
    ),
    rows === null
      ? React.createElement('p', { className: 'text-toledo-slate py-8 text-center' }, 'Loading…')
      : rows.length === 0
        ? React.createElement('p', { className: 'text-toledo-slate py-8 text-center' }, 'Nothing here yet.')
        : React.createElement(
            'div',
            { className: 'space-y-2' },
            rows.map(function (row) {
              const hidden = row.is_active !== undefined && !row.is_active;
              return React.createElement(
                'div',
                {
                  key: row.id,
                  className:
                    'bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3' +
                    (hidden ? ' opacity-50' : ''),
                },
                React.createElement(
                  'div',
                  { className: 'min-w-0' },
                  React.createElement(
                    'p',
                    { className: 'text-sm font-semibold text-gray-900 truncate' },
                    row[entity.titleField] || '(untitled)'
                  ),
                  React.createElement(
                    'p',
                    { className: 'text-xs text-toledo-slate truncate' },
                    (hidden ? 'hidden · ' : '') +
                      (row.contact_name ||
                        row.url ||
                        row.summary ||
                        row.description ||
                        row.access_url ||
                        (row.current_content ? row.current_content.substring(0, 80) : '') ||
                        '')
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'flex gap-2 flex-shrink-0' },
                  React.createElement(
                    'button',
                    {
                      onClick: function () {
                        setEditing(row);
                      },
                      className: 'text-xs text-toledo-blue hover:underline',
                    },
                    'Edit'
                  ),
                  hidden
                    ? React.createElement(
                        'button',
                        {
                          onClick: function () {
                            restore(row);
                          },
                          className: 'text-xs text-green-600 hover:underline',
                        },
                        'Restore'
                      )
                    : React.createElement(
                        'button',
                        {
                          onClick: function () {
                            remove(row);
                          },
                          className: 'text-xs text-red-500 hover:underline',
                        },
                        entityId === 'categories' ? 'Delete' : 'Hide'
                      )
                )
              );
            })
          ),
    editing &&
      React.createElement(ContentFormModal, {
        entity: entity,
        row: editing === 'new' ? null : editing,
        categories: categories,
        onClose: function () {
          setEditing(null);
        },
        onSaved: function () {
          setEditing(null);
          load();
        },
      })
  );
}
