import React from 'react';
import type { NavigateFn } from '../lib/types';

const LINKS = [
  { id: 'guide', label: 'My Onboarding' },
  { id: 'resources', label: 'Systems' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'policies', label: 'Policies' },
];

/**
 * Lives here rather than beside App because AppShell renders it. Keeping it in
 * the app root is what created the shell/feature import cycle in the old build.
 */
export function Footer({ onNavigate }: { onNavigate: NavigateFn }) {
  return React.createElement(
    'footer',
    { className: 'bg-toledo-navy text-white' },
    React.createElement(
      'div',
      { className: 'px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3' },
      React.createElement(
        'div',
        { className: 'flex items-center gap-2' },
        React.createElement('img', {
          src: '/branding/Primary_Logo_for_Dark_Background.png',
          alt: 'Toledo Athletics',
          className: 'h-6 w-auto',
        }),
        React.createElement(
          'p',
          { className: 'text-xs text-blue-300' },
          '© ' + new Date().getFullYear() + ' University of Toledo Athletics'
        )
      ),
      React.createElement(
        'div',
        { className: 'flex flex-wrap items-center justify-center gap-x-4 gap-y-1' },
        LINKS.map(function (item) {
          return React.createElement(
            'button',
            {
              key: item.id,
              onClick: function () {
                onNavigate(item.id);
              },
              className: 'text-xs text-blue-300 hover:text-white transition-colors',
            },
            item.label
          );
        })
      ),
      React.createElement(
        'p',
        { className: 'text-[10px] uppercase tracking-[0.2em] text-toledo-gold' },
        '#TeamToledo'
      )
    )
  );
}
