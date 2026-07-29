import React from 'react';
import { formatDate } from '../lib/dates';
import { useResource } from '../lib/useResource';
import { CategoryIcon, IconArrowLeft } from '../components/Icon';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import type { NavigateFn } from '../lib/types';

interface CategoryViewProps {
  categoryId: string | null;
  onNavigate: NavigateFn;
}

export function CategoryView({ categoryId, onNavigate }: CategoryViewProps) {
  const path = categoryId ? '/categories/' + categoryId : null;
  const {
    data: category,
    error,
    loading,
    reload,
  } = useResource<any>(path, 'This topic may have been removed.');
  const { data: articleData } = useResource<any[]>(path ? path + '/articles' : null);
  const articles = articleData || [];

  if (loading) return React.createElement(LoadingState);

  // A removed topic 404s here; that used to render "Loading..." indefinitely.
  if (error || !category)
    return React.createElement(ErrorState, {
      message: error || 'This topic could not be found.',
      onRetry: reload,
      onBack: () => onNavigate('categories'),
      backLabel: 'All topics',
    });

  return React.createElement(
    'div',
    { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'button',
      {
        onClick: () => onNavigate('categories'),
        className:
          'flex items-center gap-2 text-toledo-blue hover:text-toledo-navy mb-6 text-sm font-medium',
      },
      React.createElement(IconArrowLeft),
      'All topics'
    ),
    React.createElement(
      'div',
      { className: 'flex items-center gap-3 mb-8' },
      React.createElement(CategoryIcon, { name: category.name }),
      React.createElement(
        'div',
        null,
        React.createElement(
          'h1',
          { className: 'display-title text-2xl md:text-3xl text-toledo-blue' },
          category.name
        ),
        React.createElement(
          'p',
          { className: 'text-toledo-slate mt-1 text-sm' },
          category.description
        )
      )
    ),
    articles.length === 0
      ? React.createElement(EmptyState, { message: 'No articles in this category yet.' })
      : React.createElement(
          'div',
          { className: 'space-y-3 stagger' },
          articles.map((article) =>
            React.createElement(
              'button',
              {
                key: article.id,
                onClick: () => onNavigate('article', article.id),
                className:
                  'w-full bg-white rounded-2xl border border-toledo-border p-5 text-left hover:shadow-md hover:border-toledo-gold transition-all',
              },
              React.createElement('h3', { className: 'font-semibold text-gray-900' }, article.title),
              React.createElement(
                'p',
                { className: 'text-sm text-gray-500 mt-1 line-clamp-2' },
                article.current_content
                  ? article.current_content
                      .replace(/[#*_~>|!\[\]]/g, '')
                      .replace(/\s+/g, ' ')
                      .substring(0, 200) + '...'
                  : ''
              ),
              React.createElement(
                'p',
                { className: 'text-xs text-toledo-slate mt-2' },
                'Last updated: ' + formatDate(article.last_updated)
              )
            )
          )
        )
  );
}
