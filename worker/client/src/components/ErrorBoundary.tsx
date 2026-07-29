import React from 'react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * A throw inside render used to unmount the whole tree and leave a blank page
 * with no way back. Catch it and offer a recovery path instead.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled render error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-gray-50 flex items-center justify-center px-4' },
      React.createElement(
        'div',
        { className: 'bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center' },
        React.createElement(
          'h1',
          { className: 'display-title text-xl text-toledo-blue mb-2' },
          'Something went wrong'
        ),
        React.createElement(
          'p',
          { className: 'text-sm text-gray-600 mb-5' },
          'This page hit an unexpected error. Your progress is saved — reloading usually fixes it.'
        ),
        React.createElement(
          'button',
          {
            onClick: function () {
              window.location.href = '/';
            },
            className:
              'w-full py-3 bg-toledo-gold text-toledo-blue rounded-lg hover:bg-yellow-300 transition-colors font-semibold',
          },
          'Back to the portal'
        )
      )
    );
  }
}
