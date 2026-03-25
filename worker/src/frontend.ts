// HTML shell that serves the React SPA from the Worker.
// Toledo branding colors: #003E7E (blue), #FFCE00 (gold), #002855 (dark)

import { getSharedCode } from './frontend/shared';
import { getContentCode } from './frontend/content';

function getIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Toledo Athletics Onboarding</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.26.9/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'toledo-blue': '#003E7E',
            'toledo-gold': '#FFCE00',
            'toledo-dark': '#002855',
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .prose p { margin-bottom: 1rem; line-height: 1.75; }
    .prose a { color: #003E7E; text-decoration: underline; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-gray-50">
  <div id="root"></div>
  <script type="text/babel" data-type="module">
${getSharedCode()}
${getContentCode()}
${getFeatureCode()}
  </script>
</body>
</html>`;
}

function getFeatureCode(): string {
  return `
// ── TipsPage ──────────────────────────────────────────────────────────────────
function TipsPage({ currentUser, onNavigate }) {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackTipId, setFeedbackTipId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);

  useEffect(function () {
    api('/tips').then(function (r) {
      if (r.success) setTips(r.data || []);
      setLoading(false);
    });
  }, []);

  function handleSubmitTip(e) {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    api('/tips', {
      method: 'POST',
      body: JSON.stringify({
        title: title,
        content: content,
        tags: tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
        author_id: currentUser.id,
      }),
    }).then(function (r) {
      setSubmitting(false);
      if (r.success) {
        setSubmitted(true);
        setTitle(''); setContent(''); setTags('');
      }
    });
  }

  function handleFeedback(tipId) {
    if (!feedbackText.trim()) return;
    setFeedbackSending(true);
    api('/tips/' + tipId + '/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback: feedbackText, user_id: currentUser ? currentUser.id : null }),
    }).then(function () {
      setFeedbackSending(false);
      setFeedbackTipId(null);
      setFeedbackText('');
    });
  }

  if (loading) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading tips...');

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2' },
          React.createElement(IconLightbulb), 'Employee Tips'),
        React.createElement('p', { className: 'text-gray-500 text-sm mt-1' }, 'Helpful tips shared by fellow staff members')
      ),
      currentUser && React.createElement('button', {
        onClick: function () { setShowForm(!showForm); setSubmitted(false); },
        className: 'flex items-center gap-1 px-4 py-2 bg-toledo-blue text-white rounded-lg text-sm font-medium hover:bg-toledo-dark transition-colors',
      }, React.createElement(IconPlus), 'Submit a Tip')
    ),

    showForm && React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-6 mb-6' },
      submitted
        ? React.createElement('div', { className: 'text-center py-4' },
            React.createElement('div', { className: 'w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3' }, React.createElement(IconCheck)),
            React.createElement('p', { className: 'font-medium text-gray-900' }, 'Tip submitted for review!'),
            React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, 'It will appear after moderator approval.'),
            React.createElement('button', { onClick: function () { setSubmitted(false); }, className: 'mt-3 text-sm text-toledo-blue hover:underline' }, 'Submit another')
          )
        : React.createElement('form', { onSubmit: handleSubmitTip, className: 'space-y-4' },
            React.createElement('h3', { className: 'font-semibold text-gray-900' }, 'Share a Tip'),
            React.createElement('input', {
              type: 'text', value: title, onChange: function (e) { setTitle(e.target.value); }, required: true,
              placeholder: 'Tip title',
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm',
            }),
            React.createElement('textarea', {
              value: content, onChange: function (e) { setContent(e.target.value); }, required: true, rows: 4,
              placeholder: 'Describe your tip in detail...',
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm resize-y',
            }),
            React.createElement('input', {
              type: 'text', value: tags, onChange: function (e) { setTags(e.target.value); },
              placeholder: 'Tags (comma-separated, e.g. parking, IT, HR)',
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm',
            }),
            React.createElement('button', {
              type: 'submit', disabled: submitting,
              className: 'px-6 py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark text-sm font-medium disabled:opacity-50',
            }, submitting ? 'Submitting...' : 'Submit Tip')
          )
    ),

    tips.length === 0
      ? React.createElement('div', { className: 'text-center py-12 text-gray-400' }, 'No tips yet. Be the first to share!')
      : React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          tips.map(function (tip) {
            return React.createElement('div', { key: tip.id, className: 'bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow' },
              React.createElement('h3', { className: 'font-semibold text-gray-900 mb-2' }, tip.title),
              React.createElement('p', { className: 'text-sm text-gray-600 mb-3 line-clamp-4' }, tip.content),
              tip.tags && tip.tags.length > 0 && React.createElement('div', { className: 'flex flex-wrap gap-1 mb-3' },
                tip.tags.map(function (tag, i) {
                  return React.createElement('span', { key: i, className: 'px-2 py-0.5 bg-toledo-blue/10 text-toledo-blue text-xs rounded-full' }, tag);
                })
              ),
              React.createElement('div', { className: 'flex items-center justify-between text-xs text-gray-400' },
                React.createElement('span', null, 'By ' + (tip.author_email || 'Anonymous')),
                React.createElement('span', null, tip.submitted_at ? new Date(tip.submitted_at).toLocaleDateString() : '')
              ),
              React.createElement('div', { className: 'mt-3 pt-3 border-t border-gray-100 flex items-center gap-2' },
                feedbackTipId === tip.id
                  ? React.createElement('div', { className: 'flex-1 flex gap-2' },
                      React.createElement('input', {
                        type: 'text', value: feedbackText,
                        onChange: function (e) { setFeedbackText(e.target.value); },
                        placeholder: 'Your feedback...',
                        className: 'flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-toledo-blue',
                      }),
                      React.createElement('button', {
                        onClick: function () { handleFeedback(tip.id); }, disabled: feedbackSending,
                        className: 'px-3 py-1.5 bg-toledo-blue text-white rounded-lg text-xs disabled:opacity-50',
                      }, 'Send'),
                      React.createElement('button', {
                        onClick: function () { setFeedbackTipId(null); setFeedbackText(''); },
                        className: 'px-2 py-1.5 text-gray-400 hover:text-gray-600 text-xs',
                      }, 'Cancel')
                    )
                  : React.createElement('button', {
                      onClick: function () { setFeedbackTipId(tip.id); },
                      className: 'flex items-center gap-1 text-xs text-gray-400 hover:text-toledo-blue transition-colors',
                    }, React.createElement(IconFlag), 'Feedback')
              )
            );
          })
        )
  );
}

// ── OrgChartPage ──────────────────────────────────────────────────────────────
function OrgChartNode({ node, depth }) {
  var _useState = useState(depth < 1);
  var expanded = _useState[0];
  var setExpanded = _useState[1];
  var _useState2 = useState(false);
  var showDetails = _useState2[0];
  var setShowDetails = _useState2[1];

  var hasChildren = node.children && node.children.length > 0;

  return React.createElement('div', { className: 'ml-' + Math.min(depth * 4, 16) + ' mb-1' },
    React.createElement('div', { className: 'flex items-center gap-1' },
      hasChildren && React.createElement('button', {
        onClick: function () { setExpanded(!expanded); },
        className: 'p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0',
      }, expanded ? React.createElement(IconChevronDown) : React.createElement(IconChevronRight)),
      !hasChildren && React.createElement('div', { className: 'w-5' }),
      React.createElement('button', {
        onClick: function () { setShowDetails(!showDetails); },
        className: 'flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-toledo-blue/5 transition-colors flex-1 min-w-0',
      },
        React.createElement('div', { className: 'w-8 h-8 bg-toledo-blue/10 text-toledo-blue rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0' },
          node.name ? node.name.charAt(0).toUpperCase() : '?'
        ),
        React.createElement('div', { className: 'min-w-0' },
          React.createElement('p', { className: 'font-medium text-gray-900 text-sm truncate' }, node.name),
          React.createElement('p', { className: 'text-xs text-gray-500 truncate' }, node.title || node.department || '')
        )
      )
    ),
    showDetails && React.createElement('div', { className: 'ml-10 mt-1 mb-2 bg-white rounded-lg border border-gray-200 p-4 shadow-sm' },
      React.createElement('p', { className: 'font-semibold text-gray-900 text-sm' }, node.name),
      node.title && React.createElement('p', { className: 'text-sm text-gray-600' }, node.title),
      node.department && React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, 'Department: ' + node.department),
      node.email && React.createElement('p', { className: 'text-xs text-gray-500' }, 'Email: ' + node.email),
      node.phone && React.createElement('p', { className: 'text-xs text-gray-500' }, 'Phone: ' + node.phone)
    ),
    expanded && hasChildren && React.createElement('div', { className: 'mt-1' },
      node.children.map(function (child, i) {
        return React.createElement(OrgChartNode, { key: child.id || i, node: child, depth: depth + 1 });
      })
    )
  );
}

function OrgChartPage({ onNavigate }) {
  var _useState = useState(null);
  var data = _useState[0];
  var setData = _useState[1];
  var _useState2 = useState(true);
  var loading = _useState2[0];
  var setLoading = _useState2[1];

  useEffect(function () {
    api('/orgchart').then(function (r) {
      if (r.success) setData(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading org chart...');

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
      React.createElement(IconUsers), 'Organizational Chart'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Click a name to view details. Click the arrow to expand/collapse.'),
    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto' },
      data
        ? (Array.isArray(data)
            ? data.map(function (node, i) { return React.createElement(OrgChartNode, { key: node.id || i, node: node, depth: 0 }); })
            : React.createElement(OrgChartNode, { node: data, depth: 0 })
          )
        : React.createElement('p', { className: 'text-gray-400 text-center py-8' }, 'No organizational data available.')
    )
  );
}

// ── AIChatWidget ──────────────────────────────────────────────────────────────
function AIChatWidget({ currentUser }) {
  var _useState = useState(false);
  var open = _useState[0];
  var setOpen = _useState[1];
  var _useState2 = useState([]);
  var messages = _useState2[0];
  var setMessages = _useState2[1];
  var _useState3 = useState('');
  var input = _useState3[0];
  var setInput = _useState3[1];
  var _useState4 = useState(false);
  var sending = _useState4[0];
  var setSending = _useState4[1];
  var messagesEndRef = useRef(null);

  useEffect(function () {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  function handleSend() {
    if (!input.trim() || sending) return;
    var userMsg = { role: 'user', content: input.trim() };
    var newMessages = messages.concat([userMsg]);
    setMessages(newMessages);
    setInput('');
    setSending(true);
    api('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages.map(function (m) { return { role: m.role, content: m.content }; }) }),
    }).then(function (r) {
      setSending(false);
      if (r.success && r.data) {
        setMessages(function (prev) {
          return prev.concat([{ role: 'assistant', content: r.data.reply, sources: r.data.sources }]);
        });
      } else {
        setMessages(function (prev) {
          return prev.concat([{ role: 'assistant', content: 'Sorry, I could not process your request. Please try again.' }]);
        });
      }
    }).catch(function () {
      setSending(false);
      setMessages(function (prev) {
        return prev.concat([{ role: 'assistant', content: 'An error occurred. Please try again.' }]);
      });
    });
  }

  if (!open) {
    return React.createElement('button', {
      onClick: function () { setOpen(true); },
      className: 'fixed bottom-6 right-6 w-14 h-14 bg-toledo-blue text-white rounded-full shadow-lg hover:bg-toledo-dark transition-colors flex items-center justify-center z-50',
      title: 'AI Assistant',
    }, React.createElement(IconMessageCircle));
  }

  return React.createElement('div', { className: 'fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50', style: { maxHeight: '500px' } },
    React.createElement('div', { className: 'flex items-center justify-between px-4 py-3 bg-toledo-blue text-white rounded-t-xl' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(IconSparkles),
        React.createElement('span', { className: 'font-semibold text-sm' }, 'AI Assistant')
      ),
      React.createElement('button', { onClick: function () { setOpen(false); }, className: 'text-blue-200 hover:text-white' },
        React.createElement(IconX))
    ),
    React.createElement('div', { className: 'p-3 bg-yellow-50 border-b text-xs text-yellow-700' },
      'This AI assistant is scoped to Toledo Athletics onboarding topics. Responses are AI-generated and may not be fully accurate.'),
    React.createElement('div', { className: 'flex-1 overflow-y-auto p-4 space-y-3', style: { minHeight: '200px', maxHeight: '320px' } },
      messages.length === 0 && React.createElement('p', { className: 'text-center text-gray-400 text-sm py-8' }, 'Ask me anything about onboarding!'),
      messages.map(function (msg, i) {
        var isUser = msg.role === 'user';
        return React.createElement('div', { key: i, className: 'flex ' + (isUser ? 'justify-end' : 'justify-start') },
          React.createElement('div', { className: 'max-w-[80%] px-3 py-2 rounded-lg text-sm ' + (isUser ? 'bg-toledo-blue text-white' : 'bg-gray-100 text-gray-800') },
            React.createElement('p', { className: 'whitespace-pre-wrap' }, msg.content),
            msg.sources && msg.sources.length > 0 && React.createElement('div', { className: 'mt-2 pt-2 border-t ' + (isUser ? 'border-blue-400' : 'border-gray-200') },
              React.createElement('p', { className: 'text-xs font-medium mb-1 ' + (isUser ? 'text-blue-200' : 'text-gray-500') }, 'Sources:'),
              msg.sources.map(function (src, j) {
                return React.createElement('p', { key: j, className: 'text-xs ' + (isUser ? 'text-blue-200' : 'text-gray-500') }, '• ' + src);
              })
            )
          )
        );
      }),
      sending && React.createElement('div', { className: 'flex justify-start' },
        React.createElement('div', { className: 'bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-sm' }, 'Thinking...')
      ),
      React.createElement('div', { ref: messagesEndRef })
    ),
    React.createElement('div', { className: 'p-3 border-t flex gap-2' },
      React.createElement('input', {
        type: 'text', value: input,
        onChange: function (e) { setInput(e.target.value); },
        onKeyDown: function (e) { if (e.key === 'Enter') handleSend(); },
        placeholder: 'Type a message...',
        className: 'flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue',
      }),
      React.createElement('button', {
        onClick: handleSend, disabled: sending || !input.trim(),
        className: 'p-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark disabled:opacity-50 transition-colors',
      }, React.createElement(IconSend))
    )
  );
}

// ── AIHubPage ─────────────────────────────────────────────────────────────────
function AIHubPage({ currentUser, onNavigate }) {
  var _useState = useState(null);
  var selectedRole = _useState[0];
  var setSelectedRole = _useState[1];
  var _useState2 = useState(null);
  var currentQuestion = _useState2[0];
  var setCurrentQuestion = _useState2[1];
  var _useState3 = useState([]);
  var sessionQuestions = _useState3[0];
  var setSessionQuestions = _useState3[1];
  var _useState4 = useState([]);
  var sessionAnswers = _useState4[0];
  var setSessionAnswers = _useState4[1];
  var _useState5 = useState('');
  var answer = _useState5[0];
  var setAnswer = _useState5[1];
  var _useState6 = useState(false);
  var loading = _useState6[0];
  var setLoading = _useState6[1];
  var _useState7 = useState(null);
  var evaluation = _useState7[0];
  var setEvaluation = _useState7[1];
  var _useState8 = useState(null);
  var pastResults = _useState8[0];
  var setPastResults = _useState8[1];
  var _useState9 = useState(false);
  var showPast = _useState9[0];
  var setShowPast = _useState9[1];

  useEffect(function () {
    if (currentUser) {
      api('/ai/assessment/results/' + currentUser.id).then(function (r) {
        if (r.success && r.data) setPastResults(r.data);
      });
    }
  }, [currentUser]);

  function startAssessment(role) {
    setSelectedRole(role);
    setLoading(true);
    setEvaluation(null);
    setSessionQuestions([]);
    setSessionAnswers([]);
    api('/ai/assessment/start', {
      method: 'POST',
      body: JSON.stringify({ role_archetype: role }),
    }).then(function (r) {
      setLoading(false);
      if (r.success && r.data) {
        setCurrentQuestion(r.data.question);
        setSessionQuestions(r.data.session_questions || []);
        setSessionAnswers(r.data.session_answers || []);
      }
    });
  }

  function submitAnswer() {
    if (!answer.trim()) return;
    setLoading(true);
    api('/ai/assessment/answer', {
      method: 'POST',
      body: JSON.stringify({
        role_archetype: selectedRole,
        question: currentQuestion,
        answer: answer.trim(),
        session_questions: sessionQuestions,
        session_answers: sessionAnswers,
      }),
    }).then(function (r) {
      setLoading(false);
      setAnswer('');
      if (r.success && r.data) {
        if (r.data.evaluation) {
          setEvaluation(r.data.evaluation);
          setCurrentQuestion(null);
          if (currentUser) {
            api('/ai/assessment/save', {
              method: 'POST',
              body: JSON.stringify({
                user_id: currentUser.id,
                role_archetype: selectedRole,
                evaluation: r.data.evaluation,
              }),
            });
          }
        } else {
          setCurrentQuestion(r.data.question);
          setSessionQuestions(r.data.session_questions || sessionQuestions);
          setSessionAnswers(r.data.session_answers || sessionAnswers);
        }
      }
    });
  }

  // Role selection screen
  if (!selectedRole && !showPast) {
    return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
      React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
        React.createElement(IconArrowLeft), 'Back to Home'),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
        React.createElement(IconSparkles), 'AI Literacy Assessment'),
      React.createElement('p', { className: 'text-gray-500 text-sm mb-2' }, 'Assess your AI literacy to identify growth areas and get personalized resources.'),
      React.createElement('div', { className: 'bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-yellow-800' },
        '⚠️ This assessment is for self-development purposes only, not for HR evaluation. Results are private and meant to guide your learning.'),
      pastResults && React.createElement('button', {
        onClick: function () { setShowPast(true); },
        className: 'mb-6 text-sm text-toledo-blue hover:underline',
      }, '📊 View Past Results'),
      React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Select Your Role'),
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
        ROLE_ARCHETYPES.map(function (role) {
          return React.createElement('button', {
            key: role.id,
            onClick: function () { startAssessment(role.id); },
            className: 'bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all group',
          },
            React.createElement('h3', { className: 'font-semibold text-gray-900 group-hover:text-toledo-blue transition-colors mb-1' }, role.label),
            React.createElement('p', { className: 'text-sm text-gray-500' }, role.desc)
          );
        })
      )
    );
  }

  // Past results screen
  if (showPast) {
    return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
      React.createElement('button', { onClick: function () { setShowPast(false); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
        React.createElement(IconArrowLeft), 'Back to Assessment'),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-6' }, 'Past Assessment Results'),
      pastResults && Array.isArray(pastResults) && pastResults.length > 0
        ? React.createElement('div', { className: 'space-y-4' },
            pastResults.map(function (result, i) {
              return React.createElement('div', { key: i, className: 'bg-white rounded-xl border border-gray-200 p-5' },
                React.createElement('div', { className: 'flex items-center justify-between mb-3' },
                  React.createElement('h3', { className: 'font-semibold text-gray-900' }, result.role_archetype || 'Assessment'),
                  result.created_at && React.createElement('span', { className: 'text-xs text-gray-400' }, new Date(result.created_at).toLocaleDateString())
                ),
                result.evaluation && React.createElement('div', null,
                  result.evaluation.level && React.createElement('p', { className: 'text-sm mb-2' },
                    React.createElement('span', { className: 'font-medium text-gray-700' }, 'Level: '),
                    React.createElement('span', { className: 'text-toledo-blue font-semibold' }, result.evaluation.level)
                  ),
                  result.evaluation.gaps && result.evaluation.gaps.length > 0 && React.createElement('div', { className: 'mb-2' },
                    React.createElement('p', { className: 'text-sm font-medium text-gray-700 mb-1' }, 'Areas for Growth:'),
                    React.createElement('ul', { className: 'list-disc list-inside text-sm text-gray-600' },
                      result.evaluation.gaps.map(function (gap, j) { return React.createElement('li', { key: j }, gap); })
                    )
                  )
                )
              );
            })
          )
        : React.createElement('p', { className: 'text-gray-400 text-center py-8' }, 'No past results found.')
    );
  }

  // Evaluation results
  if (evaluation) {
    return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
      React.createElement('button', { onClick: function () { setSelectedRole(null); setEvaluation(null); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
        React.createElement(IconArrowLeft), 'Take Another Assessment'),
      React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-6' },
        React.createElement('h2', { className: 'text-xl font-bold text-gray-900 mb-4 flex items-center gap-2' },
          React.createElement(IconCheckCircle), 'Assessment Complete'),
        evaluation.level && React.createElement('div', { className: 'mb-4 p-4 bg-toledo-blue/5 rounded-lg' },
          React.createElement('p', { className: 'text-sm text-gray-600' }, 'Your AI Literacy Level:'),
          React.createElement('p', { className: 'text-2xl font-bold text-toledo-blue mt-1' }, evaluation.level)
        ),
        evaluation.gaps && evaluation.gaps.length > 0 && React.createElement('div', { className: 'mb-4' },
          React.createElement('h3', { className: 'font-semibold text-gray-900 mb-2' }, 'Skill Gaps Identified'),
          React.createElement('ul', { className: 'space-y-1' },
            evaluation.gaps.map(function (gap, i) {
              return React.createElement('li', { key: i, className: 'flex items-start gap-2 text-sm text-gray-600' },
                React.createElement('span', { className: 'text-orange-500 mt-0.5' }, '•'), gap);
            })
          )
        ),
        evaluation.videoRecs && evaluation.videoRecs.length > 0 && React.createElement('div', null,
          React.createElement('h3', { className: 'font-semibold text-gray-900 mb-2' }, 'Recommended Videos'),
          React.createElement('div', { className: 'space-y-2' },
            evaluation.videoRecs.map(function (vid, i) {
              return React.createElement('div', { key: i, className: 'flex items-center gap-2 p-2 bg-gray-50 rounded-lg' },
                React.createElement(IconPlay),
                React.createElement('span', { className: 'text-sm text-gray-700' }, typeof vid === 'string' ? vid : vid.title || vid)
              );
            })
          )
        )
      )
    );
  }

  // Assessment question flow
  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { setSelectedRole(null); setCurrentQuestion(null); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Cancel Assessment'),
    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-6' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
        React.createElement(IconSparkles),
        React.createElement('h2', { className: 'font-semibold text-gray-900' }, 'AI Literacy Assessment'),
        React.createElement('span', { className: 'ml-auto px-2 py-0.5 bg-toledo-blue/10 text-toledo-blue text-xs rounded-full' }, selectedRole)
      ),
      loading
        ? React.createElement('div', { className: 'text-center py-8 text-gray-500' }, 'Loading question...')
        : React.createElement('div', null,
            currentQuestion && React.createElement('div', { className: 'mb-4 p-4 bg-gray-50 rounded-lg' },
              React.createElement('p', { className: 'text-sm text-gray-700' }, currentQuestion)
            ),
            React.createElement('textarea', {
              value: answer, onChange: function (e) { setAnswer(e.target.value); },
              placeholder: 'Type your answer here...',
              rows: 4,
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm resize-y',
            }),
            React.createElement('button', {
              onClick: submitAnswer, disabled: !answer.trim() || loading,
              className: 'mt-3 w-full py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark text-sm font-medium disabled:opacity-50',
            }, 'Submit Answer')
          ),
      React.createElement('p', { className: 'mt-4 text-xs text-gray-400 text-center' },
        'Questions answered: ' + sessionAnswers.length)
    )
  );
}

// ── YouTubeFinderPage ─────────────────────────────────────────────────────────
function YouTubeFinderPage({ currentUser, onNavigate }) {
  var _useState = useState('search');
  var tab = _useState[0];
  var setTab = _useState[1];
  var _useState2 = useState('');
  var query = _useState2[0];
  var setQuery = _useState2[1];
  var _useState3 = useState([]);
  var videos = _useState3[0];
  var setVideos = _useState3[1];
  var _useState4 = useState(false);
  var searching = _useState4[0];
  var setSearching = _useState4[1];
  var _useState5 = useState([]);
  var plan = _useState5[0];
  var setPlan = _useState5[1];
  var _useState6 = useState(false);
  var loadingPlan = _useState6[0];
  var setLoadingPlan = _useState6[1];
  var _useState7 = useState([]);
  var sources = _useState7[0];
  var setSources = _useState7[1];
  var _useState8 = useState(null);
  var addedId = _useState8[0];
  var setAddedId = _useState8[1];
  var isMod = currentUser && (currentUser.role === 'moderator' || currentUser.role === 'admin');

  useEffect(function () {
    if (currentUser && tab === 'plan') {
      setLoadingPlan(true);
      api('/youtube/plan?user_id=' + currentUser.id).then(function (r) {
        if (r.success) setPlan(r.data || []);
        setLoadingPlan(false);
      });
    }
  }, [tab, currentUser]);

  useEffect(function () {
    if (tab === 'sources') {
      api('/youtube/sources').then(function (r) {
        if (r.success) setSources(r.data || []);
      });
    }
  }, [tab]);

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    api('/youtube/search?q=' + encodeURIComponent(query.trim())).then(function (r) {
      setSearching(false);
      if (r.success && r.data) setVideos(r.data.videos || []);
      else setVideos([]);
    });
  }

  function addToPlan(video) {
    api('/youtube/plan', {
      method: 'POST',
      body: JSON.stringify({
        user_id: currentUser.id,
        youtube_video_id: video.id || video.youtube_video_id,
        video_title: video.title,
        video_channel: video.channel,
        video_duration: video.duration,
        category: video.category || 'General',
        source: video.source || video.channel,
      }),
    }).then(function (r) {
      if (r.success) setAddedId(video.id || video.youtube_video_id);
    });
  }

  function toggleComplete(planItem) {
    api('/youtube/plan/' + planItem.id + '/complete', { method: 'PUT' }).then(function (r) {
      if (r.success) {
        setPlan(function (prev) {
          return prev.map(function (p) {
            return p.id === planItem.id ? Object.assign({}, p, { completed: !p.completed }) : p;
          });
        });
      }
    });
  }

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
      React.createElement(IconVideo), 'Video Learning'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Find training videos and build your learning plan.'),

    React.createElement('div', { className: 'flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit' },
      [
        { id: 'search', label: 'Search Videos' },
        { id: 'plan', label: 'My Learning Plan' },
      ].concat(isMod ? [{ id: 'sources', label: 'Sources' }] : []).map(function (t) {
        return React.createElement('button', {
          key: t.id,
          onClick: function () { setTab(t.id); },
          className: 'px-4 py-1.5 rounded-md text-sm font-medium transition-colors ' + (tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'),
        }, t.label);
      })
    ),

    tab === 'search' && React.createElement('div', null,
      React.createElement('form', { onSubmit: handleSearch, className: 'flex gap-2 mb-6' },
        React.createElement('input', {
          type: 'text', value: query, onChange: function (e) { setQuery(e.target.value); },
          placeholder: 'Search for training videos...',
          className: 'flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toledo-blue text-sm',
        }),
        React.createElement('button', {
          type: 'submit', disabled: searching,
          className: 'px-6 py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark text-sm font-medium disabled:opacity-50',
        }, searching ? 'Searching...' : 'Search')
      ),
      videos.length > 0 && React.createElement('div', { className: 'space-y-3' },
        videos.map(function (video) {
          var videoId = video.id || video.youtube_video_id;
          return React.createElement('div', { key: videoId, className: 'bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start' },
            video.thumbnail && React.createElement('img', {
              src: video.thumbnail, alt: video.title,
              className: 'w-32 h-20 object-cover rounded-lg flex-shrink-0 hidden sm:block',
            }),
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('h3', { className: 'font-semibold text-gray-900 text-sm' }, video.title),
              React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, video.channel),
              video.duration && React.createElement('span', { className: 'text-xs text-gray-400' }, video.duration),
              React.createElement('div', { className: 'mt-2 flex gap-2' },
                React.createElement('a', {
                  href: 'https://www.youtube.com/watch?v=' + videoId,
                  target: '_blank', rel: 'noopener noreferrer',
                  className: 'flex items-center gap-1 text-xs text-toledo-blue hover:underline',
                }, React.createElement(IconExternalLink), 'Watch on YouTube'),
                currentUser && (addedId === videoId
                  ? React.createElement('span', { className: 'flex items-center gap-1 text-xs text-green-600' }, React.createElement(IconCheck), 'Added!')
                  : React.createElement('button', {
                      onClick: function () { addToPlan(video); },
                      className: 'flex items-center gap-1 text-xs text-toledo-blue hover:underline',
                    }, React.createElement(IconBookmark), 'Add to My Plan')
                )
              )
            )
          );
        })
      ),
      videos.length === 0 && !searching && query && React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'No videos found. Try a different search term.')
    ),

    tab === 'plan' && React.createElement('div', null,
      loadingPlan
        ? React.createElement('p', { className: 'text-center text-gray-500 py-8' }, 'Loading your learning plan...')
        : plan.length === 0
          ? React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'Your learning plan is empty. Search for videos to add them.')
          : React.createElement('div', { className: 'space-y-3' },
              plan.map(function (item) {
                return React.createElement('div', { key: item.id, className: 'bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 ' + (item.completed ? 'opacity-60' : '') },
                  React.createElement('button', {
                    onClick: function () { toggleComplete(item); },
                    className: 'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ' + (item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-toledo-blue'),
                  }, item.completed && React.createElement(IconCheck)),
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('h3', { className: 'font-medium text-gray-900 text-sm ' + (item.completed ? 'line-through' : '') }, item.video_title),
                    React.createElement('p', { className: 'text-xs text-gray-500' }, (item.video_channel || '') + (item.video_duration ? ' • ' + item.video_duration : ''))
                  ),
                  React.createElement('a', {
                    href: 'https://www.youtube.com/watch?v=' + item.youtube_video_id,
                    target: '_blank', rel: 'noopener noreferrer',
                    className: 'text-toledo-blue hover:text-toledo-dark flex-shrink-0',
                  }, React.createElement(IconExternalLink))
                );
              })
            )
    ),

    tab === 'sources' && React.createElement('div', null,
      React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Approved Video Sources'),
      sources.length === 0
        ? React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'No approved sources configured.')
        : React.createElement('div', { className: 'space-y-2' },
            sources.map(function (src, i) {
              return React.createElement('div', { key: i, className: 'bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3' },
                React.createElement(IconPlay),
                React.createElement('div', null,
                  React.createElement('p', { className: 'font-medium text-sm text-gray-900' }, src.name || src.channel_name || src.title),
                  src.url && React.createElement('a', { href: src.url, target: '_blank', rel: 'noopener noreferrer', className: 'text-xs text-toledo-blue hover:underline' }, src.url)
                )
              );
            })
          )
    )
  );
}

// ── QuickLinksPage ────────────────────────────────────────────────────────────
function QuickLinksPage({ onNavigate }) {
  var _useState = useState([]);
  var links = _useState[0];
  var setLinks = _useState[1];
  var _useState2 = useState(true);
  var loading = _useState2[0];
  var setLoading = _useState2[1];

  useEffect(function () {
    api('/quicklinks').then(function (r) {
      if (r.success) setLinks(r.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
      React.createElement(IconLink), 'Quick Links'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Frequently used resources and links.'),
    links.length === 0
      ? React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'No quick links available.')
      : React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
          links.map(function (link, i) {
            return React.createElement('a', {
              key: link.id || i,
              href: link.url,
              target: '_blank', rel: 'noopener noreferrer',
              className: 'bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-toledo-blue/30 transition-all group block',
            },
              React.createElement('div', { className: 'flex items-start justify-between mb-2' },
                React.createElement('h3', { className: 'font-semibold text-gray-900 group-hover:text-toledo-blue transition-colors text-sm' }, link.title),
                React.createElement(IconExternalLink)
              ),
              link.description && React.createElement('p', { className: 'text-sm text-gray-500 mb-3 line-clamp-2' }, link.description),
              link.category && React.createElement('span', { className: 'inline-block px-2 py-0.5 bg-toledo-blue/10 text-toledo-blue text-xs rounded-full' }, link.category)
            );
          })
        )
  );
}

// ── ContactsPage ──────────────────────────────────────────────────────────────
function ContactsPage({ onNavigate }) {
  var _useState = useState([]);
  var contacts = _useState[0];
  var setContacts = _useState[1];
  var _useState2 = useState(true);
  var loading = _useState2[0];
  var setLoading = _useState2[1];

  useEffect(function () {
    api('/contacts').then(function (r) {
      if (r.success) setContacts(r.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
      React.createElement(IconUsers), 'Key Contacts'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Important contacts across the department.'),
    contacts.length === 0
      ? React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'No contacts available.')
      : React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          contacts.map(function (contact, i) {
            return React.createElement('div', { key: contact.id || i, className: 'bg-white rounded-xl border border-gray-200 p-5' },
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('div', { className: 'w-10 h-10 bg-toledo-blue/10 text-toledo-blue rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0' },
                  contact.contact_name ? contact.contact_name.charAt(0).toUpperCase() : '?'
                ),
                React.createElement('div', { className: 'min-w-0' },
                  React.createElement('h3', { className: 'font-semibold text-gray-900 text-sm' }, contact.contact_name),
                  contact.title && React.createElement('p', { className: 'text-xs text-gray-500' }, contact.title),
                  contact.department && React.createElement('p', { className: 'text-xs text-gray-400' }, contact.department),
                  contact.function_area && React.createElement('span', { className: 'inline-block mt-1 px-2 py-0.5 bg-toledo-blue/10 text-toledo-blue text-xs rounded-full' }, contact.function_area)
                )
              ),
              React.createElement('div', { className: 'mt-3 pt-3 border-t border-gray-100 space-y-1' },
                contact.email && React.createElement('p', { className: 'text-xs text-gray-600 flex items-center gap-1' },
                  '✉️ ',
                  React.createElement('a', { href: 'mailto:' + contact.email, className: 'text-toledo-blue hover:underline' }, contact.email)
                ),
                contact.phone && React.createElement('p', { className: 'text-xs text-gray-600' }, '📞 ' + contact.phone)
              )
            );
          })
        )
  );
}

// ── PoliciesPage ──────────────────────────────────────────────────────────────
function PoliciesPage({ onNavigate }) {
  var _useState = useState([]);
  var policies = _useState[0];
  var setPolicies = _useState[1];
  var _useState2 = useState(true);
  var loading = _useState2[0];
  var setLoading = _useState2[1];

  useEffect(function () {
    api('/policies').then(function (r) {
      if (r.success) setPolicies(r.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
      React.createElement(IconDocument), 'Policies & Procedures'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Important policies and compliance documents.'),
    policies.length === 0
      ? React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'No policies available.')
      : React.createElement('div', { className: 'space-y-3' },
          policies.map(function (policy, i) {
            return React.createElement('div', { key: policy.id || i, className: 'bg-white rounded-xl border border-gray-200 p-5' },
              React.createElement('div', { className: 'flex items-start justify-between' },
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('div', { className: 'flex items-center gap-2 mb-1 flex-wrap' },
                    policy.policy_code && React.createElement('span', { className: 'px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-mono' }, policy.policy_code),
                    policy.category && React.createElement('span', { className: 'px-2 py-0.5 bg-toledo-blue/10 text-toledo-blue text-xs rounded-full' }, policy.category)
                  ),
                  React.createElement('h3', { className: 'font-semibold text-gray-900 text-sm mt-1' }, policy.title),
                  policy.summary && React.createElement('p', { className: 'text-sm text-gray-500 mt-1 line-clamp-2' }, policy.summary)
                ),
                policy.url && React.createElement('a', {
                  href: policy.url, target: '_blank', rel: 'noopener noreferrer',
                  className: 'text-toledo-blue hover:text-toledo-dark flex-shrink-0 ml-3',
                }, React.createElement(IconExternalLink))
              )
            );
          })
        )
  );
}

// ── SystemsPage ───────────────────────────────────────────────────────────────
function SystemsPage({ onNavigate }) {
  var _useState = useState([]);
  var systems = _useState[0];
  var setSystems = _useState[1];
  var _useState2 = useState(true);
  var loading = _useState2[0];
  var setLoading = _useState2[1];

  useEffect(function () {
    api('/systems').then(function (r) {
      if (r.success) setSystems(r.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
      React.createElement(IconServer), 'Systems Directory'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Access information for department systems and tools.'),
    systems.length === 0
      ? React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'No systems available.')
      : React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          systems.map(function (sys, i) {
            return React.createElement('div', { key: sys.id || i, className: 'bg-white rounded-xl border border-gray-200 p-5' },
              React.createElement('div', { className: 'flex items-start justify-between mb-2' },
                React.createElement('h3', { className: 'font-semibold text-gray-900 text-sm' }, sys.system_name),
                sys.category && React.createElement('span', { className: 'px-2 py-0.5 bg-toledo-blue/10 text-toledo-blue text-xs rounded-full flex-shrink-0' }, sys.category)
              ),
              sys.description && React.createElement('p', { className: 'text-sm text-gray-500 mb-3 line-clamp-2' }, sys.description),
              sys.login_notes && React.createElement('div', { className: 'bg-yellow-50 rounded-lg p-2 mb-3' },
                React.createElement('p', { className: 'text-xs text-yellow-700' }, '💡 ' + sys.login_notes)
              ),
              sys.access_url && React.createElement('a', {
                href: sys.access_url, target: '_blank', rel: 'noopener noreferrer',
                className: 'flex items-center gap-1 text-sm text-toledo-blue hover:underline',
              }, React.createElement(IconExternalLink), 'Access System')
            );
          })
        )
  );
}

// ── FeedbackButton ────────────────────────────────────────────────────────────
function FeedbackButton({ currentUser }) {
  var _useState = useState(false);
  var showModal = _useState[0];
  var setShowModal = _useState[1];
  var _useState2 = useState('');
  var feedback = _useState2[0];
  var setFeedback = _useState2[1];
  var _useState3 = useState(false);
  var sent = _useState3[0];
  var setSent = _useState3[1];

  function handleSubmit() {
    if (!feedback.trim()) return;
    api('/tips/0/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback: feedback, user_id: currentUser ? currentUser.id : null, type: 'page_issue' }),
    }).then(function () {
      setSent(true);
      setTimeout(function () { setShowModal(false); setSent(false); setFeedback(''); }, 2000);
    });
  }

  return React.createElement('div', { className: 'inline-block' },
    React.createElement('button', {
      onClick: function () { setShowModal(true); setSent(false); },
      className: 'flex items-center gap-1 text-xs text-gray-400 hover:text-toledo-blue transition-colors',
    }, React.createElement(IconFlag), 'Report Issue'),
    showModal && React.createElement('div', { className: 'fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' },
      React.createElement('div', { className: 'bg-white rounded-xl shadow-xl p-6 w-full max-w-md' },
        sent
          ? React.createElement('div', { className: 'text-center py-4' },
              React.createElement(IconCheck),
              React.createElement('p', { className: 'text-sm font-medium text-gray-900 mt-2' }, 'Feedback sent! Thank you.')
            )
          : React.createElement('div', null,
              React.createElement('div', { className: 'flex items-center justify-between mb-4' },
                React.createElement('h3', { className: 'font-semibold text-gray-900' }, 'Report an Issue'),
                React.createElement('button', { onClick: function () { setShowModal(false); }, className: 'text-gray-400 hover:text-gray-600' }, React.createElement(IconX))
              ),
              React.createElement('textarea', {
                value: feedback, onChange: function (e) { setFeedback(e.target.value); },
                placeholder: 'Describe the issue you encountered...',
                rows: 4,
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue mb-3',
              }),
              React.createElement('button', {
                onClick: handleSubmit,
                className: 'w-full py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark text-sm font-medium',
              }, 'Submit Feedback')
            )
      )
    )
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ onNavigate }) {
  return React.createElement('footer', { className: 'bg-toledo-dark text-white mt-12' },
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-8' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-8' },
        React.createElement('div', null,
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement('div', { className: 'bg-toledo-gold text-toledo-blue font-extrabold text-sm w-8 h-8 rounded-lg flex items-center justify-center' }, 'UT'),
            React.createElement('div', null,
              React.createElement('p', { className: 'text-sm font-bold' }, 'Toledo Athletics'),
              React.createElement('p', { className: 'text-xs text-blue-300' }, 'Onboarding Portal')
            )
          ),
          React.createElement('p', { className: 'text-xs text-blue-300' }, 'Your complete guide to getting started at the University of Toledo Athletic Department.')
        ),
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-semibold mb-3' }, 'Quick Access'),
          React.createElement('div', { className: 'grid grid-cols-2 gap-1' },
            [
              { id: 'home', label: 'Home' },
              { id: 'tips', label: 'Tips' },
              { id: 'orgchart', label: 'Org Chart' },
              { id: 'ai-hub', label: 'AI Hub' },
              { id: 'youtube', label: 'Learning' },
              { id: 'quicklinks', label: 'Quick Links' },
              { id: 'contacts', label: 'Contacts' },
              { id: 'policies', label: 'Policies' },
              { id: 'systems', label: 'Systems' },
            ].map(function (item) {
              return React.createElement('button', {
                key: item.id,
                onClick: function () { onNavigate(item.id); },
                className: 'text-xs text-blue-300 hover:text-white text-left py-0.5 transition-colors',
              }, item.label);
            })
          )
        ),
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-semibold mb-3' }, 'Information'),
          React.createElement('p', { className: 'text-xs text-blue-300 mb-1' }, 'Maintained by Toledo Athletics Communications'),
          React.createElement('p', { className: 'text-xs text-blue-300 mb-1' }, 'For issues, use the Report Issue button on any page.'),
          React.createElement('p', { className: 'text-xs text-blue-300 mt-3' }, 'Last Updated: ' + new Date().toLocaleDateString())
        )
      ),
      React.createElement('div', { className: 'border-t border-white/10 mt-6 pt-4 text-center' },
        React.createElement('p', { className: 'text-xs text-blue-400' }, '© ' + new Date().getFullYear() + ' University of Toledo Athletics. All rights reserved.')
      )
    )
  );
}

// ── App (Router) ──────────────────────────────────────────────────────────────
function App() {
  var _useState = useState(null);
  var currentUser = _useState[0];
  var setCurrentUser = _useState[1];
  var _useState2 = useState('home');
  var view = _useState2[0];
  var setView = _useState2[1];
  var _useState3 = useState(null);
  var viewParam = _useState3[0];
  var setViewParam = _useState3[1];
  var _useState4 = useState([]);
  var categories = _useState4[0];
  var setCategories = _useState4[1];
  var _useState5 = useState(null);
  var stats = _useState5[0];
  var setStats = _useState5[1];

  useEffect(function () {
    api('/categories').then(function (r) { if (r.success) setCategories(r.data); });
    api('/stats').then(function (r) { if (r.success) setStats(r.data); });
  }, []);

  function navigate(newView, param) {
    setView(newView);
    setViewParam(param || null);
    window.scrollTo(0, 0);
  }

  function handleSearch(query) {
    navigate('search', query);
  }

  function handleLogin(user) {
    _currentUserId = user.id;
    setCurrentUser(user);
  }

  if (!currentUser) {
    return React.createElement(LoginScreen, { onLogin: handleLogin });
  }

  var content;
  switch (view) {
    case 'home':
      content = React.createElement(HomePage, { categories: categories, stats: stats, onNavigate: navigate, onSearch: handleSearch });
      break;
    case 'categories':
      content = React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-8 fade-in' },
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-6' }, 'All Categories'),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
          categories.map(function (cat) {
            return React.createElement('button', {
              key: cat.id,
              onClick: function () { navigate('category', cat.id); },
              className: 'bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-toledo-blue/30 transition-all group',
            },
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('span', { className: 'text-2xl' }, CATEGORY_ICONS[cat.name] || '📄'),
                React.createElement('div', null,
                  React.createElement('h3', { className: 'font-semibold text-gray-900 group-hover:text-toledo-blue' }, cat.name),
                  React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, cat.description)
                )
              )
            );
          })
        )
      );
      break;
    case 'category':
      content = React.createElement(CategoryView, { categoryId: viewParam, onNavigate: navigate });
      break;
    case 'article':
      content = React.createElement(ArticleView, { articleId: viewParam, onNavigate: navigate });
      break;
    case 'search':
      content = React.createElement(SearchResults, { query: viewParam, onNavigate: navigate });
      break;
    case 'submit':
      content = React.createElement(SubmitForm, { currentUser: currentUser, categories: categories, onNavigate: navigate });
      break;
    case 'moderate':
      content = React.createElement(ModerationDashboard, { currentUser: currentUser, onNavigate: navigate });
      break;
    case 'tips':
      content = React.createElement(TipsPage, { currentUser: currentUser, onNavigate: navigate });
      break;
    case 'orgchart':
      content = React.createElement(OrgChartPage, { onNavigate: navigate });
      break;
    case 'ai-hub':
      content = React.createElement(AIHubPage, { currentUser: currentUser, onNavigate: navigate });
      break;
    case 'youtube':
      content = React.createElement(YouTubeFinderPage, { currentUser: currentUser, onNavigate: navigate });
      break;
    case 'quicklinks':
      content = React.createElement(QuickLinksPage, { onNavigate: navigate });
      break;
    case 'contacts':
      content = React.createElement(ContactsPage, { onNavigate: navigate });
      break;
    case 'policies':
      content = React.createElement(PoliciesPage, { onNavigate: navigate });
      break;
    case 'systems':
      content = React.createElement(SystemsPage, { onNavigate: navigate });
      break;
    default:
      content = React.createElement(HomePage, { categories: categories, stats: stats, onNavigate: navigate, onSearch: handleSearch });
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex flex-col' },
    React.createElement(Header, { currentUser: currentUser, onNavigate: navigate, currentView: view }),
    React.createElement('main', { className: 'flex-1' }, content),
    React.createElement(Footer, { onNavigate: navigate }),
    React.createElement(AIChatWidget, { currentUser: currentUser }),
    React.createElement(FeedbackButton, { currentUser: currentUser })
  );
}

// Mount
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
`;
}

export { getIndexHtml };
