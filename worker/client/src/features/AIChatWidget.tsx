import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { authHeaders, clearAuthAndReload, getSessionToken } from '../lib/api';
import { sanitizeHtml } from '../lib/sanitize';
import { EVENTS, on } from '../lib/events';
import { IconSend, IconSparkles, IconX } from '../components/Icon';
import type { User } from '../lib/types';

const STARTER_QUESTIONS = [
  'What do I need to complete this week?',
  'How do I get access to systems?',
  'Who should I contact for compliance?',
  'Where is Savage Arena?',
];

interface ChatMessage {
  role: string;
  content: string;
  sources?: string[];
  streaming?: boolean;
}

/** Part of the widget contract; the chat is scoped server-side by session. */
export function AIChatWidget(_props: { currentUser?: User | null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(
    function () {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [messages]
  );

  // Hero "Ask the Onboarding Assistant" CTA opens the widget via a window event.
  useEffect(function () {
    return on(EVENTS.OPEN_CHAT, function () {
      setOpen(true);
    });
  }, []);

  async function sendMessage(text: string) {
    if (!text || !text.trim() || sending) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = messages.concat([userMsg]);
    setMessages(newMessages);
    setInput('');
    setSending(true);

    // Append empty streaming placeholder
    setMessages((prev) =>
      prev.concat([{ role: 'assistant', content: '', sources: [], streaming: true }])
    );

    try {
      // Raw fetch (not the api() helper) because we need the streaming body;
      // the global auth gate still requires the bearer token here.
      const sessionToken = getSessionToken();
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.status === 401 && sessionToken) {
        clearAuthAndReload();
        return;
      }
      if (!res.ok || !res.body) throw new Error('Stream unavailable');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'sources') {
              const srcs = parsed.sources;
              setMessages((prev) => {
                const updated = prev.slice();
                const last = updated[updated.length - 1];
                if (last && last.streaming)
                  updated[updated.length - 1] = Object.assign({}, last, { sources: srcs });
                return updated;
              });
            } else if (parsed.type === 'token') {
              const tok = parsed.text;
              setMessages((prev) => {
                const updated = prev.slice();
                const last = updated[updated.length - 1];
                if (last && last.streaming)
                  updated[updated.length - 1] = Object.assign({}, last, {
                    content: last.content + tok,
                  });
                return updated;
              });
            }
          } catch {
            /* a partial or malformed frame is skipped rather than killing the stream */
          }
        }
      }

      // Mark streaming complete
      setMessages((prev) => {
        const updated = prev.slice();
        const last = updated[updated.length - 1];
        if (last && last.streaming)
          updated[updated.length - 1] = Object.assign({}, last, { streaming: false });
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = prev.slice();
        const last = updated[updated.length - 1];
        if (last && last.streaming)
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'An error occurred. Please try again.',
            sources: [],
          };
        return updated;
      });
    }

    setSending(false);
  }

  function handleSend() {
    sendMessage(input);
  }

  if (!open) {
    return React.createElement(
      'button',
      {
        onClick: function () {
          setOpen(true);
        },
        'data-tour': 'ai-chat',
        className:
          'fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-toledo-gold text-toledo-blue rounded-full shadow-lg hover:bg-yellow-300 transition-colors font-semibold text-sm z-40',
        title: 'Ask AI Guide',
      },
      React.createElement(IconSparkles),
      React.createElement('span', { className: 'hidden sm:inline' }, 'Ask AI Guide')
    );
  }

  function renderAssistantContent(msg: ChatMessage) {
    if (msg.streaming && !msg.content) {
      return React.createElement(
        'span',
        { className: 'inline-flex gap-1 items-center py-1' },
        React.createElement('span', {
          className: 'w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce',
          style: { animationDelay: '0ms' },
        }),
        React.createElement('span', {
          className: 'w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce',
          style: { animationDelay: '150ms' },
        }),
        React.createElement('span', {
          className: 'w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce',
          style: { animationDelay: '300ms' },
        })
      );
    }
    // Deliberately not lib/markdown's renderMarkdown: chat answers do not run
    // the ::map directive, only article bodies do.
    const html = marked.parse(msg.content || '') as string;
    return React.createElement('div', {
      className: 'prose prose-sm max-w-none chat-md',
      dangerouslySetInnerHTML: { __html: sanitizeHtml(html) },
    });
  }

  return React.createElement(
    'div',
    {
      className:
        'fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-toledo-border flex flex-col z-40 max-w-[calc(100vw-3rem)]',
      style: { maxHeight: '540px' },
    },
    React.createElement(
      'div',
      {
        className:
          'flex items-center justify-between px-4 py-3 bg-toledo-blue navy-texture text-white rounded-t-2xl flex-shrink-0',
      },
      React.createElement(
        'div',
        { className: 'flex items-center gap-2' },
        React.createElement(
          'span',
          { className: 'text-toledo-gold' },
          React.createElement(IconSparkles)
        ),
        React.createElement('span', { className: 'font-semibold text-sm' }, 'Ask Toledo Athletics')
      ),
      React.createElement(
        'div',
        { className: 'flex items-center gap-2' },
        messages.length > 0 &&
          React.createElement(
            'button',
            {
              onClick: function () {
                setMessages([]);
              },
              className:
                'text-blue-200 hover:text-white text-xs px-2 py-0.5 border border-blue-400 rounded-sm',
              title: 'Clear conversation',
            },
            'Clear'
          ),
        React.createElement(
          'button',
          {
            onClick: function () {
              setOpen(false);
            },
            className: 'text-blue-200 hover:text-white',
          },
          React.createElement(IconX)
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'px-3 py-2 bg-yellow-50 border-b text-xs text-yellow-700 flex-shrink-0' },
      'Scoped to Toledo Athletics onboarding topics. Answers use portal context first and list the source sections below each response.'
    ),
    React.createElement(
      'div',
      {
        className: 'flex-1 overflow-y-auto p-4 space-y-3',
        style: { minHeight: '200px', maxHeight: '340px' },
      },
      messages.length === 0 &&
        React.createElement(
          'div',
          { className: 'py-2' },
          React.createElement(
            'p',
            { className: 'text-center text-xs text-gray-400 mb-3' },
            'Try asking:'
          ),
          React.createElement(
            'div',
            { className: 'space-y-2' },
            STARTER_QUESTIONS.map(function (q, i) {
              return React.createElement(
                'button',
                {
                  key: i,
                  onClick: function () {
                    sendMessage(q);
                  },
                  className:
                    'w-full text-left px-3 py-2 rounded-full border border-toledo-border text-xs text-gray-600 hover:bg-toledo-gold/10 hover:border-toledo-gold transition-colors',
                },
                q
              );
            })
          )
        ),
      messages.map(function (msg, i) {
        const isUser = msg.role === 'user';
        return React.createElement(
          'div',
          { key: i, className: 'flex ' + (isUser ? 'justify-end' : 'justify-start') },
          React.createElement(
            'div',
            {
              className:
                'max-w-[85%] px-3 py-2 rounded-lg text-sm ' +
                (isUser ? 'bg-toledo-blue text-white' : 'bg-gray-100 text-gray-800'),
            },
            isUser
              ? React.createElement('p', { className: 'whitespace-pre-wrap' }, msg.content)
              : renderAssistantContent(msg),
            msg.sources &&
              msg.sources.length > 0 &&
              !msg.streaming &&
              React.createElement(
                'div',
                { className: 'mt-2 pt-2 border-t border-gray-200' },
                React.createElement(
                  'p',
                  { className: 'text-xs font-medium mb-1 text-gray-500' },
                  'Sources:'
                ),
                msg.sources.map(function (src, j) {
                  return React.createElement(
                    'p',
                    { key: j, className: 'text-xs text-gray-400' },
                    '• ' + src
                  );
                })
              )
          )
        );
      }),
      React.createElement('div', { ref: messagesEndRef })
    ),
    React.createElement(
      'div',
      { className: 'p-3 border-t flex gap-2 flex-shrink-0' },
      React.createElement('input', {
        type: 'text',
        value: input,
        onChange: function (e: React.ChangeEvent<HTMLInputElement>) {
          setInput(e.target.value);
        },
        onKeyDown: function (e: React.KeyboardEvent<HTMLInputElement>) {
          if (e.key === 'Enter' && !e.shiftKey) handleSend();
        },
        placeholder: 'Ask anything about onboarding...',
        disabled: sending,
        className:
          'flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-toledo-blue disabled:opacity-50',
      }),
      React.createElement(
        'button',
        {
          onClick: handleSend,
          disabled: sending || !input.trim(),
          className:
            'p-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark disabled:opacity-50 transition-colors',
        },
        React.createElement(IconSend)
      )
    )
  );
}
