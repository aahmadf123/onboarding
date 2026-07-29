import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';
import { IconArrowLeft } from '../components/Icon';
import type { NavigateFn } from '../lib/types';

interface ArticleViewProps {
  articleId: string | null;
  onNavigate: NavigateFn;
}

export function ArticleView({ articleId, onNavigate }: ArticleViewProps) {
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    api('/articles/' + articleId).then((r) => r.success && setArticle(r.data));
  }, [articleId]);

  if (!article)
    return React.createElement(
      'div',
      { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' },
      'Loading...'
    );

  return React.createElement(
    'div',
    { className: 'max-w-3xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'button',
      {
        onClick: () =>
          article.category_id ? onNavigate('category', article.category_id) : onNavigate('home'),
        className:
          'flex items-center gap-2 text-toledo-blue hover:text-toledo-navy mb-6 text-sm font-medium',
      },
      React.createElement(IconArrowLeft),
      'Back'
    ),
    React.createElement(
      'div',
      { className: 'bg-white rounded-2xl border border-toledo-border shadow-xs' },
      React.createElement(
        'div',
        { className: 'p-6 md:p-8 border-b border-toledo-border' },
        article.category_name &&
          React.createElement(
            'span',
            {
              className:
                'inline-block px-3 py-1 bg-toledo-gold/20 text-toledo-blue text-xs font-semibold rounded-full mb-3',
            },
            article.category_name
          ),
        React.createElement(
          'h1',
          { className: 'text-2xl md:text-3xl font-bold text-toledo-blue' },
          article.title
        ),
        React.createElement(
          'p',
          { className: 'text-sm text-gray-400 mt-2' },
          'Last updated: ' + new Date(article.last_updated).toLocaleDateString()
        )
      ),
      React.createElement('div', {
        className: 'p-6 md:p-8 prose max-w-none',
        dangerouslySetInnerHTML: { __html: renderMarkdown(article.current_content) },
      })
    )
  );
}
