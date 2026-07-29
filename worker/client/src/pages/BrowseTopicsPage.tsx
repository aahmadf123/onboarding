import React from 'react';
import { CategoryIcon } from '../components/Icon';
import type { NavigateFn } from '../lib/types';

interface BrowseTopicsPageProps {
  categories: any[];
  onNavigate: NavigateFn;
}

export function BrowseTopicsPage({ categories, onNavigate }: BrowseTopicsPageProps) {
  return React.createElement(
    'div',
    { className: 'max-w-7xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'h1',
      { className: 'display-title text-2xl text-toledo-blue mb-1' },
      'Browse Topics'
    ),
    React.createElement(
      'p',
      { className: 'text-toledo-slate text-sm mb-6' },
      'Guides and articles for every part of working in Toledo Athletics.'
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger' },
      categories.map(function (cat) {
        return React.createElement(
          'button',
          {
            key: cat.id,
            onClick: function () {
              onNavigate('category', cat.id);
            },
            className:
              'bg-white rounded-2xl border border-toledo-border p-5 text-left hover:shadow-md hover:border-toledo-gold transition-all group',
          },
          React.createElement(
            'div',
            { className: 'flex items-start gap-3' },
            React.createElement(CategoryIcon, { name: cat.name }),
            React.createElement(
              'div',
              null,
              React.createElement(
                'h3',
                {
                  className:
                    'font-semibold text-gray-900 group-hover:text-toledo-blue transition-colors',
                },
                cat.name
              ),
              React.createElement(
                'p',
                { className: 'text-sm text-toledo-slate mt-1' },
                cat.description
              )
            )
          )
        );
      })
    )
  );
}
