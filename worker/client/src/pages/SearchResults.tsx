import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { NavigateFn, SearchHit } from '../lib/types';

const TYPE_LABELS: Record<string, string> = {
  all: 'All',
  article: 'Articles',
  contact: 'Contacts',
  system: 'Systems',
  policy: 'Policies',
};

const TYPE_BADGE_COLOR: Record<string, string> = {
  article: 'bg-blue-50 text-blue-600',
  contact: 'bg-purple-50 text-purple-700',
  system: 'bg-green-50 text-green-700',
  policy: 'bg-orange-50 text-orange-700',
};

const TYPE_ORDER = ['all', 'article', 'contact', 'system', 'policy'];

function escapeHtml(text: unknown): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Neutralises regex metacharacters so a query like "C++" or "401(k" is matched
 * literally. When this file was a template literal the escapes were stripped
 * before the browser saw them, so this escaped nothing and those queries threw
 * inside render — which unmounted the entire app.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, q: string): string {
  if (!text || !q) return escapeHtml(text);
  let escaped = escapeHtml(text);
  const terms = q.split(/\s+/).filter(function (t) {
    return t.length > 1;
  });
  terms.forEach(function (term) {
    const re = new RegExp('(' + escapeRegex(term) + ')', 'gi');
    escaped = escaped.replace(re, '<mark>$1</mark>');
  });
  return escaped;
}

function getSnippet(item: SearchHit, q: string): string {
  const raw = item.current_content || item.description || item.summary || item.notes || '';
  if (!raw) return '';
  const firstTerm = (q || '').split(/\s+/)[0] || '';
  const idx = firstTerm ? raw.toLowerCase().indexOf(firstTerm.toLowerCase()) : -1;
  const start = idx > 60 ? idx - 60 : 0;
  const end = Math.min(raw.length, start + 220);
  let snippet = raw
    .substring(start, end)
    .replace(/[#*_~>|!\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (start > 0) snippet = '…' + snippet;
  if (end < raw.length) snippet = snippet + '…';
  return snippet;
}

interface SearchResultsProps {
  query: string | null;
  onNavigate: NavigateFn;
}

export function SearchResults({ query, onNavigate }: SearchResultsProps) {
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    setLoading(true);
    setActiveType('all');
    api('/search?q=' + encodeURIComponent(query || '')).then((r) => {
      if (r.success) setResults(r.data || []);
      setLoading(false);
    });
  }, [query]);

  function handleItemClick(item: SearchHit) {
    const type = item.result_type || 'article';
    if (type === 'article') onNavigate('article', item.id);
    else if (type === 'contact') onNavigate('contacts');
    else if (type === 'system') onNavigate('resources');
    else if (type === 'policy') onNavigate('policies');
  }

  const typeCounts = results.reduce(function (acc: Record<string, number>, r) {
    const t = r.result_type || 'article';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const filtered =
    activeType === 'all'
      ? results
      : results.filter(function (r) {
          return (r.result_type || 'article') === activeType;
        });

  return React.createElement(
    'div',
    { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'h1',
      { className: 'display-title text-2xl text-toledo-blue mb-1' },
      'Search Results'
    ),
    React.createElement('p', { className: 'text-toledo-slate mb-5' }, 'Results for "' + query + '"'),

    // Type filter chips
    !loading &&
      results.length > 0 &&
      React.createElement(
        'div',
        { className: 'flex flex-wrap gap-2 mb-6' },
        TYPE_ORDER.filter(function (t) {
          return t === 'all' || typeCounts[t];
        }).map(function (type) {
          const count = type === 'all' ? results.length : typeCounts[type] || 0;
          const active = activeType === type;
          return React.createElement(
            'button',
            {
              key: type,
              onClick: function () {
                setActiveType(type);
              },
              className:
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ' +
                (active
                  ? 'bg-toledo-blue text-white border-toledo-blue'
                  : 'bg-white text-gray-600 border-toledo-border hover:border-toledo-blue/40 hover:text-toledo-blue'),
            },
            TYPE_LABELS[type] + ' (' + count + ')'
          );
        })
      ),

    loading
      ? React.createElement('p', { className: 'text-center text-gray-500 py-8' }, 'Searching...')
      : filtered.length === 0
        ? React.createElement(
            'p',
            { className: 'text-center text-gray-500 py-8' },
            'No results found. Try a different search term.'
          )
        : React.createElement(
            'div',
            { className: 'space-y-3' },
            filtered.map(function (item, idx) {
              const type = item.result_type || 'article';
              const title = item.title || '';
              const snippet = getSnippet(item, query || '');
              return React.createElement(
                'button',
                {
                  key: idx,
                  onClick: function () {
                    handleItemClick(item);
                  },
                  className:
                    'w-full bg-white rounded-2xl border border-toledo-border p-5 text-left hover:shadow-md hover:border-toledo-gold transition-all',
                },
                React.createElement(
                  'div',
                  { className: 'flex items-center gap-2 mb-1' },
                  React.createElement(
                    'span',
                    {
                      className:
                        'text-xs px-2 py-0.5 rounded-full font-medium ' +
                        (TYPE_BADGE_COLOR[type] || 'bg-gray-100 text-gray-600'),
                    },
                    TYPE_LABELS[type] || type
                  ),
                  type === 'article' &&
                    item.category_name &&
                    React.createElement(
                      'span',
                      { className: 'text-xs text-toledo-slate' },
                      item.category_name
                    )
                ),
                React.createElement('h3', {
                  className: 'font-semibold text-gray-900 mb-1',
                  dangerouslySetInnerHTML: { __html: highlightText(title, query || '') },
                }),
                snippet &&
                  React.createElement('p', {
                    className: 'text-sm text-gray-500 line-clamp-2',
                    dangerouslySetInnerHTML: { __html: highlightText(snippet, query || '') },
                  }),
                type === 'contact' &&
                  React.createElement(
                    'div',
                    { className: 'mt-2 flex flex-wrap gap-3 text-xs text-toledo-slate' },
                    item.email && React.createElement('span', null, item.email),
                    item.phone && React.createElement('span', null, item.phone)
                  )
              );
            })
          )
  );
}

// Exported for the unit test that proves the escape-corruption bug cannot return.
export const __test = { escapeRegex, highlightText, getSnippet };
