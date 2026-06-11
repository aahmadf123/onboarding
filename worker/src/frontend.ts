// HTML shell that serves the React SPA from the Worker.
// Toledo Athletics branding colors: #0B2240 (athletics blue), #FFCD00 (athletics gold)

import { getSharedCode } from './frontend/shared';
import { getContentCode } from './frontend/content';
import { getAdminCode } from './frontend/admin';

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
    .chat-md p { margin-bottom: 0.5rem; line-height: 1.6; }
    .chat-md p:last-child { margin-bottom: 0; }
    .chat-md ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.5rem; }
    .chat-md ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 0.5rem; }
    .chat-md li { margin-bottom: 0.15rem; }
    .chat-md strong { font-weight: 600; }
    .chat-md a { color: #0B2240; text-decoration: underline; }
    mark { background: #fef9c3; color: #713f12; border-radius: 2px; padding: 0 2px; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-gray-50">
  <div id="root"></div>
  <script type="text/babel" data-type="module">
${getSharedCode()}
${getContentCode()}
${getAdminCode()}
${getFeatureCode()}
  </script>
</body>
</html>`;
}

function getFeatureCode(): string {
  return `
// ── QuickTour ─────────────────────────────────────────────────────────────────
var TOUR_STEPS = [
  {
    icon: '👋',
    title: 'Welcome to Toledo Athletics!',
    body: 'This portal has everything you need to get settled in — from your first-day checklist to policies, key contacts, and more. This quick tour will show you around.',
    target: null,
    cta: null,
  },
  {
    icon: '🗺️',
    title: 'My Onboarding',
    body: 'Your personal onboarding checklist walks you through every phase — First Day, First Week, First Month, and First 90 Days. Check tasks off as you complete them and track your progress.',
    target: '[data-tour="guide"]',
    cta: { label: 'Go to My Onboarding', view: 'guide', param: null },
  },
  {
    icon: '📚',
    title: 'Explore by Topic',
    body: 'Browse 9 topic areas: Department Overview, NCAA Compliance, IT & Campus Access, HR & Benefits, Parking, and more. Each topic has detailed articles written for Athletics staff.',
    target: '[data-tour="categories"]',
    cta: { label: 'Browse Topics', view: 'categories', param: null },
  },
  {
    icon: '👥',
    title: 'Key Contacts & Resources',
    body: 'Not sure who to call? The Contacts page lists key people across the department. The Resources page has direct links to every system you need — MyUT, Teamworks, TimeClock Plus, and more.',
    target: '[data-tour="contacts"]',
    cta: { label: 'See Key Contacts', view: 'contacts', param: null },
  },
  {
    icon: '✏️',
    title: 'Contribute Knowledge',
    body: 'Have insights to share? Use the Contribute page to propose new articles or suggest edits to existing ones. All submissions are reviewed before publishing.',
    target: '[data-tour="submit"]',
    cta: { label: 'Contribute', view: 'submit', param: null },
  },
  {
    icon: '✨',
    title: 'AI Assistant',
    body: 'See the blue chat button in the bottom-right corner? That is your AI assistant, scoped to Toledo Athletics onboarding topics. Ask it anything — policies, procedures, who to contact, how to set up parking.',
    target: '[data-tour="ai-chat"]',
    cta: null,
  },
];

function QuickTour({ onDone, onNavigate }) {
  var _useState = useState(0);
  var step = _useState[0];
  var setStep = _useState[1];
  var _useState2 = useState(null);
  var spotlightRect = _useState2[0];
  var setSpotlightRect = _useState2[1];

  var current = TOUR_STEPS[step];
  var isLast = step === TOUR_STEPS.length - 1;

  // Find and measure the target element for the spotlight
  useEffect(function () {
    if (!current.target) {
      setSpotlightRect(null);
      return;
    }
    var el = document.querySelector(current.target);
    if (el) {
      var rect = el.getBoundingClientRect();
      setSpotlightRect({
        top: rect.top + window.scrollY - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      });
      // Scroll element into view
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setSpotlightRect(null);
    }
  }, [step]);

  function advance() {
    if (isLast) { onDone(); } else { setStep(function (s) { return s + 1; }); }
  }

  function goAndDone(view, param) {
    onDone();
    onNavigate(view, param);
  }

  // Calculate tooltip position based on spotlight
  var tooltipStyle = {};
  if (spotlightRect) {
    var viewportW = window.innerWidth;
    var tooltipW = Math.min(360, viewportW - 32);
    // Position tooltip below the spotlight, centered
    var leftPos = spotlightRect.left + (spotlightRect.width / 2) - (tooltipW / 2);
    if (leftPos < 16) leftPos = 16;
    if (leftPos + tooltipW > viewportW - 16) leftPos = viewportW - tooltipW - 16;
    tooltipStyle = {
      position: 'absolute',
      top: (spotlightRect.top + spotlightRect.height + 16) + 'px',
      left: leftPos + 'px',
      width: tooltipW + 'px',
      zIndex: 110,
    };
  }

  // Spotlight overlay using CSS clip-path (or center modal when no target)
  var overlayStyle = { position: 'fixed', inset: 0, zIndex: 100 };

  if (!spotlightRect) {
    // No target: full overlay with centered card
    return React.createElement('div', { style: overlayStyle },
      // Dark backdrop
      React.createElement('div', {
        className: 'fixed inset-0 transition-all duration-500',
        style: { background: 'rgba(11,34,64,0.75)', zIndex: 100 },
        onClick: function (e) { e.stopPropagation(); },
      }),
      // Centered card
      React.createElement('div', {
        className: 'fixed inset-0 flex items-center justify-center p-4',
        style: { zIndex: 110 },
      },
        renderTourCard(current, step, isLast, advance, goAndDone, onDone, setStep)
      )
    );
  }

  // With target: spotlight with cutout
  var clipPath = 'polygon(0% 0%, 0% 100%, ' +
    spotlightRect.left + 'px 100%, ' +
    spotlightRect.left + 'px ' + spotlightRect.top + 'px, ' +
    (spotlightRect.left + spotlightRect.width) + 'px ' + spotlightRect.top + 'px, ' +
    (spotlightRect.left + spotlightRect.width) + 'px ' + (spotlightRect.top + spotlightRect.height) + 'px, ' +
    spotlightRect.left + 'px ' + (spotlightRect.top + spotlightRect.height) + 'px, ' +
    spotlightRect.left + 'px 100%, 100% 100%, 100% 0%)';

  return React.createElement('div', { style: { position: 'absolute', inset: 0, zIndex: 100, minHeight: '100%', pointerEvents: 'none' } },
    // Dark backdrop with cutout
    React.createElement('div', {
      style: {
        position: 'absolute', inset: 0, minHeight: document.documentElement.scrollHeight + 'px',
        background: 'rgba(11,34,64,0.7)',
        clipPath: clipPath,
        transition: 'clip-path 0.5s ease-in-out',
        pointerEvents: 'auto',
        zIndex: 100,
      },
      onClick: function (e) { e.stopPropagation(); },
    }),
    // Spotlight ring
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: spotlightRect.top + 'px', left: spotlightRect.left + 'px',
        width: spotlightRect.width + 'px', height: spotlightRect.height + 'px',
        borderRadius: '8px',
        boxShadow: '0 0 0 3px rgba(255,205,0,0.8), 0 0 20px rgba(255,205,0,0.3)',
        transition: 'all 0.5s ease-in-out',
        pointerEvents: 'none',
        zIndex: 105,
      },
    }),
    // Tooltip card positioned near spotlight
    React.createElement('div', { style: Object.assign({}, tooltipStyle, { pointerEvents: 'auto' }) },
      renderTourCard(current, step, isLast, advance, goAndDone, onDone, setStep)
    )
  );
}

function renderTourCard(current, step, isLast, advance, goAndDone, onDone, setStep) {
  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-2xl w-full max-w-md fade-in overflow-hidden' },
    // Progress bar
    React.createElement('div', { className: 'h-1 bg-gray-100' },
      React.createElement('div', {
        className: 'h-1 bg-toledo-blue transition-all duration-500',
        style: { width: (((step + 1) / TOUR_STEPS.length) * 100) + '%' },
      })
    ),
    React.createElement('div', { className: 'p-6' },
      // Step indicator
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('div', { className: 'flex gap-1.5' },
          TOUR_STEPS.map(function (_, i) {
            return React.createElement('div', {
              key: i,
              className: 'h-1.5 rounded-full transition-all duration-300 ' + (i === step ? 'w-6 bg-toledo-blue' : i < step ? 'w-1.5 bg-toledo-blue/40' : 'w-1.5 bg-gray-200'),
            });
          })
        ),
        React.createElement('span', { className: 'text-xs text-gray-400 font-medium' }, (step + 1) + ' / ' + TOUR_STEPS.length)
      ),
      // Icon
      React.createElement('div', { className: 'w-12 h-12 bg-toledo-blue/8 rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto' }, current.icon),
      // Content
      React.createElement('h2', { className: 'text-lg font-bold text-gray-900 text-center mb-2' }, current.title),
      React.createElement('p', { className: 'text-sm text-gray-500 text-center leading-relaxed mb-5' }, current.body),
      // CTA
      current.cta && React.createElement('button', {
        onClick: function () { goAndDone(current.cta.view, current.cta.param); },
        className: 'w-full mb-3 py-2 border-2 border-toledo-blue text-toledo-blue rounded-xl text-sm font-semibold hover:bg-toledo-blue hover:text-white transition-colors',
      }, current.cta.label),
      // Navigation
      React.createElement('div', { className: 'flex items-center gap-3' },
        step > 0 && React.createElement('button', {
          onClick: function () { setStep(function (s) { return s - 1; }); },
          className: 'flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors',
        }, '\u2190 Back'),
        React.createElement('button', {
          onClick: advance,
          className: 'flex-1 py-2 text-sm font-semibold text-white bg-toledo-blue hover:bg-toledo-dark rounded-xl transition-colors',
        }, isLast ? '\uD83C\uDF89 Lets go!' : 'Next \u2192')
      ),
      // Skip
      !isLast && React.createElement('button', {
        onClick: onDone,
        className: 'w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1',
      }, 'Skip tour')
    )
  );
}

// ── OnboardingGuidePage (DB-backed checklist with approvals) ──────────────────
var PHASE_META = {
  'first-day':     { label: 'First Day',     icon: '☀️', order: 1 },
  'first-week':    { label: 'First Week',    icon: '📅', order: 2 },
  'first-month':   { label: 'First Month',   icon: '📋', order: 3 },
  'first-90-days': { label: 'First 90 Days', icon: '🎯', order: 4 },
};

function taskIsChecked(status) {
  return status === 'done' || status === 'approved' || status === 'pending_approval';
}

function OnboardingGuidePage({ currentUser, onNavigate }) {
  var _tasksState = useState(null);
  var tasks = _tasksState[0];
  var setTasks = _tasksState[1];
  var _expandedState = useState(null);
  var expandedItem = _expandedState[0];
  var setExpandedItem = _expandedState[1];
  var _busyState = useState(null);
  var busy = _busyState[0];
  var setBusy = _busyState[1];

  useEffect(function () {
    api('/tasks').then(function (r) { if (r.success) setTasks(r.data || []); });
  }, []);

  function toggle(task) {
    if (task.my_status === 'approved' || busy) return;
    var done = !taskIsChecked(task.my_status);
    setBusy(task.id);
    api('/tasks/' + task.id + '/status', { method: 'PUT', body: JSON.stringify({ done: done }) })
      .then(function (r) {
        setBusy(null);
        if (r.success) {
          setTasks(function (prev) {
            return (prev || []).map(function (t) {
              if (t.id !== task.id) return t;
              return Object.assign({}, t, { my_status: r.data.status, review_notes: done ? t.review_notes : null });
            });
          });
        }
      })
      .catch(function () { setBusy(null); });
  }

  var priorityStyles = {
    required: 'border-l-red-400',
    recommended: 'border-l-blue-400',
    optional: 'border-l-gray-300',
  };
  var priorityColors = {
    required: 'bg-red-100 text-red-700',
    recommended: 'bg-blue-100 text-blue-700',
    optional: 'bg-gray-100 text-gray-600',
  };
  var priorityLabels = { required: 'Required', recommended: 'Recommended', optional: 'Optional' };
  var statusBadges = {
    pending_approval: { label: '⏳ Awaiting review', cls: 'bg-amber-100 text-amber-700' },
    approved: { label: '✓ Approved', cls: 'bg-green-100 text-green-700' },
    rejected: { label: '↩ Sent back', cls: 'bg-red-100 text-red-700' },
  };

  if (tasks === null) {
    return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-12 text-center text-gray-500' }, 'Loading...');
  }

  var standardTasks = tasks.filter(function (t) { return t.audience !== 'assigned'; });
  var assignedTasks = tasks.filter(function (t) { return t.audience === 'assigned'; });
  var total = tasks.length;
  var done = tasks.filter(function (t) { return taskIsChecked(t.my_status); }).length;
  var pct = total > 0 ? Math.round((done / total) * 100) : 0;

  function renderTask(task, showPhaseChip) {
    var isChecked = taskIsChecked(task.my_status);
    var isExpanded = expandedItem === task.id;
    var badge = statusBadges[task.my_status];
    return React.createElement('div', {
      key: task.id,
      className: 'bg-white rounded-xl border border-gray-200 border-l-4 ' + (priorityStyles[task.priority] || '') +
        (task.my_status === 'approved' ? ' opacity-60' : isChecked ? ' opacity-75' : ''),
    },
      // Task header row
      React.createElement('div', { className: 'flex items-center gap-3 p-4' },
        React.createElement('input', {
          type: 'checkbox',
          checked: isChecked,
          disabled: task.my_status === 'approved' || busy === task.id,
          onChange: function () { toggle(task); },
          className: 'w-4 h-4 rounded border-gray-300 text-toledo-blue focus:ring-toledo-blue cursor-pointer flex-shrink-0 disabled:cursor-not-allowed',
        }),
        React.createElement('button', {
          onClick: function () { setExpandedItem(isExpanded ? null : task.id); },
          className: 'flex-1 flex items-center justify-between text-left min-w-0 group',
        },
          React.createElement('span', {
            className: 'text-sm font-medium ' + (task.my_status === 'approved' ? 'line-through text-gray-400' : isChecked ? 'text-gray-500' : 'text-gray-900 group-hover:text-toledo-blue'),
          }, task.title),
          React.createElement('div', { className: 'flex items-center gap-2 flex-shrink-0 ml-3' },
            badge && React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full font-medium ' + badge.cls }, badge.label),
            showPhaseChip && PHASE_META[task.phase] && React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500 hidden sm:inline-block' }, PHASE_META[task.phase].label),
            React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block ' + (priorityColors[task.priority] || '') },
              priorityLabels[task.priority] || ''
            ),
            React.createElement('span', { className: 'text-gray-400 text-sm transition-transform ' + (isExpanded ? 'rotate-180 inline-block' : 'inline-block') }, '▾')
          )
        )
      ),
      // Expanded details
      isExpanded && React.createElement('div', { className: 'px-4 pb-4 pt-0 border-t border-gray-100' },
        React.createElement('p', { className: 'text-sm text-gray-600 pt-3 leading-relaxed' }, task.description),
        task.my_status === 'rejected' && task.review_notes && React.createElement('div', { className: 'mt-3 bg-red-50 rounded-lg p-3 text-sm text-red-700' },
          React.createElement('strong', null, 'Reviewer note: '), task.review_notes,
          React.createElement('p', { className: 'text-xs text-red-500 mt-1' }, 'Address the note, then check the task off again to resubmit.')
        ),
        !!task.requires_approval && task.my_status !== 'approved' && task.my_status !== 'pending_approval' && React.createElement('p', { className: 'mt-2 text-xs text-amber-600' },
          '🔏 An administrator reviews this task after you check it off.'
        ),
        task.my_status === 'pending_approval' && React.createElement('p', { className: 'mt-2 text-xs text-amber-600' },
          '⏳ Checked off — waiting for an administrator to confirm.'
        ),
        task.assigned_by_email && React.createElement('p', { className: 'mt-2 text-xs text-gray-400' },
          '📌 Assigned to you by ' + task.assigned_by_email
        ),
        task.link_view && React.createElement('button', {
          onClick: function () { onNavigate(task.link_view, task.link_param); },
          className: 'mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-toledo-blue hover:text-toledo-dark border border-toledo-blue/30 hover:border-toledo-blue hover:bg-toledo-blue/5 px-3 py-1.5 rounded-lg transition-colors',
        }, '📂 Explore full details →')
      )
    );
  }

  var phaseIds = Object.keys(PHASE_META).sort(function (a, b) { return PHASE_META[a].order - PHASE_META[b].order; });

  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark text-sm font-medium mb-2' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mt-4 mb-1' }, '🗺️ My Onboarding'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Work through each phase at your own pace. Expand any task to learn how to complete it, then check it off. Your progress is saved to your account.'),

    // Progress bar
    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-5 mb-8' },
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
      total > 0 && done === total && React.createElement('p', { className: 'text-center text-green-600 font-semibold mt-3 text-sm' }, '🎉 You have completed all onboarding tasks!')
    ),

    // Assigned-to-you tasks
    assignedTasks.length > 0 && React.createElement('div', { className: 'mb-6' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
        React.createElement('span', { className: 'text-xl' }, '📌'),
        React.createElement('h2', { className: 'text-lg font-bold text-gray-900 flex-1' }, 'Assigned to You'),
        React.createElement('span', { className: 'text-xs font-medium px-2 py-0.5 rounded-full bg-toledo-gold/20 text-toledo-blue' },
          assignedTasks.filter(function (t) { return taskIsChecked(t.my_status); }).length + '/' + assignedTasks.length
        )
      ),
      React.createElement('div', { className: 'space-y-2' },
        assignedTasks.map(function (task) { return renderTask(task, true); })
      )
    ),

    // Phases
    phaseIds.map(function (phaseId) {
      var meta = PHASE_META[phaseId];
      var phaseTasks = standardTasks.filter(function (t) { return t.phase === phaseId; });
      if (phaseTasks.length === 0) return null;
      var phaseDone = phaseTasks.filter(function (t) { return taskIsChecked(t.my_status); }).length;
      var phaseComplete = phaseDone === phaseTasks.length;
      return React.createElement('div', { key: phaseId, className: 'mb-6' },
        React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
          React.createElement('span', { className: 'text-xl' }, meta.icon),
          React.createElement('h2', { className: 'text-lg font-bold text-gray-900 flex-1' }, meta.label),
          React.createElement('span', { className: 'text-xs font-medium px-2 py-0.5 rounded-full ' + (phaseComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500') },
            phaseDone + '/' + phaseTasks.length
          )
        ),
        React.createElement('div', { className: 'space-y-2' },
          phaseTasks.map(function (task) { return renderTask(task, false); })
        )
      );
    })
  );
}

// (Org Chart page removed — info available via Executive Leadership & Organizational Structure page)

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

  async function sendMessage(text) {
    if (!text || !text.trim() || sending) return;
    const userMsg = { role: 'user', content: text.trim() };
    const newMessages = messages.concat([userMsg]);
    setMessages(newMessages);
    setInput('');
    setSending(true);

    // Append empty streaming placeholder
    setMessages(prev => prev.concat([{ role: 'assistant', content: '', sources: [], streaming: true }]));

    try {
      // Raw fetch (not the api() helper) because we need the streaming body;
      // the global auth gate still requires the bearer token here.
      const streamHeaders = { 'Content-Type': 'application/json' };
      const sessionToken = getSessionToken();
      if (sessionToken) streamHeaders['Authorization'] = 'Bearer ' + sessionToken;
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: streamHeaders,
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (res.status === 401 && sessionToken) { clearAuthAndReload(); return; }
      if (!res.ok || !res.body) throw new Error('Stream unavailable');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'sources') {
              const srcs = parsed.sources;
              setMessages(prev => {
                const updated = prev.slice();
                const last = updated[updated.length - 1];
                if (last && last.streaming) updated[updated.length - 1] = Object.assign({}, last, { sources: srcs });
                return updated;
              });
            } else if (parsed.type === 'token') {
              const tok = parsed.text;
              setMessages(prev => {
                const updated = prev.slice();
                const last = updated[updated.length - 1];
                if (last && last.streaming) updated[updated.length - 1] = Object.assign({}, last, { content: last.content + tok });
                return updated;
              });
            }
          } catch (e) {}
        }
      }

      // Mark streaming complete
      setMessages(prev => {
        const updated = prev.slice();
        const last = updated[updated.length - 1];
        if (last && last.streaming) updated[updated.length - 1] = Object.assign({}, last, { streaming: false });
        return updated;
      });
    } catch (e) {
      setMessages(prev => {
        const updated = prev.slice();
        const last = updated[updated.length - 1];
        if (last && last.streaming) updated[updated.length - 1] = { role: 'assistant', content: 'An error occurred. Please try again.', sources: [] };
        return updated;
      });
    }

    setSending(false);
  }

  function handleSend() { sendMessage(input); }

  if (!open) {
    return React.createElement('button', {
      onClick: function () { setOpen(true); },
      'data-tour': 'ai-chat',
      className: 'fixed bottom-6 right-6 w-14 h-14 bg-toledo-blue text-white rounded-full shadow-lg hover:bg-toledo-dark transition-colors flex items-center justify-center z-50',
      title: 'AI Assistant',
    }, React.createElement(IconMessageCircle));
  }

  function renderAssistantContent(msg) {
    if (msg.streaming && !msg.content) {
      return React.createElement('span', { className: 'inline-flex gap-1 items-center py-1' },
        React.createElement('span', { className: 'w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce', style: { animationDelay: '0ms' } }),
        React.createElement('span', { className: 'w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce', style: { animationDelay: '150ms' } }),
        React.createElement('span', { className: 'w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce', style: { animationDelay: '300ms' } })
      );
    }
    const html = typeof marked !== 'undefined' ? marked.parse(msg.content || '') : (msg.content || '');
    return React.createElement('div', { className: 'prose prose-sm max-w-none chat-md', dangerouslySetInnerHTML: { __html: html } });
  }

  const starterQuestions = [
    'What should I do on my first day?',
    'Who do I contact for IT issues?',
    'How does door access work?',
    'What is the NIL policy?',
  ];

  return React.createElement('div', { className: 'fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 max-w-[calc(100vw-3rem)]', style: { maxHeight: '540px' } },
    React.createElement('div', { className: 'flex items-center justify-between px-4 py-3 bg-toledo-blue text-white rounded-t-xl flex-shrink-0' },
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
    React.createElement('div', { className: 'px-3 py-2 bg-yellow-50 border-b text-xs text-yellow-700 flex-shrink-0' },
      'Scoped to Toledo Athletics onboarding topics. Responses are AI-generated — verify with your department.'),
    React.createElement('div', { className: 'flex-1 overflow-y-auto p-4 space-y-3', style: { minHeight: '200px', maxHeight: '340px' } },
      messages.length === 0 && React.createElement('div', { className: 'py-2' },
        React.createElement('p', { className: 'text-center text-xs text-gray-400 mb-3' }, 'Try asking:'),
        React.createElement('div', { className: 'space-y-2' },
          starterQuestions.map(function (q, i) {
            return React.createElement('button', {
              key: i,
              onClick: function () { sendMessage(q); },
              className: 'w-full text-left px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-toledo-blue/5 hover:border-toledo-blue/30 transition-colors',
            }, '\uD83D\uDCAC ' + q);
          })
        )
      ),
      messages.map(function (msg, i) {
        var isUser = msg.role === 'user';
        return React.createElement('div', { key: i, className: 'flex ' + (isUser ? 'justify-end' : 'justify-start') },
          React.createElement('div', { className: 'max-w-[85%] px-3 py-2 rounded-lg text-sm ' + (isUser ? 'bg-toledo-blue text-white' : 'bg-gray-100 text-gray-800') },
            isUser
              ? React.createElement('p', { className: 'whitespace-pre-wrap' }, msg.content)
              : renderAssistantContent(msg),
            msg.sources && msg.sources.length > 0 && !msg.streaming && React.createElement('div', { className: 'mt-2 pt-2 border-t border-gray-200' },
              React.createElement('p', { className: 'text-xs font-medium mb-1 text-gray-500' }, 'Sources:'),
              msg.sources.map(function (src, j) {
                return React.createElement('p', { key: j, className: 'text-xs text-gray-400' }, '\u2022 ' + src);
              })
            )
          )
        );
      }),
      React.createElement('div', { ref: messagesEndRef })
    ),
    React.createElement('div', { className: 'p-3 border-t flex gap-2 flex-shrink-0' },
      React.createElement('input', {
        type: 'text', value: input,
        onChange: function (e) { setInput(e.target.value); },
        onKeyDown: function (e) { if (e.key === 'Enter' && !e.shiftKey) handleSend(); },
        placeholder: 'Ask anything about onboarding...',
        disabled: sending,
        className: 'flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue disabled:opacity-50',
      }),
      React.createElement('button', {
        onClick: handleSend, disabled: sending || !input.trim(),
        className: 'p-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark disabled:opacity-50 transition-colors',
      }, React.createElement(IconSend))
    )
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
                link.description && React.createElement('p', { className: 'text-sm text-gray-500 line-clamp-2' }, link.description)
              );
            })
          )
    ),

    // Systems Tab — clickable buttons like Quick Links
    tab === 'systems' && React.createElement('div', null,
      systems.length === 0
        ? React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'No systems available.')
        : React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
            systems.map(function (sys, i) {
              return React.createElement('a', {
                key: sys.id || i,
                href: sys.access_url || '#',
                target: sys.access_url ? '_blank' : undefined,
                rel: sys.access_url ? 'noopener noreferrer' : undefined,
                className: 'bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-toledo-blue/30 transition-all group block',
              },
                React.createElement('div', { className: 'flex items-start justify-between mb-2' },
                  React.createElement('h3', { className: 'font-semibold text-gray-900 group-hover:text-toledo-blue transition-colors text-sm' }, sys.system_name),
                  sys.access_url && React.createElement(IconExternalLink)
                ),
                sys.description && React.createElement('p', { className: 'text-sm text-gray-500 mb-2 line-clamp-2' }, sys.description),
                sys.login_notes && React.createElement('p', { className: 'text-xs text-yellow-700 bg-yellow-50 rounded-lg px-2 py-1' }, '\uD83D\uDCA1 ' + sys.login_notes)
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
                  contact.department && React.createElement('p', { className: 'text-xs text-gray-400' }, contact.department)
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
                  React.createElement('h3', { className: 'font-semibold text-gray-900 text-sm' }, policy.title),
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

// (legacy super-admin view replaced by AdminDashboard in frontend/admin.ts)

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
              { id: 'guide', label: 'My Onboarding' },
              { id: 'resources', label: 'Resources' },
              { id: 'contacts', label: 'Contacts' },
              { id: 'policies', label: 'Policies' },
              { id: 'submit', label: 'Contribute' },
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
function LoadingSplash() {
  return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
    React.createElement('p', { className: 'text-gray-400 text-sm' }, 'Loading…')
  );
}

function App() {
  // Pre-auth landing for password-reset links: /reset-password?token=…
  var resetToken = null;
  try {
    if (window.location.pathname === '/reset-password') {
      resetToken = new URLSearchParams(window.location.search).get('token');
    }
  } catch (e) {}

  var _authState = useState({ loading: true, user: null, mustReset: false });
  var authState = _authState[0];
  var setAuthState = _authState[1];
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
  var tourKey = 'toledo_tour_done_v1';
  var _useState6 = useState(false);
  var showTour = _useState6[0];
  var setShowTour = _useState6[1];

  var currentUser = authState.user;

  // Validate the cached session on boot instead of trusting localStorage.
  useEffect(function () {
    if (resetToken) { setAuthState({ loading: false, user: null, mustReset: false }); return; }
    var token = getSessionToken();
    if (!token) { setAuthState({ loading: false, user: null, mustReset: false }); return; }
    api('/auth/me').then(function (r) {
      if (r.success) {
        finishLogin({ user: r.data.user, must_reset: r.data.must_reset, localstorage_migrated: r.data.localstorage_migrated }, false);
      } else {
        setSessionToken(null);
        setAuthState({ loading: false, user: null, mustReset: false });
      }
    }).catch(function () {
      setAuthState({ loading: false, user: null, mustReset: false });
    });
  }, []);

  useEffect(function () {
    if (!authState.user || authState.mustReset) return;
    api('/categories').then(function (r) { if (r.success) setCategories(r.data); });
    api('/stats').then(function (r) { if (r.success) setStats(r.data); });
  }, [authState.user, authState.mustReset]);

  // One-time import of the legacy localStorage checklist into the database.
  function migrateLocalChecklist(user) {
    var slugs = [];
    try {
      var saved = localStorage.getItem('checklist_' + user.email);
      if (saved) {
        var obj = JSON.parse(saved);
        slugs = Object.keys(obj).filter(function (k) { return obj[k]; });
      }
    } catch (e) {}
    api('/tasks/migrate-local', { method: 'POST', body: JSON.stringify({ slugs: slugs }) }).catch(function () {});
  }

  function afterAuthed(data, fromLoginForm) {
    if (!data.localstorage_migrated) migrateLocalChecklist(data.user);
    if (fromLoginForm) {
      if (data.user.role === 'admin') { navigate('admin'); return; }
      try { if (!localStorage.getItem(tourKey)) setShowTour(true); } catch (e) {}
    }
  }

  function finishLogin(data, fromLoginForm) {
    if (data.token) setSessionToken(data.token);
    try { localStorage.setItem('toledo_auth_user', JSON.stringify(data.user)); } catch (e) {}
    setAuthState({ loading: false, user: data.user, mustReset: !!data.must_reset });
    if (!data.must_reset) afterAuthed(data, fromLoginForm);
  }

  function handleResetComplete(data) {
    try { localStorage.setItem('toledo_auth_user', JSON.stringify(data.user)); } catch (e) {}
    setAuthState({ loading: false, user: data.user, mustReset: false });
    afterAuthed(data, true);
  }

  function navigate(newView, param, pushState) {
    if (pushState !== false) {
      var url = '/' + newView + (param ? '/' + param : '');
      window.history.pushState({ view: newView, param: param || null }, '', url);
    }
    var titles = {
      'home': 'Toledo Athletics Onboarding',
      'guide': 'My Onboarding — Toledo Athletics',
      'categories': 'Browse Categories — Toledo Athletics',
      'checklist': 'My Onboarding — Toledo Athletics',
      'resources': 'Resources & Systems — Toledo Athletics',
      'contacts': 'Key Contacts — Toledo Athletics',
      'policies': 'Policies & Procedures — Toledo Athletics',
      'search': 'Search — Toledo Athletics',
      'submit': 'Contribute — Toledo Athletics',
      'moderate': 'Moderation — Toledo Athletics',
      'admin': 'Admin — Toledo Athletics',
    };
    document.title = titles[newView] || 'Toledo Athletics Onboarding';
    setView(newView);
    setViewParam(param || null);
    window.scrollTo(0, 0);
  }

  useEffect(function () {
    window.history.replaceState({ view: 'home', param: null }, '', window.location.pathname);
    function handlePopState(e) {
      if (e.state && e.state.view) {
        navigate(e.state.view, e.state.param, false);
      } else {
        navigate('home', null, false);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return function () { window.removeEventListener('popstate', handlePopState); };
  }, []);

  function handleSearch(query) {
    navigate('search', query);
  }

  function dismissTour() {
    setShowTour(false);
    try { localStorage.setItem(tourKey, '1'); } catch (e) {}
  }

  function handleSignOut() {
    api('/auth/logout', { method: 'POST' }).catch(function () {});
    setSessionToken(null);
    try { localStorage.removeItem('toledo_auth_user'); } catch (e) {}
    setAuthState({ loading: false, user: null, mustReset: false });
  }

  if (resetToken) {
    return React.createElement(ResetWithTokenScreen, { token: resetToken });
  }
  if (authState.loading) {
    return React.createElement(LoadingSplash);
  }
  if (!currentUser) {
    return React.createElement(LoginScreen, { onLogin: function (data) { finishLogin(data, true); } });
  }
  if (authState.mustReset) {
    return React.createElement(ForceResetScreen, { currentUser: currentUser, onComplete: handleResetComplete, onSignOut: handleSignOut });
  }

  var content;
  switch (view) {
    case 'home':
      content = React.createElement(HomePage, { categories: categories, stats: stats, onNavigate: navigate, onSearch: handleSearch, currentUser: currentUser });
      break;
    case 'guide':
      content = React.createElement(OnboardingGuidePage, { currentUser: currentUser, onNavigate: navigate });
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
    case 'admin':
      content = currentUser.role === 'admin'
        ? React.createElement(AdminDashboard, { currentUser: currentUser, onNavigate: navigate })
        : React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-12 text-center text-gray-500' }, 'You need administrator access for this page.');
      break;
    case 'checklist':
      content = React.createElement(OnboardingGuidePage, { currentUser: currentUser, onNavigate: navigate });
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
      content = React.createElement(HomePage, { categories: categories, stats: stats, onNavigate: navigate, onSearch: handleSearch, currentUser: currentUser });
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex flex-col' },
    showTour && React.createElement(QuickTour, { onDone: dismissTour, onNavigate: navigate }),
    React.createElement(Header, { currentUser: currentUser, onNavigate: navigate, currentView: view, onSignOut: handleSignOut, onStartTour: function () { setShowTour(true); } }),
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
