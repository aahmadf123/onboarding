import React from 'react';

export function LoadingSplash() {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
    React.createElement('p', { className: 'text-gray-400 text-sm' }, 'Loading…')
  );
}
