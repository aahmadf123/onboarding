import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// Placeholder while the port lands. Replaced by the real App in the next step.
function Boot() {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
    React.createElement('p', { className: 'text-toledo-blue display-title' }, 'Toledo Athletics')
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(React.createElement(Boot));
