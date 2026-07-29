import React from 'react';
import { useResource } from '../lib/useResource';
import { renderMarkdown } from '../lib/markdown';
import { formatDate } from '../lib/dates';
import { IconArrowLeft } from '../components/Icon';
import { ErrorState, LoadingState } from '../components/AsyncState';
import type { NavigateFn } from '../lib/types';

interface ArticleViewProps {
  articleId: string | null;
  onNavigate: NavigateFn;
}

export function ArticleView({ articleId, onNavigate }: ArticleViewProps) {
  const {
    data: article,
    error,
    loading,
    reload,
  } = useResource<any>(
    articleId ? '/articles/' + articleId : null,
    'This article may have been removed or is no longer published.'
  );

  if (loading) return React.createElement(LoadingState);

  // A soft-deleted or hidden article legitimately 404s here. That used to
  // render "Loading..." forever, with no explanation and no way back.
  if (error || !article)
    return React.createElement(ErrorState, {
      message: error || 'This article could not be found.',
      onRetry: reload,
      onBack: () => onNavigate('categories'),
      backLabel: 'Browse topics',
    });

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
          { className: 'text-sm text-toledo-slate mt-2' },
          'Last updated: ' + formatDate(article.last_updated)
        )
      ),
      React.createElement('div', {
        className: 'p-6 md:p-8 prose max-w-none',
        dangerouslySetInnerHTML: { __html: renderMarkdown(article.current_content) },
      })
    )
  );
}
