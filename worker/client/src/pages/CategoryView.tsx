import React, { useEffect, useState } from 'react';
import { formatDate } from '../lib/dates';
import { api } from '../lib/api';
import { CategoryIcon, IconArrowLeft } from '../components/Icon';
import type { NavigateFn } from '../lib/types';

interface CategoryViewProps {
  categoryId: string | null;
  onNavigate: NavigateFn;
}

export function CategoryView({ categoryId, onNavigate }: CategoryViewProps) {
  const [category, setCategory] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    api('/categories/' + categoryId).then((r) => r.success && setCategory(r.data));
    api('/categories/' + categoryId + '/articles').then((r) => r.success && setArticles(r.data));
  }, [categoryId]);

  if (!category)
    return React.createElement(
      'div',
      { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' },
      'Loading...'
    );

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
      ? React.createElement(
          'p',
          { className: 'text-gray-500 text-center py-8' },
          'No articles in this category yet.'
        )
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
                { className: 'text-xs text-gray-400 mt-2' },
                'Last updated: ' + formatDate(article.last_updated)
              )
            )
          )
        )
  );
}
