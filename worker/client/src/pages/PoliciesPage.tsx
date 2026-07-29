import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { IconDocument, IconExternalLink } from '../components/Icon';
import type { NavigateFn } from '../lib/types';

/** onNavigate is part of the page contract but this view has no internal links. */
export function PoliciesPage(_props: { onNavigate: NavigateFn }) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    api('/policies').then(function (r) {
      if (r.success) setPolicies(r.data || []);
      setLoading(false);
    });
  }, []);

  if (loading)
    return React.createElement(
      'div',
      { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' },
      'Loading...'
    );

  return React.createElement(
    'div',
    { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'div',
      { className: 'flex items-center gap-3 mb-1' },
      React.createElement(
        'span',
        {
          className:
            'w-10 h-10 rounded-xl bg-toledo-blue text-toledo-gold flex items-center justify-center flex-shrink-0',
        },
        React.createElement(IconDocument)
      ),
      React.createElement(
        'h1',
        { className: 'display-title text-2xl text-toledo-blue' },
        'Policies & Compliance'
      )
    ),
    React.createElement(
      'p',
      { className: 'text-toledo-slate text-sm mb-6' },
      'The rules, procedures, and compliance documents that govern how Toledo Athletics operates. When in doubt, read the policy first.'
    ),
    policies.length === 0
      ? React.createElement(
          'p',
          { className: 'text-center text-toledo-slate py-8' },
          'No policies available.'
        )
      : React.createElement(
          'div',
          { className: 'space-y-3 stagger' },
          policies.map(function (policy, i) {
            return React.createElement(
              'div',
              {
                key: policy.id || i,
                className:
                  'bg-white rounded-2xl border border-toledo-border p-5 hover:shadow-md transition-shadow',
              },
              React.createElement(
                'div',
                { className: 'flex items-start justify-between gap-4' },
                React.createElement(
                  'div',
                  { className: 'flex-1 min-w-0' },
                  React.createElement(
                    'div',
                    { className: 'flex flex-wrap items-center gap-2 mb-1' },
                    policy.policy_code &&
                      React.createElement(
                        'span',
                        {
                          className:
                            'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm bg-toledo-blue text-white',
                        },
                        policy.policy_code
                      ),
                    policy.category &&
                      React.createElement(
                        'span',
                        {
                          className:
                            'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-toledo-gold/20 text-toledo-blue',
                        },
                        policy.category
                      ),
                    policy.applies_to &&
                      React.createElement(
                        'span',
                        { className: 'text-[11px] text-toledo-slate' },
                        'Applies to: ' + policy.applies_to
                      )
                  ),
                  React.createElement(
                    'h3',
                    { className: 'font-semibold text-gray-900 text-sm' },
                    policy.title
                  ),
                  policy.summary &&
                    React.createElement(
                      'p',
                      { className: 'text-sm text-toledo-slate mt-1 line-clamp-2' },
                      policy.summary
                    )
                ),
                policy.url &&
                  React.createElement(
                    'a',
                    {
                      href: policy.url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className:
                        'flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-toledo-blue border border-toledo-border hover:border-toledo-blue px-3 py-1.5 rounded-lg transition-colors',
                    },
                    'Open policy',
                    React.createElement(IconExternalLink)
                  )
              )
            );
          })
        )
  );
}
