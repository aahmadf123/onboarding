import React from 'react';

interface AuthShellProps {
  children?: React.ReactNode;
  subtitle?: string;
}

export function AuthShell({ children, subtitle }: AuthShellProps) {
  return React.createElement(
    'div',
    { className: 'min-h-screen flex bg-toledo-navy' },
    // Brand panel with the Savage Arena photo (desktop only)
    React.createElement(
      'div',
      { className: 'hidden lg:block relative w-1/2 overflow-hidden' },
      React.createElement('img', {
        src: '/branding/savage-arena.jpg',
        alt: '',
        className: 'absolute inset-0 w-full h-full object-cover',
      }),
      React.createElement('div', {
        className:
          'absolute inset-0 bg-gradient-to-t from-toledo-navy via-toledo-blue/75 to-toledo-blue/35',
      }),
      React.createElement(
        'div',
        { className: 'relative z-10 flex flex-col justify-end h-full p-12 text-white' },
        React.createElement(
          'span',
          {
            className:
              'inline-block w-fit px-3 py-1 bg-toledo-gold text-toledo-blue text-xs font-bold uppercase tracking-[0.2em] rounded-full mb-4',
          },
          'For Toledo'
        ),
        React.createElement(
          'h2',
          { className: 'display-title text-5xl leading-tight' },
          'Built for Rockets'
        ),
        React.createElement(
          'p',
          { className: 'text-blue-200 mt-3 max-w-md text-sm leading-relaxed' },
          'Your first steps, key systems, and people — all in one place.'
        )
      )
    ),
    React.createElement(
      'div',
      {
        className:
          'flex-1 flex items-center justify-center px-4 py-10 bg-gradient-to-br from-toledo-blue via-toledo-navy to-toledo-blue navy-texture',
      },
      React.createElement(
        'div',
        { className: 'bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in' },
        React.createElement(
          'div',
          { className: 'text-center mb-8' },
          React.createElement('img', {
            src: '/branding/Primary_Logo_for_Light_Background.png',
            alt: 'Toledo Athletics',
            className: 'h-16 w-auto mx-auto mb-4',
          }),
          React.createElement(
            'h1',
            { className: 'display-title text-2xl text-toledo-blue' },
            'Toledo Athletics'
          ),
          React.createElement(
            'p',
            { className: 'text-toledo-slate mt-1 text-sm' },
            subtitle || 'Onboarding Portal'
          )
        ),
        children
      )
    )
  );
}

interface AuthInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}

export function AuthInput(props: AuthInputProps) {
  return React.createElement(
    'div',
    null,
    React.createElement(
      'label',
      { className: 'block text-sm font-medium text-gray-700 mb-1' },
      props.label
    ),
    React.createElement('input', {
      type: props.type,
      value: props.value,
      onChange: props.onChange,
      required: true,
      placeholder: props.placeholder || '',
      autoComplete: props.autoComplete,
      className:
        'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-toledo-blue',
    }),
    props.hint && React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, props.hint)
  );
}
