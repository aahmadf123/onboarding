import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { IconSearch } from './Icon';
import type { NavigateFn, SearchHit } from '../lib/types';

const TYPE_COLOR: Record<string, string> = {
  article: 'bg-blue-50 text-blue-600',
  contact: 'bg-purple-50 text-purple-600',
  system: 'bg-green-50 text-green-600',
  policy: 'bg-orange-50 text-orange-600',
};

interface SearchBarProps {
  onSearch: (q: string) => void;
  onNavigate?: NavigateFn;
  compact?: boolean;
}

export function SearchBar({ onSearch, onNavigate, compact }: SearchBarProps) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(function () {
    function handleOutsideClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShowDrop(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return function () {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    debounceRef.current = setTimeout(function () {
      api('/search?q=' + encodeURIComponent(val.trim()))
        .then(function (r) {
          if (r.success && r.data.length > 0) {
            setSuggestions(r.data.slice(0, 5));
            setShowDrop(true);
          } else {
            setSuggestions([]);
            setShowDrop(false);
          }
        })
        .catch(function () {});
    }, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowDrop(false);
    if (q.trim()) onSearch(q.trim());
  }

  function handleSuggestionClick(item: SearchHit) {
    setShowDrop(false);
    setQ('');
    setSuggestions([]);
    const type = item.result_type || 'article';
    if (onNavigate) {
      if (type === 'article') onNavigate('article', item.id);
      else if (type === 'contact') onNavigate('contacts');
      else if (type === 'system') onNavigate('resources');
      else if (type === 'policy') onNavigate('policies');
      else onSearch(q.trim());
    } else {
      onSearch(item.title || q.trim());
    }
  }

  return React.createElement(
    'div',
    { className: 'relative', ref: wrapRef },
    React.createElement(
      'form',
      { onSubmit: handleSubmit, className: 'relative' },
      React.createElement(
        'div',
        {
          className:
            'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400',
        },
        React.createElement(IconSearch)
      ),
      React.createElement('input', {
        type: 'text',
        value: q,
        onChange: handleChange,
        onFocus: function () {
          if (suggestions.length > 0) setShowDrop(true);
        },
        placeholder: compact
          ? 'Search systems, policies, contacts...'
          : 'Search by topic, system, policy, or person...',
        className:
          'w-full pl-12 pr-4 ' +
          (compact
            ? 'py-2 bg-gray-50 focus:bg-white border-toledo-border'
            : 'py-3 bg-white border-gray-200 shadow-xs') +
          ' border text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-toledo-blue text-sm ' +
          (showDrop && suggestions.length > 0 ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'),
      })
    ),
    showDrop &&
      suggestions.length > 0 &&
      React.createElement(
        'div',
        {
          className:
            'absolute left-0 right-0 bg-white border border-gray-200 border-t-0 rounded-b-xl shadow-xl z-50 overflow-hidden',
        },
        suggestions.map(function (item, i) {
          const type = item.result_type || 'article';
          const title = item.title || '';
          const snippet = (
            item.current_content ||
            item.description ||
            item.summary ||
            item.notes ||
            ''
          ).substring(0, 70);
          const meta =
            item.category_name ||
            item.function_area ||
            item.category ||
            item.department ||
            item.policy_code ||
            item.applies_to ||
            '';
          return React.createElement(
            'button',
            {
              key: i,
              onClick: function () {
                handleSuggestionClick(item);
              },
              className:
                'w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-t border-gray-100 transition-colors',
            },
            React.createElement(
              'div',
              { className: 'flex-1 min-w-0' },
              React.createElement(
                'p',
                { className: 'text-sm font-medium text-gray-900 truncate' },
                title
              ),
              meta &&
                React.createElement(
                  'p',
                  {
                    className:
                      'text-[11px] uppercase tracking-wide text-gray-400 mt-0.5 truncate',
                  },
                  meta
                ),
              snippet &&
                React.createElement(
                  'p',
                  { className: 'text-xs text-gray-400 truncate mt-0.5' },
                  snippet
                )
            ),
            React.createElement(
              'span',
              {
                className:
                  'flex-shrink-0 text-xs px-1.5 py-0.5 rounded-sm font-medium ' +
                  (TYPE_COLOR[type] || 'bg-gray-100 text-gray-600'),
              },
              type
            )
          );
        }),
        React.createElement(
          'button',
          {
            onClick: function () {
              setShowDrop(false);
              if (q.trim()) onSearch(q.trim());
            },
            className:
              'w-full px-4 py-2.5 text-sm text-toledo-blue font-medium border-t border-gray-100 hover:bg-toledo-blue/5 transition-colors text-center',
          },
          'See all results for "' + q + '" →'
        )
      )
  );
}
