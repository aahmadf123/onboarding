// HTML shell that serves the React SPA from the Worker.
// Toledo Athletics branding colors: #0B2240 (athletics blue), #FFCD00 (athletics gold)

import { getSharedCode } from './frontend/shared';
import { getContentCode } from './frontend/content';

function getIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Toledo Athletics Onboarding</title>
  <link rel="icon" href="/branding/Primary_Logo_for_Light_Background.png" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.26.9/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'toledo-blue': '#0B2240',
            'toledo-gold': '#FFCD00',
            'toledo-dark': '#000F3E',
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Poppins', sans-serif; }
    .prose p { margin-bottom: 1rem; line-height: 1.75; }
    .prose a { color: #0B2240; text-decoration: underline; }
    .prose h1, .prose h2, .prose h3 { font-weight: 700; margin-bottom: 0.5rem; margin-top: 1.25rem; }
    .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
    .prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
    .prose li { margin-bottom: 0.25rem; }
    .prose strong { font-weight: 600; }
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
// ── OnboardingGuidePage ────────────────────────────────────────────────────────
function OnboardingGuidePage({ onNavigate }) {
  var _useState = useState('first-day');
  var activePhase = _useState[0];
  var setActivePhase = _useState[1];

  var phases = [
    {
      id: 'first-day',
      label: 'First Day',
      icon: '☀️',
      description: 'Get your essentials set up and meet the team.',
      tasks: [
        { title: 'Get Your Rocket ID', description: 'Visit the Rocket Card Office to obtain your campus ID. This is required before you can access most university systems.', priority: 'required' },
        { title: 'Activate UTAD Account', description: 'Your University of Toledo Account Domain (UTAD) is needed for email, Wi-Fi, and all digital resources. Follow the activation link sent to your personal email.', priority: 'required' },
        { title: 'Set Up MFA (Multi-Factor Authentication)', description: 'Install Microsoft Authenticator on your phone and register it with your UTAD account. This is required for secure login to university systems.', priority: 'required' },
        { title: 'Access MyUT Portal', description: 'Log into myut.utoledo.edu to verify your account works. This is your primary gateway to employee self-service.', priority: 'required' },
        { title: 'Meet Your Team', description: 'Your supervisor will introduce you to your immediate team members and provide a brief overview of daily operations.', priority: 'recommended' },
        { title: 'Facility Tour', description: 'Get oriented with your building, office location, restrooms, break areas, and emergency exits.', priority: 'recommended' },
      ]
    },
    {
      id: 'first-week',
      label: 'First Week',
      icon: '📅',
      description: 'Complete essential setup and begin learning department workflows.',
      tasks: [
        { title: 'Set Up Parking', description: 'Apply for your parking permit through ParkUToledo. Lots near Savage Arena fill up fast before 9am. Consider using daily C permit option until your A permit arrives.', priority: 'required' },
        { title: 'Configure Direct Deposit & Taxes', description: 'In MyUT, go to Employee Self-Service to set up direct deposit and verify your tax withholding information.', priority: 'required' },
        { title: 'Complete New Employee Orientation', description: 'Attend or complete the mandatory HR orientation session as scheduled by Human Resources.', priority: 'required' },
        { title: 'Set Up Microsoft 365', description: 'Access Office.com with your UTAD credentials. Set up Outlook email, Teams, and OneDrive for file storage.', priority: 'required' },
        { title: 'Learn Teamworks', description: 'If applicable to your role, get access to Teamworks — the athletics department operating platform used across all workflows.', priority: 'recommended' },
        { title: 'Review Department Org Chart', description: 'Familiarize yourself with the organizational structure so you know who handles what.', priority: 'recommended' },
      ]
    },
    {
      id: 'first-month',
      label: 'First Month',
      icon: '📋',
      description: 'Complete benefits, training, and deepen your understanding of the department.',
      tasks: [
        { title: 'Complete Benefits Enrollment', description: 'You have 30 days from your start date to elect or waive benefits in MyUT. Note: silence is NOT a waiver — you must actively make selections.', priority: 'required' },
        { title: 'Complete Required Training', description: 'Finish all mandatory training modules assigned in Blackboard or through HR, including any compliance-specific courses.', priority: 'required' },
        { title: 'Understand Compliance Basics', description: 'Review NCAA compliance fundamentals. If uncertain about recruiting, NIL, booster, or eligibility matters, always contact Compliance before acting.', priority: 'required' },
        { title: 'Learn Department Workflows', description: 'Understand the standard processes for your role including communication channels, approval workflows, and reporting structures.', priority: 'recommended' },
        { title: 'Connect with Key Contacts', description: 'Build relationships with the people you will work with regularly across departments. Use the Key Contacts page for reference.', priority: 'recommended' },
        { title: 'Review Brand Standards', description: 'Understand Toledo Athletics branding guidelines, approved identifiers, and the difference between Athletics and University branding.', priority: 'recommended' },
      ]
    },
    {
      id: 'first-90-days',
      label: 'First 90 Days',
      icon: '🎯',
      description: 'Establish yourself, explore growth opportunities, and confirm long-term setup.',
      tasks: [
        { title: 'Retirement Plan Election', description: 'Eligible full-time employees have a 120-day window to elect an alternative retirement plan. Review your options and make a selection.', priority: 'required' },
        { title: 'Review All Applicable Policies', description: 'Read through key policies including Standards of Conduct, FERPA, Information Security, and any athletics-specific compliance rules.', priority: 'required' },
        { title: 'Complete AI Literacy Assessment', description: 'Take the AI literacy self-assessment in the AI Hub to identify growth areas and get personalized learning resources.', priority: 'recommended' },
        { title: 'Build Your Learning Plan', description: 'Use the Video Learning section to find relevant training content and create a personal development plan.', priority: 'recommended' },
        { title: 'Supervisor Check-In', description: 'Schedule a formal check-in with your supervisor to discuss your onboarding experience, ask questions, and set goals.', priority: 'recommended' },
        { title: 'Contribute Knowledge', description: 'If you have insights that could help future new hires, use the Contribute page to submit content for review.', priority: 'optional' },
      ]
    },
  ];

  var currentPhase = phases.find(function (p) { return p.id === activePhase; }) || phases[0];

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
      '🗺️', ' Onboarding Guide'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Follow this timeline at your own pace. Focus on one phase at a time.'),

    // Phase tabs
    React.createElement('div', { className: 'flex gap-2 mb-8 overflow-x-auto pb-2' },
      phases.map(function (phase) {
        return React.createElement('button', {
          key: phase.id,
          onClick: function () { setActivePhase(phase.id); },
          className: 'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ' +
            (activePhase === phase.id
              ? 'bg-toledo-blue text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-toledo-blue/30 hover:shadow-sm'),
        },
          React.createElement('span', null, phase.icon),
          phase.label
        );
      })
    ),

    // Phase content
    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-6 mb-6' },
      React.createElement('div', { className: 'flex items-center gap-3 mb-2' },
        React.createElement('span', { className: 'text-3xl' }, currentPhase.icon),
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-xl font-bold text-gray-900' }, currentPhase.label),
          React.createElement('p', { className: 'text-sm text-gray-500' }, currentPhase.description)
        )
      )
    ),

    // Tasks
    React.createElement('div', { className: 'space-y-3' },
      currentPhase.tasks.map(function (task, i) {
        var priorityStyles = {
          required: 'border-l-red-400 bg-red-50/30',
          recommended: 'border-l-blue-400 bg-blue-50/30',
          optional: 'border-l-gray-300 bg-gray-50/30',
        };
        var priorityLabels = {
          required: 'Required',
          recommended: 'Recommended',
          optional: 'Optional',
        };
        var priorityColors = {
          required: 'bg-red-100 text-red-700',
          recommended: 'bg-blue-100 text-blue-700',
          optional: 'bg-gray-100 text-gray-600',
        };
        return React.createElement('div', {
          key: i,
          className: 'bg-white rounded-xl border border-gray-200 border-l-4 p-5 ' + (priorityStyles[task.priority] || ''),
        },
          React.createElement('div', { className: 'flex items-start justify-between mb-1' },
            React.createElement('h3', { className: 'font-semibold text-gray-900 text-sm' }, task.title),
            React.createElement('span', {
              className: 'px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ml-3 ' + (priorityColors[task.priority] || ''),
            }, priorityLabels[task.priority] || 'Info')
          ),
          React.createElement('p', { className: 'text-sm text-gray-600 mt-1' }, task.description)
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

  var indentPx = Math.min(depth * 16, 64);
  return React.createElement('div', { className: 'mb-1', style: { marginLeft: indentPx + 'px' } },
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
      if (r.data && r.data.reply) {
        setMessages(function (prev) {
          return prev.concat([{ role: 'assistant', content: r.data.reply, sources: r.data.sources }]);
        });
      } else {
        setMessages(function (prev) {
          return prev.concat([{ role: 'assistant', content: r.error || 'Sorry, I could not process your request. Please try again.' }]);
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
      React.createElement('div', { className: 'flex items-center gap-2' },
        messages.length > 0 && React.createElement('button', {
          onClick: function () { setMessages([]); },
          className: 'text-blue-200 hover:text-white text-xs px-2 py-0.5 border border-blue-400 rounded',
          title: 'Clear conversation',
        }, 'Clear'),
        React.createElement('button', { onClick: function () { setOpen(false); }, className: 'text-blue-200 hover:text-white' },
          React.createElement(IconX))
      )
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

// ── ChecklistPage ─────────────────────────────────────────────────────────────
var CHECKLIST_ITEMS = [
  { id: 'rocket-id', phase: 'First Day', label: 'Get your Rocket ID & UTAD account' },
  { id: 'mfa', phase: 'First Day', label: 'Set up Multi-Factor Authentication (MFA)' },
  { id: 'myut', phase: 'First Day', label: 'Activate MyUT portal access' },
  { id: 'meet-team', phase: 'First Day', label: 'Meet your team and supervisor' },
  { id: 'parking', phase: 'First Week', label: 'Complete parking permit setup via vPermit' },
  { id: 'direct-deposit', phase: 'First Week', label: 'Set up direct deposit in MyUT' },
  { id: 'facilities-tour', phase: 'First Week', label: 'Tour athletic facilities' },
  { id: 'systems-training', phase: 'First Week', label: 'Complete systems training (Teamworks, Banner, etc.)' },
  { id: 'benefits', phase: 'First Month', label: 'Complete benefits enrollment (30-day window)' },
  { id: 'compliance-training', phase: 'First Month', label: 'Finish all required compliance training modules' },
  { id: 'dept-workflows', phase: 'First Month', label: 'Learn department workflows' },
  { id: 'key-contacts', phase: 'First Month', label: 'Connect with key contacts from the directory' },
  { id: 'compliance-policies', phase: 'First 90 Days', label: 'Review all compliance policies' },
  { id: 'learning-plan', phase: 'First 90 Days', label: 'Build your personal learning plan' },
  { id: 'supervisor-checkin', phase: 'First 90 Days', label: 'Check in with supervisor on goals' },
  { id: 'toledo-explore', phase: 'First 90 Days', label: 'Explore Toledo neighborhoods and local resources' },
];

var CHECKLIST_PHASES = ['First Day', 'First Week', 'First Month', 'First 90 Days'];

function ChecklistPage({ currentUser, onNavigate }) {
  var storageKey = 'checklist_' + (currentUser ? currentUser.email : 'guest');
  var _useState = useState(function () {
    try {
      var saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  var checked = _useState[0];
  var setChecked = _useState[1];

  function toggle(id) {
    var next = Object.assign({}, checked, { [id]: !checked[id] });
    setChecked(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch (e) {}
  }

  function reset() {
    setChecked({});
    try { localStorage.setItem(storageKey, JSON.stringify({})); } catch (e) {}
  }

  var total = CHECKLIST_ITEMS.length;
  var done = CHECKLIST_ITEMS.filter(function (item) { return checked[item.id]; }).length;
  var pct = Math.round((done / total) * 100);

  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8 fade-in' },
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, '✅ Onboarding Checklist'),
        React.createElement('p', { className: 'text-gray-500 text-sm mt-1' }, 'Track your onboarding progress. Your progress is saved automatically.')
      ),
      React.createElement('button', {
        onClick: reset,
        className: 'text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors',
      }, 'Reset Checklist')
    ),

    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-5 mb-6' },
      React.createElement('div', { className: 'flex justify-between items-center mb-2' },
        React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, done + ' of ' + total + ' completed'),
        React.createElement('span', { className: 'text-sm font-semibold text-toledo-blue' }, pct + '%')
      ),
      React.createElement('div', { className: 'w-full bg-gray-100 rounded-full h-3' },
        React.createElement('div', {
          className: 'bg-toledo-blue h-3 rounded-full transition-all duration-300',
          style: { width: pct + '%' },
        })
      ),
      done === total && React.createElement('p', { className: 'text-center text-green-600 font-semibold mt-3 text-sm' }, '🎉 You\'ve completed all onboarding tasks!')
    ),

    CHECKLIST_PHASES.map(function (phase) {
      var items = CHECKLIST_ITEMS.filter(function (item) { return item.phase === phase; });
      var phaseDone = items.filter(function (item) { return checked[item.id]; }).length;
      return React.createElement('div', { key: phase, className: 'bg-white rounded-xl border border-gray-200 p-5 mb-4' },
        React.createElement('div', { className: 'flex items-center justify-between mb-3' },
          React.createElement('h2', { className: 'font-semibold text-gray-900' }, phase),
          React.createElement('span', { className: 'text-xs text-gray-400' }, phaseDone + '/' + items.length)
        ),
        React.createElement('div', { className: 'space-y-2' },
          items.map(function (item) {
            var isChecked = !!checked[item.id];
            return React.createElement('label', {
              key: item.id,
              className: 'flex items-center gap-3 cursor-pointer group',
            },
              React.createElement('input', {
                type: 'checkbox',
                checked: isChecked,
                onChange: function () { toggle(item.id); },
                className: 'w-4 h-4 rounded border-gray-300 text-toledo-blue focus:ring-toledo-blue cursor-pointer',
              }),
              React.createElement('span', {
                className: 'text-sm ' + (isChecked ? 'line-through text-gray-400' : 'text-gray-700 group-hover:text-toledo-blue'),
              }, item.label)
            );
          })
        )
      );
    })
  );
}

// ── ResourcesPage (Combined Quick Links + Systems) ───────────────────────────
function ResourcesPage({ onNavigate }) {
  var _useState = useState([]);
  var links = _useState[0];
  var setLinks = _useState[1];
  var _useState2 = useState([]);
  var systems = _useState2[0];
  var setSystems = _useState2[1];
  var _useState3 = useState(true);
  var loading = _useState3[0];
  var setLoading = _useState3[1];
  var _useState4 = useState('links');
  var tab = _useState4[0];
  var setTab = _useState4[1];

  useEffect(function () {
    Promise.all([
      api('/quicklinks').then(function (r) { if (r.success) setLinks(r.data || []); }),
      api('/systems').then(function (r) { if (r.success) setSystems(r.data || []); }),
    ]).then(function () { setLoading(false); });
  }, []);

  if (loading) return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');

  return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
      React.createElement(IconLink), 'Resources & Systems'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Quick links, tools, and system access for your daily work.'),

    // Tabs
    React.createElement('div', { className: 'flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit' },
      [
        { id: 'links', label: '🔗 Quick Links' },
        { id: 'systems', label: '💻 Systems' },
      ].map(function (t) {
        return React.createElement('button', {
          key: t.id,
          onClick: function () { setTab(t.id); },
          className: 'px-4 py-1.5 rounded-md text-sm font-medium transition-colors ' + (tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'),
        }, t.label);
      })
    ),

    // Quick Links Tab
    tab === 'links' && React.createElement('div', null,
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
    ),

    // Systems Tab
    tab === 'systems' && React.createElement('div', null,
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

// (Systems moved into ResourcesPage)

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

  return React.createElement('div', { className: 'fixed bottom-6 left-6 z-40' },
    React.createElement('button', {
      onClick: function () { setShowModal(true); setSent(false); },
      className: 'flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-md text-xs text-gray-500 hover:text-toledo-blue hover:border-toledo-blue/30 transition-colors',
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
            React.createElement('img', { src: '/branding/Primary_Logo_for_Dark_Background.png', alt: 'Toledo Athletics', className: 'h-8 w-auto' }),
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
              { id: 'guide', label: 'Onboarding Guide' },
              { id: 'orgchart', label: 'Org Chart' },
              { id: 'checklist', label: 'Checklist' },
              { id: 'resources', label: 'Resources' },
              { id: 'contacts', label: 'Contacts' },
              { id: 'policies', label: 'Policies' },
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

  function navigate(newView, param, pushState) {
    if (pushState !== false) {
      var url = '/' + newView + (param ? '/' + param : '');
      window.history.pushState({ view: newView, param: param || null }, '', url);
    }
    var titles = {
      'home': 'Toledo Athletics Onboarding',
      'guide': 'Onboarding Guide — Toledo Athletics',
      'categories': 'Browse Categories — Toledo Athletics',
      'orgchart': 'Org Chart — Toledo Athletics',
      'checklist': 'Onboarding Checklist — Toledo Athletics',
      'resources': 'Resources & Systems — Toledo Athletics',
      'contacts': 'Key Contacts — Toledo Athletics',
      'policies': 'Policies & Procedures — Toledo Athletics',
      'search': 'Search — Toledo Athletics',
      'submit': 'Contribute — Toledo Athletics',
      'moderate': 'Moderation — Toledo Athletics',
    };
    document.title = titles[newView] || 'Toledo Athletics Onboarding';
    setView(newView);
    setViewParam(param || null);
    window.scrollTo(0, 0);
  }

  useEffect(function () {
    function handlePopState(e) {
      if (e.state && e.state.view) {
        navigate(e.state.view, e.state.param, false);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return function () { window.removeEventListener('popstate', handlePopState); };
  }, []);

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
    case 'guide':
      content = React.createElement(OnboardingGuidePage, { onNavigate: navigate });
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
    case 'orgchart':
      content = React.createElement(OrgChartPage, { onNavigate: navigate });
      break;
    case 'checklist':
      content = React.createElement(ChecklistPage, { currentUser: currentUser, onNavigate: navigate });
      break;
    case 'resources':
      content = React.createElement(ResourcesPage, { onNavigate: navigate });
      break;
    case 'contacts':
      content = React.createElement(ContactsPage, { onNavigate: navigate });
      break;
    case 'policies':
      content = React.createElement(PoliciesPage, { onNavigate: navigate });
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
