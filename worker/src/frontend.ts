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

// ── OnboardingGuidePage (unified guide + checklist) ───────────────────────────
function OnboardingGuidePage({ currentUser, onNavigate }) {
  var storageKey = 'checklist_' + (currentUser ? currentUser.email : 'guest');
  var [checked, setChecked] = useState(function () {
    try {
      var saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  var [expandedItem, setExpandedItem] = useState(null);

  function toggle(id) {
    var next = Object.assign({}, checked, { [id]: !checked[id] });
    setChecked(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch (e) {}
  }

  function reset() {
    setChecked({});
    try { localStorage.setItem(storageKey, JSON.stringify({})); } catch (e) {}
  }

  var phases = [
    {
      id: 'first-day',
      label: 'First Day',
      icon: '☀️',
      color: 'border-l-green-500',
      tasks: [
        { id: 'rocket-id', title: 'Get Your Rocket ID & UTAD Account', priority: 'required', description: 'Visit the Rocket Card Office to obtain your campus ID. Your UTAD account is also activated here — you need it for email, Wi-Fi, and all digital resources. Follow the activation link sent to your personal email.' },
        { id: 'mfa', title: 'Set Up Multi-Factor Authentication (MFA)', priority: 'required', description: 'Install Microsoft Authenticator on your phone and register it with your UTAD account. This is required for secure login to university systems.' },
        { id: 'myut', title: 'Activate MyUT Portal Access', priority: 'required', description: 'Log into myut.utoledo.edu to verify your account works. This is your primary gateway to employee self-service — payroll, benefits, and HR tools all live here.' },
        { id: 'meet-team', title: 'Meet Your Team & Supervisor', priority: 'recommended', description: 'Your supervisor will introduce you to your immediate team and provide an overview of daily operations and your first-week schedule.' },
      ]
    },
    {
      id: 'first-week',
      label: 'First Week',
      icon: '📅',
      color: 'border-l-blue-500',
      tasks: [
        { id: 'parking', title: 'Set Up Parking via vPermit', priority: 'required', description: 'Apply for your parking permit through ParkUToledo. Lots near Savage Arena fill fast before 9am. Consider a daily C permit until your A permit arrives. A Permit: $329/year, C Permit: $6.20/day.' },
        { id: 'direct-deposit', title: 'Set Up Direct Deposit & Taxes', priority: 'required', description: 'In MyUT, go to Employee Self-Service to configure direct deposit into your bank account and verify your tax withholding (W-4).' },
        { id: 'facilities-tour', title: 'Tour Athletic Facilities', priority: 'recommended', description: 'Get oriented with all athletic facilities including Savage Arena, Glass Bowl, the Crissey Athletic Complex, and Scott Park. Knowing your way around is essential.' },
        { id: 'systems-training', title: 'Complete Systems Setup', priority: 'required', description: 'Set up Microsoft 365 (Outlook, Teams, OneDrive) via Office.com with your UTAD credentials. If applicable to your role, get access to Teamworks — the athletics department operating platform.' },
      ]
    },
    {
      id: 'first-month',
      label: 'First Month',
      icon: '📋',
      color: 'border-l-purple-500',
      tasks: [
        { id: 'benefits', title: 'Complete Benefits Enrollment', priority: 'required', description: 'You have 30 days from your start date to elect or waive benefits in MyUT. Silence is NOT a waiver — you must actively make selections for health, dental, vision, and life insurance.' },
        { id: 'compliance-training', title: 'Finish All Required Training', priority: 'required', description: 'Complete all mandatory training modules assigned through Blackboard or HR, including NCAA compliance-specific courses. These have hard deadlines.' },
        { id: 'dept-workflows', title: 'Learn Department Workflows', priority: 'recommended', description: 'Understand the standard processes for your role: communication channels, approval workflows, reporting structures, and how Athletics interfaces with the broader university.' },
        { id: 'key-contacts', title: 'Connect with Key Contacts', priority: 'recommended', description: "Build relationships with people you'll work with regularly. Use the Key Contacts page for reference. Introduce yourself, especially to compliance, facilities, and communications staff." },
      ]
    },
    {
      id: 'first-90-days',
      label: 'First 90 Days',
      icon: '🎯',
      color: 'border-l-toledo-gold',
      tasks: [
        { id: 'compliance-policies', title: 'Review All Compliance Policies', priority: 'required', description: 'Read through Standards of Conduct (3364-25-01), FERPA, Information Security policies, and NCAA compliance rules specific to your role. When in doubt, always contact Compliance first.' },
        { id: 'learning-plan', title: 'Build Your Personal Learning Plan', priority: 'recommended', description: 'Use the Video Learning resources to find relevant training and create a personal development plan aligned with your goals and role.' },
        { id: 'supervisor-checkin', title: 'Formal Supervisor Check-In', priority: 'recommended', description: "Schedule a check-in with your supervisor to review your onboarding experience, ask open questions, set 90-day goals, and confirm you're on track." },
        { id: 'toledo-explore', title: 'Explore Toledo Neighborhoods & Resources', priority: 'optional', description: 'Get comfortable with the city. Staff commonly live in areas like Ottawa Hills, Sylvania Township, Perrysburg, and Maumee. Toledo has affordable housing and a growing food/arts scene.' },
      ]
    },
  ];

  var taskLinks = {
    'rocket-id':          { view: 'category', param: 6 },
    'mfa':                { view: 'category', param: 6 },
    'myut':               { view: 'category', param: 6 },
    'systems-training':   { view: 'category', param: 6 },
    'parking':            { view: 'category', param: 7 },
    'direct-deposit':     { view: 'category', param: 5 },
    'benefits':           { view: 'category', param: 5 },
    'meet-team':          { view: 'category', param: 1 },
    'facilities-tour':    { view: 'category', param: 1 },
    'dept-workflows':     { view: 'category', param: 1 },
    'compliance-training':{ view: 'category', param: 2 },
    'compliance-policies':{ view: 'category', param: 2 },
    'key-contacts':       { view: 'contacts',  param: null },
    'toledo-explore':     { view: 'category', param: 9 },
  };

  var allTasks = phases.flatMap(function(p) { return p.tasks; });
  var total = allTasks.length;
  var done = allTasks.filter(function(t) { return checked[t.id]; }).length;
  var pct = Math.round((done / total) * 100);

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

  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8 fade-in' },
    React.createElement('div', { className: 'flex items-center justify-between mb-2' },
      React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark text-sm font-medium' },
        React.createElement(IconArrowLeft), 'Back to Home'),
      React.createElement('button', {
        onClick: reset,
        className: 'text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors',
      }, 'Reset Progress')
    ),
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mt-4 mb-1' }, '🗺️ My Onboarding'),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Work through each phase at your own pace. Expand any task to learn how to complete it, then check it off.'),

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
      done === total && React.createElement('p', { className: 'text-center text-green-600 font-semibold mt-3 text-sm' }, "🎉 You've completed all onboarding tasks!")
    ),

    // Phases
    phases.map(function (phase) {
      var phaseDone = phase.tasks.filter(function(t) { return checked[t.id]; }).length;
      var phaseComplete = phaseDone === phase.tasks.length;
      return React.createElement('div', { key: phase.id, className: 'mb-6' },
        React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
          React.createElement('span', { className: 'text-xl' }, phase.icon),
          React.createElement('h2', { className: 'text-lg font-bold text-gray-900 flex-1' }, phase.label),
          React.createElement('span', { className: 'text-xs font-medium px-2 py-0.5 rounded-full ' + (phaseComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500') },
            phaseDone + '/' + phase.tasks.length
          )
        ),
        React.createElement('div', { className: 'space-y-2' },
          phase.tasks.map(function (task) {
            var isChecked = !!checked[task.id];
            var isExpanded = expandedItem === task.id;
            return React.createElement('div', {
              key: task.id,
              className: 'bg-white rounded-xl border border-gray-200 border-l-4 ' + (priorityStyles[task.priority] || '') +
                (isChecked ? ' opacity-60' : ''),
            },
              // Task header row
              React.createElement('div', { className: 'flex items-center gap-3 p-4' },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: isChecked,
                  onChange: function () { toggle(task.id); },
                  className: 'w-4 h-4 rounded border-gray-300 text-toledo-blue focus:ring-toledo-blue cursor-pointer flex-shrink-0',
                }),
                React.createElement('button', {
                  onClick: function () { setExpandedItem(isExpanded ? null : task.id); },
                  className: 'flex-1 flex items-center justify-between text-left min-w-0 group',
                },
                  React.createElement('span', {
                    className: 'text-sm font-medium ' + (isChecked ? 'line-through text-gray-400' : 'text-gray-900 group-hover:text-toledo-blue'),
                  }, task.title),
                  React.createElement('div', { className: 'flex items-center gap-2 flex-shrink-0 ml-3' },
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
                taskLinks[task.id] && React.createElement('button', {
                  onClick: function () {
                    var link = taskLinks[task.id];
                    onNavigate(link.view, link.param);
                  },
                  className: 'mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-toledo-blue hover:text-toledo-dark border border-toledo-blue/30 hover:border-toledo-blue hover:bg-toledo-blue/5 px-3 py-1.5 rounded-lg transition-colors',
                }, '📂 Explore full details →')
              )
            );
          })
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
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

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

// ── SuperAdminDashboard ───────────────────────────────────────────────────────
function SuperAdminDashboard({ currentUser, onNavigate }) {
  var _useState = useState([]);
  var submissions = _useState[0];
  var setSubmissions = _useState[1];
  var _useState2 = useState([]);
  var users = _useState2[0];
  var setUsers = _useState2[1];
  var _useState3 = useState('submissions');
  var tab = _useState3[0];
  var setTab = _useState3[1];
  var _useState4 = useState('pending');
  var filter = _useState4[0];
  var setFilter = _useState4[1];
  var _useState5 = useState(null);
  var processing = _useState5[0];
  var setProcessing = _useState5[1];
  var _useState6 = useState('');
  var reviewNotes = _useState6[0];
  var setReviewNotes = _useState6[1];

  function loadSubmissions() {
    api('/submissions?status=' + filter).then(function (r) { if (r.success) setSubmissions(r.data || []); });
  }
  function loadUsers() {
    api('/users').then(function (r) { if (r.success) setUsers(r.data || []); });
  }

  useEffect(function () {
    loadSubmissions();
    loadUsers();
  }, [filter]);

  function handleAction(id, action) {
    setProcessing(id);
    api('/submissions/' + id + '/' + action, {
      method: 'PUT',
      body: JSON.stringify({ reviewed_by: currentUser.id, review_notes: reviewNotes }),
    }).then(function () {
      setReviewNotes('');
      setProcessing(null);
      loadSubmissions();
    });
  }

  return React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('div', { className: 'flex items-center gap-3 mb-1' },
      React.createElement('span', { className: 'text-2xl' }, '\uD83D\uDD12'),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Super Admin Dashboard')
    ),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Manage submissions, tips, and users across the platform.'),

    // Tabs
    React.createElement('div', { className: 'flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit' },
      [
        { id: 'submissions', label: '\uD83D\uDCDD Submissions' },
        { id: 'users', label: '\uD83D\uDC65 Users' },
      ].map(function (t) {
        return React.createElement('button', {
          key: t.id,
          onClick: function () { setTab(t.id); },
          className: 'px-4 py-1.5 rounded-md text-sm font-medium transition-colors ' + (tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'),
        }, t.label);
      })
    ),

    // Submissions Tab
    tab === 'submissions' && React.createElement('div', null,
      React.createElement('div', { className: 'flex gap-2 mb-4' },
        ['pending', 'approved', 'rejected'].map(function (s) {
          return React.createElement('button', {
            key: s, onClick: function () { setFilter(s); },
            className: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
              (filter === s
                ? (s === 'pending' ? 'bg-orange-100 text-orange-700' : s === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'),
          }, s.charAt(0).toUpperCase() + s.slice(1));
        })
      ),
      submissions.length === 0
        ? React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'No ' + filter + ' submissions.')
        : React.createElement('div', { className: 'space-y-4' },
            submissions.map(function (item) {
              return React.createElement('div', { key: item.id, className: 'bg-white rounded-xl border border-gray-200 p-5' },
                React.createElement('div', { className: 'flex items-start justify-between mb-3' },
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('h3', { className: 'font-semibold text-gray-900' },
                      item.proposed_title || (item.article_title ? 'Edit: ' + item.article_title : 'Submission #' + item.id)
                    ),
                    React.createElement('div', { className: 'flex flex-wrap gap-3 mt-1 text-xs text-gray-500' },
                      React.createElement('span', null, 'By: ' + (item.author_email || 'Unknown')),
                      React.createElement('span', null, new Date(item.submitted_at).toLocaleString())
                    )
                  ),
                  React.createElement('span', {
                    className: 'ml-3 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ' +
                      (item.status === 'pending' ? 'bg-orange-100 text-orange-700' : item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'),
                  }, item.status)
                ),
                React.createElement('div', { className: 'bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto mb-3' },
                  item.proposed_content || item.content
                ),
                item.review_notes && React.createElement('div', { className: 'bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mb-3' },
                  React.createElement('strong', null, 'Review notes: '), item.review_notes
                ),
                filter === 'pending' && React.createElement('div', { className: 'space-y-3' },
                  React.createElement('textarea', {
                    value: processing === item.id ? reviewNotes : '',
                    onChange: function (e) { setProcessing(item.id); setReviewNotes(e.target.value); },
                    placeholder: 'Optional review notes...',
                    rows: 2,
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue',
                  }),
                  React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('button', {
                      onClick: function () { handleAction(item.id, 'approve'); },
                      disabled: !!processing,
                      className: 'flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50',
                    }, React.createElement(IconCheck), 'Approve & Publish'),
                    React.createElement('button', {
                      onClick: function () { handleAction(item.id, 'reject'); },
                      disabled: !!processing,
                      className: 'flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50',
                    }, React.createElement(IconX), 'Reject')
                  )
                )
              );
            })
          )
    ),

    // Users Tab
    tab === 'users' && React.createElement('div', null,
      React.createElement('p', { className: 'text-sm text-gray-500 mb-4' }, 'Total users: ' + users.length),
      users.length === 0
        ? React.createElement('p', { className: 'text-center text-gray-400 py-8' }, 'No users registered.')
        : React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 overflow-hidden' },
            React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null,
                React.createElement('tr', { className: 'bg-gray-50 border-b border-gray-200' },
                  React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Email'),
                  React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Role'),
                  React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Joined')
                )
              ),
              React.createElement('tbody', null,
                users.map(function (u) {
                  return React.createElement('tr', { key: u.id, className: 'border-b border-gray-100 last:border-0' },
                    React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-900' }, u.email),
                    React.createElement('td', { className: 'px-4 py-3' },
                      React.createElement('span', {
                        className: 'px-2 py-0.5 rounded-full text-xs font-medium ' +
                          (u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'moderator' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'),
                      }, u.role)
                    ),
                    React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, new Date(u.created_at).toLocaleDateString())
                  );
                })
              )
            )
          )
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
function App() {
  var _useState = useState(function () {
    try {
      var saved = localStorage.getItem('toledo_auth_user');
      if (saved) { var u = JSON.parse(saved); _currentUserId = u.id; return u; }
    } catch (e) {}
    return null;
  });
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
  var tourKey = 'toledo_tour_done_v1';
  var _useState6 = useState(function () {
    try { return !localStorage.getItem(tourKey); } catch (e) { return false; }
  });
  var showTour = _useState6[0];
  var setShowTour = _useState6[1];

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
      'guide': 'My Onboarding — Toledo Athletics',
      'categories': 'Browse Categories — Toledo Athletics',
      'checklist': 'My Onboarding — Toledo Athletics',
      'resources': 'Resources & Systems — Toledo Athletics',
      'contacts': 'Key Contacts — Toledo Athletics',
      'policies': 'Policies & Procedures — Toledo Athletics',
      'search': 'Search — Toledo Athletics',
      'submit': 'Contribute — Toledo Athletics',
      'moderate': 'Moderation — Toledo Athletics',
      'admin': 'Super Admin — Toledo Athletics',
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

  function handleLogin(user) {
    _currentUserId = user.id;
    setCurrentUser(user);
    try { localStorage.setItem('toledo_auth_user', JSON.stringify(user)); } catch (e) {}
    // Superadmin: redirect to admin dashboard (role set by server)
    if (user.role === 'admin') {
      navigate('admin');
      return;
    }
    // Show tour only for brand-new users (no tour flag set yet)
    try { if (!localStorage.getItem(tourKey)) setShowTour(true); } catch (e) {}
  }

  function dismissTour() {
    setShowTour(false);
    try { localStorage.setItem(tourKey, '1'); } catch (e) {}
  }

  function handleSignOut() {
    _currentUserId = null;
    setCurrentUser(null);
    try { localStorage.removeItem('toledo_auth_user'); } catch (e) {}
  }

  if (!currentUser) {
    return React.createElement(LoginScreen, { onLogin: handleLogin });
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
      content = React.createElement(SuperAdminDashboard, { currentUser: currentUser, onNavigate: navigate });
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
      content = React.createElement(HomePage, { categories: categories, stats: stats, onNavigate: navigate, onSearch: handleSearch });
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
