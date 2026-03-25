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

// ── AIHubPage ─────────────────────────────────────────────────────────────────
// Pre-built custom assessment questions per role
var ASSESSMENT_QUESTIONS = {
  Coach: [
    { question: 'A high school recruit messages you on social media asking about your program. What steps do you take before responding, and what NCAA rules apply to this contact?', category: 'Recruiting Compliance' },
    { question: 'You notice an athletics booster offering to take a prospective student-athlete out for dinner during an unofficial visit. How do you handle this situation?', category: 'Booster Rules' },
    { question: 'A student-athlete on your team has been offered a NIL deal from a local business. What do you need to know about NIL rules, and what should you advise them?', category: 'NIL Fundamentals' },
    { question: 'One of your athletes seems withdrawn and their performance has dropped significantly. What is the proper protocol for referring them to mental health support?', category: 'Mental Health Referral' },
    { question: 'How do you ensure your team practice hours stay within CARA (Countable Athletically Related Activities) limits, and what tools do you use to log them?', category: 'CARA Logging' },
  ],
  Administrator: [
    { question: 'A new employee asks you to help them get set up with university systems. Walk through the correct order of account setup from Rocket ID to full MyUT access.', category: 'IT Setup' },
    { question: 'An employee missed the 30-day benefits enrollment window and wants to sign up now. What are their options, and what policy applies?', category: 'HR Processes' },
    { question: 'You receive an email asking for a student-athlete academic record to share with a media outlet. How do you handle this under FERPA guidelines?', category: 'General Compliance' },
    { question: 'A colleague is creating a department flyer and asks whether to use the University blue or the Athletics blue. How do you advise them on brand standards?', category: 'Campus Navigation' },
    { question: 'Someone reports witnessing potential harassment in the workplace. What is the proper reporting procedure and which offices need to be involved?', category: 'Title IX Basics' },
  ],
  'Compliance Officer': [
    { question: 'A coach reports that a booster provided transportation to a recruit during a visit without prior approval. What steps do you take to investigate and report this?', category: 'NCAA Bylaws' },
    { question: 'A student-athlete has signed an NIL deal that may conflict with a university sponsorship. How do you evaluate this under current NIL governance rules?', category: 'NIL Advanced' },
    { question: 'Walk through how you would use Teamworks Compliance / ARMS to monitor and document recruiting contacts for an upcoming evaluation period.', category: 'ARMS Platform' },
    { question: 'A Title IX complaint has been filed involving a student-athlete and a staff member. What is the compliance office role versus the Title IX coordinator role?', category: 'Title IX Advanced' },
    { question: 'An alumni group wants to start a booster organization to support the athletics department. What compliance framework needs to be established before they can operate?', category: 'Booster Management' },
  ],
  'Athletic Trainer': [
    { question: 'A student-athlete discloses suicidal thoughts to you during a treatment session. What is the immediate protocol and who do you contact?', category: 'Mental Health Protocol' },
    { question: 'A coach pressures you to clear an athlete for competition even though you have concerns about their injury recovery. How do you handle this situation?', category: 'SASS Services' },
    { question: 'An athlete is transferring to another university and requests their medical records. What rules govern this transfer of information?', category: 'Eligibility Rules' },
    { question: 'How do you document and track concussion protocols using department systems, and what reporting requirements exist for return-to-play decisions?', category: 'Academic Support' },
    { question: 'A student-athlete wants to participate in a charity run organized by a local business as part of an NIL deal. What considerations apply from a sports medicine perspective?', category: 'Career Development' },
  ],
  'Academic Advisor': [
    { question: 'A student-athlete is falling behind in classes and is at risk of losing eligibility. What support services through SASS can you connect them with?', category: 'SASS Services' },
    { question: 'A student-athlete is considering transferring. What are the current eligibility rules for transfers, and what information can you share with the student and receiving institution?', category: 'Eligibility Rules' },
    { question: 'An athlete tells you they are experiencing severe anxiety and it is affecting their academic performance. What mental health referral pathway do you follow?', category: 'Mental Health Protocol' },
    { question: 'A senior student-athlete is preparing for life after college sports. What career development resources and NIL-related opportunities can you guide them toward?', category: 'Career Development' },
    { question: 'How do you coordinate with compliance to ensure that academic support activities do not inadvertently create CARA violations?', category: 'Academic Support' },
  ],
  'Operations Staff': [
    { question: 'A visiting team arrives for a competition and their bus needs parking near the venue. Walk through how you coordinate this using campus logistics and parking systems.', category: 'Parking Systems' },
    { question: 'You discover a facilities issue (water leak) in the athletics building on a game day. What is your escalation procedure through work control?', category: 'Facility Management' },
    { question: 'You are planning a home game event that requires coordination with multiple departments. What steps do you take for event operations planning?', category: 'Event Operations' },
    { question: 'A media crew needs temporary access to restricted areas of the athletics facility. How do you handle door access and credential requests?', category: 'Campus Logistics' },
    { question: 'During a compliance training session, you learn about new NCAA rules that might affect how events are managed. How do you apply compliance awareness to operations?', category: 'General Compliance' },
  ],
};

function AIHubPage({ currentUser, onNavigate }) {
  var _useState = useState(null);
  var selectedRole = _useState[0];
  var setSelectedRole = _useState[1];
  var _useState2 = useState(0);
  var questionIndex = _useState2[0];
  var setQuestionIndex = _useState2[1];
  var _useState3 = useState([]);
  var answers = _useState3[0];
  var setAnswers = _useState3[1];
  var _useState4 = useState('');
  var answer = _useState4[0];
  var setAnswer = _useState4[1];
  var _useState5 = useState(false);
  var loading = _useState5[0];
  var setLoading = _useState5[1];
  var _useState6 = useState(null);
  var evaluation = _useState6[0];
  var setEvaluation = _useState6[1];
  var _useState7 = useState(null);
  var pastResults = _useState7[0];
  var setPastResults = _useState7[1];
  var _useState8 = useState(false);
  var showPast = _useState8[0];
  var setShowPast = _useState8[1];
  var _useState9 = useState(null);
  var aiError = _useState9[0];
  var setAiError = _useState9[1];

  useEffect(function () {
    if (currentUser) {
      api('/ai/assessment/results/' + encodeURIComponent(currentUser.id)).then(function (r) {
        if (r.success && r.data) setPastResults(r.data);
      });
    }
  }, [currentUser]);

  function startAssessment(role) {
    setSelectedRole(role);
    setQuestionIndex(0);
    setAnswers([]);
    setEvaluation(null);
    setAiError(null);
  }

  function submitAnswer() {
    if (!answer.trim()) return;
    var currentAnswer = answer.trim();
    var questions = ASSESSMENT_QUESTIONS[selectedRole] || [];
    var newAnswers = answers.concat([currentAnswer]);
    setAnswers(newAnswers);
    setAnswer('');

    // If all questions answered, send to AI for evaluation
    if (newAnswers.length >= questions.length) {
      setLoading(true);
      // Build messages from Q&A for AI evaluation
      var messages = [];
      for (var i = 0; i < questions.length; i++) {
        messages.push({ role: 'assistant', content: questions[i].question });
        if (newAnswers[i]) messages.push({ role: 'user', content: newAnswers[i] });
      }
      api('/ai/assessment/answer', {
        method: 'POST',
        body: JSON.stringify({
          role_archetype: selectedRole,
          messages: messages,
          is_last_answer: true,
        }),
      }).then(function (r) {
        setLoading(false);
        if (r.success && r.data && r.data.evaluation) {
          setEvaluation(r.data.evaluation);
          if (currentUser) {
            api('/ai/assessment/save', {
              method: 'POST',
              body: JSON.stringify({
                user_id: currentUser.id,
                role_archetype: selectedRole,
                overall_level: r.data.evaluation.overall_level || 'beginner',
                score_data: r.data.evaluation.score_data || {},
                learning_plan: r.data.evaluation.learning_plan || '',
              }),
            });
          }
        } else {
          setAiError('Unable to evaluate your responses. The AI service may be temporarily unavailable. Your answers have been recorded.');
        }
      }).catch(function () {
        setLoading(false);
        setAiError('Unable to connect to the AI evaluation service. Please try again later.');
      });
    } else {
      setQuestionIndex(newAnswers.length);
    }
  }

  // Role selection screen
  if (!selectedRole && !showPast) {
    return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8 fade-in' },
      React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
        React.createElement(IconArrowLeft), 'Back to Home'),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1' },
        React.createElement(IconSparkles), 'AI Literacy Assessment'),
      React.createElement('p', { className: 'text-gray-500 text-sm mb-2' }, 'Assess your knowledge with scenario-based questions tailored to your role. AI evaluates your responses.'),
      React.createElement('div', { className: 'bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-yellow-800' },
        '⚠️ This assessment is for self-development purposes only, not for HR evaluation. Results are private and meant to guide your learning.'),
      pastResults && pastResults.length > 0 && React.createElement('button', {
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
                  result.completed_at && React.createElement('span', { className: 'text-xs text-gray-400' }, new Date(result.completed_at).toLocaleDateString())
                ),
                result.overall_level && React.createElement('p', { className: 'text-sm mb-2' },
                  React.createElement('span', { className: 'font-medium text-gray-700' }, 'Level: '),
                  React.createElement('span', { className: 'text-toledo-blue font-semibold capitalize' }, result.overall_level)
                ),
                result.learning_plan && React.createElement('p', { className: 'text-sm text-gray-600' }, result.learning_plan)
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
        evaluation.overall_level && React.createElement('div', { className: 'mb-4 p-4 bg-toledo-blue/5 rounded-lg' },
          React.createElement('p', { className: 'text-sm text-gray-600' }, 'Your AI Literacy Level:'),
          React.createElement('p', { className: 'text-2xl font-bold text-toledo-blue mt-1 capitalize' }, evaluation.overall_level)
        ),
        evaluation.score_data && Object.keys(evaluation.score_data).length > 0 && React.createElement('div', { className: 'mb-4' },
          React.createElement('h3', { className: 'font-semibold text-gray-900 mb-2' }, 'Skill Breakdown'),
          React.createElement('div', { className: 'space-y-2' },
            Object.entries(evaluation.score_data).map(function (entry, i) {
              var cat = entry[0]; var data = entry[1];
              return React.createElement('div', { key: i, className: 'flex items-start gap-2 text-sm' },
                React.createElement('span', { className: 'font-medium text-gray-700 min-w-0 flex-1' }, (data && data.score !== undefined ? '[' + data.score + '/5] ' : '') + cat),
                data && data.feedback && React.createElement('span', { className: 'text-gray-500 flex-1' }, data.feedback)
              );
            })
          )
        ),
        evaluation.learning_plan && React.createElement('div', { className: 'bg-blue-50 rounded-lg p-4' },
          React.createElement('h3', { className: 'font-semibold text-gray-900 mb-2' }, 'Recommended Next Steps'),
          React.createElement('p', { className: 'text-sm text-gray-700' }, evaluation.learning_plan)
        )
      )
    );
  }

  // Assessment question flow with pre-built questions
  var questions = ASSESSMENT_QUESTIONS[selectedRole] || [];
  var currentQ = questions[questionIndex];

  if (aiError) {
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8 fade-in' },
      React.createElement('button', { onClick: function () { setSelectedRole(null); setAiError(null); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
        React.createElement(IconArrowLeft), 'Back to Role Selection'),
      React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-6 text-center' },
        React.createElement('p', { className: 'text-gray-700 mb-4' }, aiError),
        React.createElement('button', {
          onClick: function () { setSelectedRole(null); setAiError(null); },
          className: 'px-6 py-2 bg-toledo-blue text-white rounded-lg hover:bg-toledo-dark text-sm font-medium',
        }, 'Try Again')
      )
    );
  }

  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { setSelectedRole(null); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Cancel Assessment'),
    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 p-6' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
        React.createElement(IconSparkles),
        React.createElement('h2', { className: 'font-semibold text-gray-900' }, 'AI Literacy Assessment'),
        React.createElement('span', { className: 'ml-auto px-2 py-0.5 bg-toledo-blue/10 text-toledo-blue text-xs rounded-full' }, selectedRole)
      ),
      // Progress bar
      React.createElement('div', { className: 'mb-4' },
        React.createElement('div', { className: 'flex justify-between text-xs text-gray-500 mb-1' },
          React.createElement('span', null, 'Question ' + (questionIndex + 1) + ' of ' + questions.length),
          React.createElement('span', null, Math.round(((questionIndex) / questions.length) * 100) + '% complete')
        ),
        React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-2' },
          React.createElement('div', { className: 'bg-toledo-blue h-2 rounded-full transition-all', style: { width: ((questionIndex) / questions.length * 100) + '%' } })
        )
      ),
      loading
        ? React.createElement('div', { className: 'text-center py-8 text-gray-500' }, 'Evaluating your responses with AI...')
        : React.createElement('div', null,
            currentQ && React.createElement('div', { className: 'mb-4' },
              React.createElement('span', { className: 'inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full mb-2' }, currentQ.category),
              React.createElement('div', { className: 'p-4 bg-gray-50 rounded-lg' },
                React.createElement('p', { className: 'text-sm text-gray-700' }, currentQ.question)
              )
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
            }, questionIndex + 1 >= questions.length ? 'Submit & Get AI Evaluation' : 'Submit Answer')
          ),
      questionIndex === 0 && React.createElement('p', { className: 'mt-4 text-xs text-gray-400 text-center' },
        'Note: This is a self-development exercise, NOT an HR evaluation.')
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
  var _useState9 = useState(null);
  var searchError = _useState9[0];
  var setSearchError = _useState9[1];
  var isMod = currentUser && (currentUser.role === 'moderator' || currentUser.role === 'admin');

  useEffect(function () {
    if (currentUser && tab === 'plan') {
      setLoadingPlan(true);
      api('/youtube/plan/' + encodeURIComponent(currentUser.id)).then(function (r) {
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
    setSearchError(null);
    api('/youtube/search?q=' + encodeURIComponent(query.trim())).then(function (r) {
      setSearching(false);
      if (r.success && r.data) {
        setVideos(Array.isArray(r.data) ? r.data : r.data.videos || []);
        setSearchError(null);
      } else {
        setVideos([]);
        setSearchError(r.error || 'Search failed. Please try again.');
      }
    }).catch(function () {
      setSearching(false);
      setVideos([]);
      setSearchError('An error occurred while searching. Please try again.');
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
      searchError && React.createElement('div', { className: 'mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700' },
        '⚠️ ' + searchError
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
                  href: 'https://www.youtube.com/watch?v=' + encodeURIComponent(videoId),
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
                    href: 'https://www.youtube.com/watch?v=' + encodeURIComponent(item.youtube_video_id),
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
              { id: 'ai-hub', label: 'AI Hub' },
              { id: 'youtube', label: 'Learning' },
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
      'ai-hub': 'AI Literacy Assessment — Toledo Athletics',
      'youtube': 'Video Learning — Toledo Athletics',
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
    case 'ai-hub':
      content = React.createElement(AIHubPage, { currentUser: currentUser, onNavigate: navigate });
      break;
    case 'youtube':
      content = React.createElement(YouTubeFinderPage, { currentUser: currentUser, onNavigate: navigate });
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
