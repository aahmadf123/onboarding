// Admin CMS views: AdminDashboard shell + Users / Tasks / Approvals /
// Content / Email Log / Settings sections.
//
// NOTE: this code ships inside a template literal and is compiled in the
// browser by Babel — never use backticks or dollar-brace interpolation in
// the generated code; concatenate strings instead.

export function getAdminCode(): string {
  return `
// ── Admin shared bits ─────────────────────────────────────────────────────────
function AdminModal({ title, onClose, children, wide }) {
  return React.createElement('div', { className: 'fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' },
    React.createElement('div', { className: 'bg-white rounded-xl shadow-xl w-full ' + (wide ? 'max-w-3xl' : 'max-w-lg') + ' max-h-[90vh] overflow-y-auto' },
      React.createElement('div', { className: 'flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl' },
        React.createElement('h3', { className: 'font-semibold text-gray-900' }, title),
        React.createElement('button', { onClick: onClose, className: 'text-gray-400 hover:text-gray-600' }, React.createElement(IconX))
      ),
      React.createElement('div', { className: 'p-6' }, children)
    )
  );
}

function AdminField({ label, children, hint }) {
  return React.createElement('div', { className: 'mb-4' },
    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, label),
    children,
    hint && React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, hint)
  );
}

var adminInputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-toledo-blue';
var adminBtnPrimary = 'px-4 py-2 bg-toledo-blue text-white rounded-lg text-sm font-medium hover:bg-toledo-dark disabled:opacity-50';
var adminBtnSecondary = 'px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50';

function statusPill(status) {
  var map = {
    invited: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    disabled: 'bg-gray-200 text-gray-500',
  };
  return React.createElement('span', { className: 'px-2 py-0.5 rounded-full text-xs font-medium ' + (map[status] || 'bg-gray-100 text-gray-600') }, status);
}

function rolePill(role) {
  var map = {
    admin: 'bg-purple-100 text-purple-700',
    moderator: 'bg-blue-100 text-blue-700',
    staff: 'bg-gray-100 text-gray-600',
  };
  return React.createElement('span', { className: 'px-2 py-0.5 rounded-full text-xs font-medium ' + (map[role] || '') }, role);
}

// ── Passcode reveal (after invite / re-invite) ───────────────────────────────
function PasscodeReveal({ data, onClose }) {
  var _copied = useState(false);
  var copied = _copied[0];
  var setCopied = _copied[1];
  function copy() {
    try {
      navigator.clipboard.writeText(data.passcode).then(function () { setCopied(true); });
    } catch (e) {}
  }
  return React.createElement(AdminModal, { title: 'One-time passcode', onClose: onClose },
    React.createElement('p', { className: 'text-sm text-gray-600 mb-3' },
      'Share this passcode with ' + data.email + ' — they sign in with it and will be asked to set their own password. It is shown only once and expires in 14 days.'),
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement('code', { className: 'flex-1 text-lg font-bold tracking-widest bg-gray-100 rounded-lg px-4 py-3 text-center' }, data.passcode),
      React.createElement('button', { onClick: copy, className: adminBtnSecondary }, copied ? '✓ Copied' : 'Copy')
    ),
    React.createElement('div', { className: 'bg-amber-50 rounded-lg p-3 text-xs text-amber-700 mb-4' },
      'An invite email was also sent — but while the from-address is the resend.dev sandbox, emails are only delivered to the Resend account owner. Hand the passcode over directly until a custom domain is verified in Settings.'),
    React.createElement('button', { onClick: onClose, className: adminBtnPrimary + ' w-full' }, 'Done')
  );
}

// ── Users section ─────────────────────────────────────────────────────────────
function AdminUsers({ currentUser }) {
  var _users = useState(null);
  var users = _users[0];
  var setUsers = _users[1];
  var _showInvite = useState(false);
  var showInvite = _showInvite[0];
  var setShowInvite = _showInvite[1];
  var _reveal = useState(null);
  var reveal = _reveal[0];
  var setReveal = _reveal[1];
  var _busy = useState(null);
  var busy = _busy[0];
  var setBusy = _busy[1];
  var _error = useState('');
  var error = _error[0];
  var setError = _error[1];

  function load() {
    api('/admin/users').then(function (r) { if (r.success) setUsers(r.data || []); });
  }
  useEffect(load, []);

  function updateUser(id, patch) {
    setBusy(id);
    api('/admin/users/' + id, { method: 'PUT', body: JSON.stringify(patch) }).then(function (r) {
      setBusy(null);
      if (r.success) load();
      else setError(r.error || 'Update failed');
    });
  }

  function reinvite(user) {
    if (!window.confirm('Generate a new passcode for ' + user.email + '? Their current sessions and password will stop working.')) return;
    setBusy(user.id);
    api('/admin/users/' + user.id + '/reinvite', { method: 'POST' }).then(function (r) {
      setBusy(null);
      if (r.success) { setReveal({ email: user.email, passcode: r.data.passcode }); load(); }
      else setError(r.error || 'Re-invite failed');
    });
  }

  if (users === null) return React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Loading…');

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('p', { className: 'text-sm text-gray-500' }, users.length + ' users'),
      React.createElement('button', { onClick: function () { setShowInvite(true); }, className: adminBtnPrimary }, '+ Invite User')
    ),
    error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
    React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 overflow-x-auto' },
      React.createElement('table', { className: 'w-full min-w-[640px]' },
        React.createElement('thead', null,
          React.createElement('tr', { className: 'bg-gray-50 border-b border-gray-200' },
            ['User', 'Role', 'Status', 'Last login', 'Actions'].map(function (h) {
              return React.createElement('th', { key: h, className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, h);
            })
          )
        ),
        React.createElement('tbody', null,
          users.map(function (u) {
            var isSelf = currentUser && u.id === currentUser.id;
            return React.createElement('tr', { key: u.id, className: 'border-b border-gray-100 last:border-0' },
              React.createElement('td', { className: 'px-4 py-3' },
                React.createElement('p', { className: 'text-sm text-gray-900' }, u.name || u.email),
                u.name && React.createElement('p', { className: 'text-xs text-gray-400' }, u.email)
              ),
              React.createElement('td', { className: 'px-4 py-3' },
                isSelf ? rolePill(u.role) : React.createElement('select', {
                  value: u.role,
                  disabled: busy === u.id,
                  onChange: function (e) { updateUser(u.id, { role: e.target.value }); },
                  className: 'text-xs border border-gray-200 rounded-lg px-2 py-1',
                },
                  ['staff', 'moderator', 'admin'].map(function (r) { return React.createElement('option', { key: r, value: r }, r); })
                )
              ),
              React.createElement('td', { className: 'px-4 py-3' }, statusPill(u.status)),
              React.createElement('td', { className: 'px-4 py-3 text-xs text-gray-500' }, u.last_login_at ? new Date(u.last_login_at).toLocaleString() : '—'),
              React.createElement('td', { className: 'px-4 py-3' },
                React.createElement('div', { className: 'flex gap-2' },
                  u.status !== 'disabled' && React.createElement('button', {
                    onClick: function () { reinvite(u); },
                    disabled: busy === u.id,
                    className: 'text-xs text-toledo-blue hover:underline disabled:opacity-50',
                  }, 'Re-invite'),
                  !isSelf && React.createElement('button', {
                    onClick: function () {
                      var disable = u.status !== 'disabled';
                      if (disable && !window.confirm('Disable ' + u.email + '? They will be signed out immediately.')) return;
                      updateUser(u.id, { status: disable ? 'disabled' : 'active' });
                    },
                    disabled: busy === u.id,
                    className: 'text-xs ' + (u.status === 'disabled' ? 'text-green-600' : 'text-red-500') + ' hover:underline disabled:opacity-50',
                  }, u.status === 'disabled' ? 'Enable' : 'Disable')
                )
              )
            );
          })
        )
      )
    ),
    showInvite && React.createElement(InviteUserModal, {
      onClose: function () { setShowInvite(false); },
      onInvited: function (data) { setShowInvite(false); setReveal(data); load(); },
    }),
    reveal && React.createElement(PasscodeReveal, { data: reveal, onClose: function () { setReveal(null); } })
  );
}

function InviteUserModal({ onClose, onInvited }) {
  var _email = useState('');
  var email = _email[0];
  var setEmail = _email[1];
  var _name = useState('');
  var name = _name[0];
  var setName = _name[1];
  var _role = useState('staff');
  var role = _role[0];
  var setRole = _role[1];
  var _loading = useState(false);
  var loading = _loading[0];
  var setLoading = _loading[1];
  var _error = useState('');
  var error = _error[0];
  var setError = _error[1];

  function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    api('/admin/users', { method: 'POST', body: JSON.stringify({ email: email, name: name, role: role }) })
      .then(function (r) {
        setLoading(false);
        if (r.success) onInvited({ email: r.data.user.email, passcode: r.data.passcode });
        else setError(r.error || 'Invite failed');
      });
  }

  return React.createElement(AdminModal, { title: 'Invite a user', onClose: onClose },
    React.createElement('form', { onSubmit: submit },
      React.createElement(AdminField, { label: 'Email' },
        React.createElement('input', { type: 'email', required: true, value: email, onChange: function (e) { setEmail(e.target.value); }, placeholder: 'their.name@utoledo.edu', className: adminInputCls })
      ),
      React.createElement(AdminField, { label: 'Name (optional)' },
        React.createElement('input', { type: 'text', value: name, onChange: function (e) { setName(e.target.value); }, className: adminInputCls })
      ),
      React.createElement(AdminField, { label: 'Role' },
        React.createElement('select', { value: role, onChange: function (e) { setRole(e.target.value); }, className: adminInputCls },
          ['staff', 'moderator', 'admin'].map(function (r) { return React.createElement('option', { key: r, value: r }, r); })
        )
      ),
      error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
      React.createElement('div', { className: 'flex gap-2 justify-end' },
        React.createElement('button', { type: 'button', onClick: onClose, className: adminBtnSecondary }, 'Cancel'),
        React.createElement('button', { type: 'submit', disabled: loading, className: adminBtnPrimary }, loading ? 'Inviting…' : 'Invite & Generate Passcode')
      )
    )
  );
}

// ── Tasks section ─────────────────────────────────────────────────────────────
var ADMIN_PHASES = [
  { id: 'first-day', label: 'First Day' },
  { id: 'first-week', label: 'First Week' },
  { id: 'first-month', label: 'First Month' },
  { id: 'first-90-days', label: 'First 90 Days' },
];

function AdminTasks() {
  var _tasks = useState(null);
  var tasks = _tasks[0];
  var setTasks = _tasks[1];
  var _editing = useState(null); // null | 'new' | task object
  var editing = _editing[0];
  var setEditing = _editing[1];
  var _assigning = useState(null);
  var assigning = _assigning[0];
  var setAssigning = _assigning[1];
  var _notice = useState('');
  var notice = _notice[0];
  var setNotice = _notice[1];

  function load() {
    api('/admin/tasks').then(function (r) { if (r.success) setTasks(r.data || []); });
  }
  useEffect(load, []);

  function deactivate(task) {
    if (!window.confirm('Hide "' + task.title + '" for everyone? Existing progress is kept.')) return;
    api('/admin/tasks/' + task.id, { method: 'DELETE' }).then(load);
  }

  if (tasks === null) return React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Loading…');

  function taskRow(t) {
    return React.createElement('div', { key: t.id, className: 'bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-3' + (t.is_active ? '' : ' opacity-50') },
      React.createElement('div', { className: 'min-w-0' },
        React.createElement('div', { className: 'flex flex-wrap items-center gap-2' },
          React.createElement('p', { className: 'text-sm font-semibold text-gray-900' }, t.title),
          React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500' }, t.priority),
          !!t.requires_approval && React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700' }, '🔏 needs sign-off'),
          t.audience === 'assigned' && React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full bg-toledo-gold/20 text-toledo-blue' }, '📌 assigned only'),
          !t.is_active && React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500' }, 'hidden')
        ),
        t.description && React.createElement('p', { className: 'text-xs text-gray-500 mt-1 line-clamp-2' }, t.description)
      ),
      React.createElement('div', { className: 'flex gap-2 flex-shrink-0' },
        React.createElement('button', { onClick: function () { setAssigning(t); }, className: 'text-xs text-toledo-blue hover:underline' }, 'Assign'),
        React.createElement('button', { onClick: function () { setEditing(t); }, className: 'text-xs text-gray-500 hover:underline' }, 'Edit'),
        !!t.is_active && React.createElement('button', { onClick: function () { deactivate(t); }, className: 'text-xs text-red-500 hover:underline' }, 'Hide')
      )
    );
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('p', { className: 'text-sm text-gray-500' }, 'Required steps apply to everyone; assigned-only tasks reach just the people you pick.'),
      React.createElement('button', { onClick: function () { setEditing('new'); }, className: adminBtnPrimary }, '+ New Task')
    ),
    notice && React.createElement('p', { className: 'text-green-600 text-sm mb-3' }, notice),
    ADMIN_PHASES.map(function (phase) {
      var phaseTasks = tasks.filter(function (t) { return t.phase === phase.id; });
      if (phaseTasks.length === 0) return null;
      return React.createElement('div', { key: phase.id, className: 'mb-6' },
        React.createElement('h3', { className: 'text-sm font-bold text-gray-700 mb-2' }, phase.label),
        React.createElement('div', { className: 'space-y-2' }, phaseTasks.map(taskRow))
      );
    }),
    editing && React.createElement(TaskFormModal, {
      task: editing === 'new' ? null : editing,
      onClose: function () { setEditing(null); },
      onSaved: function () { setEditing(null); load(); },
    }),
    assigning && React.createElement(AssignTaskModal, {
      task: assigning,
      onClose: function () { setAssigning(null); },
      onAssigned: function (n) {
        setAssigning(null);
        setNotice('Assigned to ' + n + ' user' + (n === 1 ? '' : 's') + ' — notification emails sent.');
        setTimeout(function () { setNotice(''); }, 4000);
      },
    })
  );
}

function TaskFormModal({ task, onClose, onSaved }) {
  var _form = useState({
    title: task ? task.title : '',
    phase: task ? task.phase : 'first-day',
    priority: task ? task.priority : 'recommended',
    audience: task ? task.audience : 'all',
    description: task ? (task.description || '') : '',
    display_order: task ? task.display_order : 0,
    requires_approval: task ? !!task.requires_approval : false,
    link_view: task ? (task.link_view || '') : '',
    link_param: task ? (task.link_param || '') : '',
    is_active: task ? !!task.is_active : true,
  });
  var form = _form[0];
  var setForm = _form[1];
  var _loading = useState(false);
  var loading = _loading[0];
  var setLoading = _loading[1];
  var _error = useState('');
  var error = _error[0];
  var setError = _error[1];

  function set(key, value) {
    setForm(function (f) { var n = Object.assign({}, f); n[key] = value; return n; });
  }

  function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    var payload = Object.assign({}, form, {
      display_order: Number(form.display_order) || 0,
      link_view: form.link_view || null,
      link_param: form.link_param || null,
    });
    var req = task
      ? api('/admin/tasks/' + task.id, { method: 'PUT', body: JSON.stringify(payload) })
      : api('/admin/tasks', { method: 'POST', body: JSON.stringify(payload) });
    req.then(function (r) {
      setLoading(false);
      if (r.success) onSaved();
      else setError(r.error || 'Save failed');
    });
  }

  return React.createElement(AdminModal, { title: task ? 'Edit task' : 'New task', onClose: onClose, wide: true },
    React.createElement('form', { onSubmit: submit },
      React.createElement(AdminField, { label: 'Title' },
        React.createElement('input', { type: 'text', required: true, value: form.title, onChange: function (e) { set('title', e.target.value); }, className: adminInputCls })
      ),
      React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
        React.createElement(AdminField, { label: 'Phase' },
          React.createElement('select', { value: form.phase, onChange: function (e) { set('phase', e.target.value); }, className: adminInputCls },
            ADMIN_PHASES.map(function (p) { return React.createElement('option', { key: p.id, value: p.id }, p.label); })
          )
        ),
        React.createElement(AdminField, { label: 'Priority' },
          React.createElement('select', { value: form.priority, onChange: function (e) { set('priority', e.target.value); }, className: adminInputCls },
            ['required', 'recommended', 'optional'].map(function (p) { return React.createElement('option', { key: p, value: p }, p); })
          )
        )
      ),
      React.createElement(AdminField, { label: 'Description' },
        React.createElement('textarea', { rows: 3, value: form.description, onChange: function (e) { set('description', e.target.value); }, className: adminInputCls })
      ),
      React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
        React.createElement(AdminField, { label: 'Audience', hint: '"Everyone" shows in all checklists; "Assigned only" reaches just the people you assign.' },
          React.createElement('select', { value: form.audience, onChange: function (e) { set('audience', e.target.value); }, className: adminInputCls },
            React.createElement('option', { value: 'all' }, 'Everyone'),
            React.createElement('option', { value: 'assigned' }, 'Assigned only')
          )
        ),
        React.createElement(AdminField, { label: 'Display order' },
          React.createElement('input', { type: 'number', value: form.display_order, onChange: function (e) { set('display_order', e.target.value); }, className: adminInputCls })
        )
      ),
      React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
        React.createElement(AdminField, { label: 'Link view (optional)', hint: 'Where "Explore full details" points.' },
          React.createElement('select', { value: form.link_view, onChange: function (e) { set('link_view', e.target.value); }, className: adminInputCls },
            React.createElement('option', { value: '' }, 'No link'),
            React.createElement('option', { value: 'category' }, 'Category (set id below)'),
            React.createElement('option', { value: 'contacts' }, 'Contacts page'),
            React.createElement('option', { value: 'resources' }, 'Resources page'),
            React.createElement('option', { value: 'policies' }, 'Policies page')
          )
        ),
        React.createElement(AdminField, { label: 'Link parameter' },
          React.createElement('input', { type: 'text', value: form.link_param, onChange: function (e) { set('link_param', e.target.value); }, placeholder: 'e.g. 6 for IT & Campus Access', className: adminInputCls })
        )
      ),
      React.createElement('div', { className: 'flex items-center gap-6 mb-4' },
        React.createElement('label', { className: 'flex items-center gap-2 text-sm text-gray-700 cursor-pointer' },
          React.createElement('input', { type: 'checkbox', checked: form.requires_approval, onChange: function (e) { set('requires_approval', e.target.checked); } }),
          'Requires admin sign-off'
        ),
        task && React.createElement('label', { className: 'flex items-center gap-2 text-sm text-gray-700 cursor-pointer' },
          React.createElement('input', { type: 'checkbox', checked: form.is_active, onChange: function (e) { set('is_active', e.target.checked); } }),
          'Visible'
        )
      ),
      error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
      React.createElement('div', { className: 'flex gap-2 justify-end' },
        React.createElement('button', { type: 'button', onClick: onClose, className: adminBtnSecondary }, 'Cancel'),
        React.createElement('button', { type: 'submit', disabled: loading, className: adminBtnPrimary }, loading ? 'Saving…' : 'Save Task')
      )
    )
  );
}

function AssignTaskModal({ task, onClose, onAssigned }) {
  var _users = useState(null);
  var users = _users[0];
  var setUsers = _users[1];
  var _selected = useState({});
  var selected = _selected[0];
  var setSelected = _selected[1];
  var _loading = useState(false);
  var loading = _loading[0];
  var setLoading = _loading[1];
  var _error = useState('');
  var error = _error[0];
  var setError = _error[1];

  useEffect(function () {
    api('/admin/users').then(function (r) {
      if (r.success) setUsers((r.data || []).filter(function (u) { return u.status !== 'disabled'; }));
    });
  }, []);

  function toggleUser(id) {
    setSelected(function (s) { var n = Object.assign({}, s); n[id] = !n[id]; return n; });
  }

  function submit() {
    var ids = Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number);
    if (ids.length === 0) { setError('Pick at least one person.'); return; }
    setLoading(true); setError('');
    api('/admin/tasks/' + task.id + '/assign', { method: 'POST', body: JSON.stringify({ user_ids: ids }) })
      .then(function (r) {
        setLoading(false);
        if (r.success) onAssigned(r.data.assigned);
        else setError(r.error || 'Assignment failed');
      });
  }

  return React.createElement(AdminModal, { title: 'Assign "' + task.title + '"', onClose: onClose },
    React.createElement('p', { className: 'text-xs text-gray-500 mb-3' }, 'Each selected person gets this task in their checklist and an email notification.'),
    users === null
      ? React.createElement('p', { className: 'text-gray-400 text-sm' }, 'Loading…')
      : React.createElement('div', { className: 'max-h-64 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100 mb-4' },
          users.map(function (u) {
            return React.createElement('label', { key: u.id, className: 'flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50' },
              React.createElement('input', { type: 'checkbox', checked: !!selected[u.id], onChange: function () { toggleUser(u.id); } }),
              React.createElement('span', { className: 'text-sm text-gray-800 flex-1' }, (u.name ? u.name + ' — ' : '') + u.email),
              statusPill(u.status)
            );
          })
        ),
    error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
    React.createElement('div', { className: 'flex gap-2 justify-end' },
      React.createElement('button', { onClick: onClose, className: adminBtnSecondary }, 'Cancel'),
      React.createElement('button', { onClick: submit, disabled: loading, className: adminBtnPrimary }, loading ? 'Assigning…' : 'Assign & Notify')
    )
  );
}

// ── Approvals section ─────────────────────────────────────────────────────────
function AdminApprovals({ onCountChange }) {
  var _tab = useState('tasks');
  var tab = _tab[0];
  var setTab = _tab[1];
  var _items = useState(null);
  var items = _items[0];
  var setItems = _items[1];
  var _notes = useState({});
  var notes = _notes[0];
  var setNotes = _notes[1];
  var _busy = useState(null);
  var busy = _busy[0];
  var setBusy = _busy[1];

  var load = useCallback(function () {
    setItems(null);
    if (tab === 'tasks') {
      api('/admin/approvals').then(function (r) {
        if (r.success) { setItems(r.data || []); if (onCountChange) onCountChange(r.data.length); }
      });
    } else if (tab === 'submissions') {
      api('/submissions?status=pending').then(function (r) { if (r.success) setItems(r.data || []); });
    } else {
      api('/tips/queue?status=pending').then(function (r) { if (r.success) setItems(r.data || []); });
    }
  }, [tab]);

  useEffect(function () { load(); }, [load]);

  function setNote(id, value) {
    setNotes(function (n) { var copy = Object.assign({}, n); copy[id] = value; return copy; });
  }

  function decideTask(item, approve) {
    var note = notes[item.id] || '';
    if (!approve && !note.trim()) { window.alert('Add a note explaining what to fix before sending it back.'); return; }
    setBusy(item.id);
    api('/admin/approvals/' + item.id + '/' + (approve ? 'approve' : 'reject'), {
      method: 'PUT',
      body: JSON.stringify({ note: note }),
    }).then(function () { setBusy(null); load(); });
  }

  function decideContent(item, action) {
    setBusy(item.id);
    var base = tab === 'submissions' ? '/submissions/' : '/tips/';
    api(base + item.id + '/' + action, {
      method: 'PUT',
      body: JSON.stringify({ review_notes: notes[item.id] || '' }),
    }).then(function () { setBusy(null); load(); });
  }

  var tabs = [
    { id: 'tasks', label: '🔏 Task sign-offs' },
    { id: 'submissions', label: '📝 Submissions' },
    { id: 'tips', label: '💡 Tips' },
  ];

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit' },
      tabs.map(function (t) {
        return React.createElement('button', {
          key: t.id,
          onClick: function () { setTab(t.id); },
          className: 'px-4 py-1.5 rounded-md text-sm font-medium transition-colors ' + (tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'),
        }, t.label);
      })
    ),
    items === null
      ? React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Loading…')
      : items.length === 0
        ? React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Nothing waiting for review. 🎉')
        : React.createElement('div', { className: 'space-y-4' },
            items.map(function (item) {
              var isTask = tab === 'tasks';
              return React.createElement('div', { key: item.id, className: 'bg-white rounded-xl border border-gray-200 p-5' },
                React.createElement('div', { className: 'flex items-start justify-between mb-3' },
                  React.createElement('div', null,
                    React.createElement('h3', { className: 'font-semibold text-gray-900' },
                      isTask ? item.task_title : (item.proposed_title || item.title || (item.article_title ? 'Edit: ' + item.article_title : 'Item #' + item.id))
                    ),
                    React.createElement('p', { className: 'text-xs text-gray-500 mt-1' },
                      isTask
                        ? (item.user_name ? item.user_name + ' — ' : '') + item.user_email + ' · marked complete ' + (item.completed_at ? new Date(item.completed_at).toLocaleString() : '')
                        : 'By: ' + (item.author_email || 'Unknown') + ' · ' + new Date(item.submitted_at).toLocaleString()
                    )
                  ),
                  isTask && React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0' }, item.task_phase)
                ),
                !isTask && React.createElement('div', { className: 'bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto mb-3' },
                  item.proposed_content || item.content
                ),
                React.createElement('textarea', {
                  value: notes[item.id] || '',
                  onChange: function (e) { setNote(item.id, e.target.value); },
                  placeholder: isTask ? 'Note to the employee (required when sending back)…' : 'Optional review notes…',
                  rows: 2,
                  className: adminInputCls + ' mb-3',
                }),
                React.createElement('div', { className: 'flex gap-2' },
                  React.createElement('button', {
                    onClick: function () { isTask ? decideTask(item, true) : decideContent(item, 'approve'); },
                    disabled: busy === item.id,
                    className: 'flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50',
                  }, React.createElement(IconCheck), isTask ? 'Approve' : 'Approve & Publish'),
                  React.createElement('button', {
                    onClick: function () { isTask ? decideTask(item, false) : decideContent(item, 'reject'); },
                    disabled: busy === item.id,
                    className: 'flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50',
                  }, React.createElement(IconX), isTask ? 'Send back' : 'Reject')
                )
              );
            })
          )
  );
}

// ── Content (CMS) section ─────────────────────────────────────────────────────
var CONTENT_ENTITIES = [
  { id: 'articles', label: '📄 Articles', titleField: 'title', fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category_id', label: 'Category', type: 'category' },
      { key: 'current_content', label: 'Content (Markdown)', type: 'markdown' },
  ]},
  { id: 'categories', label: '🗂 Categories', titleField: 'name', fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
  ]},
  { id: 'contacts', label: '👥 Contacts', titleField: 'function_area', fields: [
      { key: 'function_area', label: 'Function area', type: 'text', required: true },
      { key: 'contact_name', label: 'Contact name', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
      { key: 'display_order', label: 'Display order', type: 'number' },
  ]},
  { id: 'quicklinks', label: '🔗 Quick Links', titleField: 'title', fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'audience', label: 'Audience', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'display_order', label: 'Display order', type: 'number' },
  ]},
  { id: 'systems', label: '💻 Systems', titleField: 'system_name', fields: [
      { key: 'system_name', label: 'System name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'access_url', label: 'Access URL', type: 'text' },
      { key: 'login_notes', label: 'Login notes', type: 'textarea' },
      { key: 'owner_department', label: 'Owner department', type: 'text' },
      { key: 'support_contact', label: 'Support contact', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'display_order', label: 'Display order', type: 'number' },
  ]},
  { id: 'policies', label: '📋 Policies', titleField: 'title', fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'policy_code', label: 'Policy code', type: 'text' },
      { key: 'applies_to', label: 'Applies to', type: 'text' },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'display_order', label: 'Display order', type: 'number' },
  ]},
];

function AdminContent() {
  var _entity = useState('articles');
  var entityId = _entity[0];
  var setEntityId = _entity[1];
  var _rows = useState(null);
  var rows = _rows[0];
  var setRows = _rows[1];
  var _editing = useState(null); // null | 'new' | row
  var editing = _editing[0];
  var setEditing = _editing[1];
  var _categories = useState([]);
  var categories = _categories[0];
  var setCategories = _categories[1];

  var entity = CONTENT_ENTITIES.find(function (e) { return e.id === entityId; });

  var load = useCallback(function () {
    setRows(null);
    api('/admin/content/' + entityId).then(function (r) { if (r.success) setRows(r.data || []); });
  }, [entityId]);

  useEffect(function () { load(); }, [load]);
  useEffect(function () {
    api('/categories').then(function (r) { if (r.success) setCategories(r.data || []); });
  }, []);

  function remove(row) {
    var label = row[entity.titleField] || ('#' + row.id);
    if (!window.confirm(entityId === 'categories'
      ? 'Delete category "' + label + '"? Only possible when no articles use it.'
      : 'Hide "' + label + '" from the site?')) return;
    api('/admin/content/' + entityId + '/' + row.id, { method: 'DELETE' }).then(function (r) {
      if (!r.success && r.error) window.alert(r.error);
      load();
    });
  }

  function restore(row) {
    api('/admin/content/' + entityId + '/' + row.id, { method: 'PUT', body: JSON.stringify({ is_active: 1 }) }).then(load);
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex flex-wrap gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit' },
      CONTENT_ENTITIES.map(function (e) {
        return React.createElement('button', {
          key: e.id,
          onClick: function () { setEntityId(e.id); setEditing(null); },
          className: 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' + (entityId === e.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'),
        }, e.label);
      })
    ),
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('p', { className: 'text-sm text-gray-500' }, 'Changes go live immediately — no redeploy needed.'),
      React.createElement('button', { onClick: function () { setEditing('new'); }, className: adminBtnPrimary }, '+ Add')
    ),
    rows === null
      ? React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Loading…')
      : rows.length === 0
        ? React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Nothing here yet.')
        : React.createElement('div', { className: 'space-y-2' },
            rows.map(function (row) {
              var hidden = row.is_active !== undefined && !row.is_active;
              return React.createElement('div', { key: row.id, className: 'bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3' + (hidden ? ' opacity-50' : '') },
                React.createElement('div', { className: 'min-w-0' },
                  React.createElement('p', { className: 'text-sm font-semibold text-gray-900 truncate' }, row[entity.titleField] || '(untitled)'),
                  React.createElement('p', { className: 'text-xs text-gray-400 truncate' },
                    (hidden ? 'hidden · ' : '') +
                    (row.contact_name || row.url || row.summary || row.description || row.access_url || (row.current_content ? row.current_content.substring(0, 80) : '') || '')
                  )
                ),
                React.createElement('div', { className: 'flex gap-2 flex-shrink-0' },
                  React.createElement('button', { onClick: function () { setEditing(row); }, className: 'text-xs text-toledo-blue hover:underline' }, 'Edit'),
                  hidden
                    ? React.createElement('button', { onClick: function () { restore(row); }, className: 'text-xs text-green-600 hover:underline' }, 'Restore')
                    : React.createElement('button', { onClick: function () { remove(row); }, className: 'text-xs text-red-500 hover:underline' }, entityId === 'categories' ? 'Delete' : 'Hide')
                )
              );
            })
          ),
    editing && React.createElement(ContentFormModal, {
      entity: entity,
      row: editing === 'new' ? null : editing,
      categories: categories,
      onClose: function () { setEditing(null); },
      onSaved: function () { setEditing(null); load(); },
    })
  );
}

function ContentFormModal({ entity, row, categories, onClose, onSaved }) {
  var initial = {};
  entity.fields.forEach(function (f) {
    initial[f.key] = row && row[f.key] != null ? row[f.key] : (f.type === 'number' ? 0 : '');
  });
  var _form = useState(initial);
  var form = _form[0];
  var setForm = _form[1];
  var _loading = useState(false);
  var loading = _loading[0];
  var setLoading = _loading[1];
  var _error = useState('');
  var error = _error[0];
  var setError = _error[1];
  var _preview = useState(false);
  var preview = _preview[0];
  var setPreview = _preview[1];

  function set(key, value) {
    setForm(function (f) { var n = Object.assign({}, f); n[key] = value; return n; });
  }

  function insertMap(key) {
    set(key, (form[key] || '') + '\\n\\n::map https://www.google.com/maps?q=Thompson+Student+Union,+Toledo,+OH&output=embed\\n');
  }

  function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    var payload = {};
    entity.fields.forEach(function (f) {
      var v = form[f.key];
      if (f.type === 'number') v = Number(v) || 0;
      if (f.type === 'category') v = v ? Number(v) : null;
      payload[f.key] = v;
    });
    var req = row
      ? api('/admin/content/' + entity.id + '/' + row.id, { method: 'PUT', body: JSON.stringify(payload) })
      : api('/admin/content/' + entity.id, { method: 'POST', body: JSON.stringify(payload) });
    req.then(function (r) {
      setLoading(false);
      if (r.success) onSaved();
      else setError(r.error || 'Save failed');
    });
  }

  function renderField(f) {
    if (f.type === 'textarea') {
      return React.createElement('textarea', { rows: 3, value: form[f.key], onChange: function (e) { set(f.key, e.target.value); }, className: adminInputCls });
    }
    if (f.type === 'markdown') {
      return React.createElement('div', null,
        React.createElement('div', { className: 'flex gap-2 mb-2' },
          React.createElement('button', { type: 'button', onClick: function () { setPreview(!preview); }, className: 'text-xs text-toledo-blue hover:underline' }, preview ? 'Hide preview' : 'Show preview'),
          React.createElement('button', { type: 'button', onClick: function () { insertMap(f.key); }, className: 'text-xs text-toledo-blue hover:underline', title: 'Inserts a ::map line — replace the URL with your Google Maps embed link' }, '+ Insert map embed')
        ),
        React.createElement('div', { className: preview ? 'grid grid-cols-2 gap-3' : '' },
          React.createElement('textarea', { rows: 14, value: form[f.key], onChange: function (e) { set(f.key, e.target.value); }, className: adminInputCls + ' font-mono text-xs' }),
          preview && React.createElement('div', {
            className: 'prose prose-sm max-w-none border border-gray-100 rounded-lg p-3 overflow-y-auto bg-gray-50',
            style: { maxHeight: '340px' },
            dangerouslySetInnerHTML: { __html: typeof marked !== 'undefined' ? marked.parse(renderMapDirectives(form[f.key] || '')) : '' },
          })
        ),
        React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, 'Tip: a line like "::map <google-maps-embed-url>" becomes an embedded map on the article page.')
      );
    }
    if (f.type === 'category') {
      return React.createElement('select', { value: form[f.key] || '', onChange: function (e) { set(f.key, e.target.value); }, className: adminInputCls },
        React.createElement('option', { value: '' }, '— none —'),
        categories.map(function (cat) { return React.createElement('option', { key: cat.id, value: cat.id }, cat.name); })
      );
    }
    return React.createElement('input', {
      type: f.type === 'number' ? 'number' : 'text',
      required: !!f.required,
      value: form[f.key],
      onChange: function (e) { set(f.key, e.target.value); },
      className: adminInputCls,
    });
  }

  return React.createElement(AdminModal, { title: (row ? 'Edit ' : 'New ') + entity.label.replace(/^[^ ]+ /, ''), onClose: onClose, wide: true },
    React.createElement('form', { onSubmit: submit },
      entity.fields.map(function (f) {
        return React.createElement(AdminField, { key: f.key, label: f.label + (f.required ? ' *' : '') }, renderField(f));
      }),
      error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
      React.createElement('div', { className: 'flex gap-2 justify-end' },
        React.createElement('button', { type: 'button', onClick: onClose, className: adminBtnSecondary }, 'Cancel'),
        React.createElement('button', { type: 'submit', disabled: loading, className: adminBtnPrimary }, loading ? 'Saving…' : 'Save')
      )
    )
  );
}

// ── Email log section ─────────────────────────────────────────────────────────
function AdminEmailLog() {
  var _rows = useState(null);
  var rows = _rows[0];
  var setRows = _rows[1];
  var _type = useState('');
  var type = _type[0];
  var setType = _type[1];
  var _status = useState('');
  var status = _status[0];
  var setStatus = _status[1];
  var _expanded = useState(null);
  var expanded = _expanded[0];
  var setExpanded = _expanded[1];

  useEffect(function () {
    var qs = [];
    if (type) qs.push('type=' + type);
    if (status) qs.push('status=' + status);
    api('/admin/email-log' + (qs.length ? '?' + qs.join('&') : '')).then(function (r) {
      if (r.success) setRows(r.data || []);
    });
  }, [type, status]);

  var typeOptions = ['', 'invite', 'password_reset', 'task_assigned', 'weekly_reminder', 'approval_decision', 'test'];

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex gap-2 mb-4' },
      React.createElement('select', { value: type, onChange: function (e) { setType(e.target.value); }, className: 'text-sm border border-gray-200 rounded-lg px-2 py-1.5' },
        typeOptions.map(function (t) { return React.createElement('option', { key: t, value: t }, t || 'All types'); })
      ),
      React.createElement('select', { value: status, onChange: function (e) { setStatus(e.target.value); }, className: 'text-sm border border-gray-200 rounded-lg px-2 py-1.5' },
        ['', 'sent', 'error'].map(function (s) { return React.createElement('option', { key: s, value: s }, s || 'All statuses'); })
      )
    ),
    rows === null
      ? React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Loading…')
      : rows.length === 0
        ? React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'No emails logged yet.')
        : React.createElement('div', { className: 'bg-white rounded-xl border border-gray-200 overflow-x-auto' },
            React.createElement('table', { className: 'w-full min-w-[640px]' },
              React.createElement('thead', null,
                React.createElement('tr', { className: 'bg-gray-50 border-b border-gray-200' },
                  ['When', 'To', 'Type', 'Status', 'Subject'].map(function (h) {
                    return React.createElement('th', { key: h, className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, h);
                  })
                )
              ),
              React.createElement('tbody', null,
                rows.map(function (row) {
                  return React.createElement(React.Fragment, { key: row.id },
                    React.createElement('tr', {
                      className: 'border-b border-gray-100 last:border-0' + (row.status === 'error' ? ' bg-red-50/50 cursor-pointer' : ''),
                      onClick: function () { if (row.status === 'error') setExpanded(expanded === row.id ? null : row.id); },
                    },
                      React.createElement('td', { className: 'px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap' }, new Date(row.created_at + 'Z').toLocaleString()),
                      React.createElement('td', { className: 'px-4 py-2.5 text-xs text-gray-800' }, row.to_email),
                      React.createElement('td', { className: 'px-4 py-2.5 text-xs text-gray-500' }, row.email_type),
                      React.createElement('td', { className: 'px-4 py-2.5' },
                        React.createElement('span', { className: 'px-2 py-0.5 rounded-full text-xs font-medium ' + (row.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') }, row.status)
                      ),
                      React.createElement('td', { className: 'px-4 py-2.5 text-xs text-gray-500 truncate max-w-[220px]' }, row.subject || '')
                    ),
                    expanded === row.id && row.error_text && React.createElement('tr', { className: 'bg-red-50' },
                      React.createElement('td', { colSpan: 5, className: 'px-4 py-2 text-xs text-red-700 whitespace-pre-wrap' }, row.error_text)
                    )
                  );
                })
              )
            )
          )
  );
}

// ── Settings section ──────────────────────────────────────────────────────────
function AdminSettings() {
  var _cfg = useState(null);
  var cfg = _cfg[0];
  var setCfg = _cfg[1];
  var _saving = useState(false);
  var saving = _saving[0];
  var setSaving = _saving[1];
  var _notice = useState('');
  var notice = _notice[0];
  var setNotice = _notice[1];
  var _error = useState('');
  var error = _error[0];
  var setError = _error[1];

  useEffect(function () {
    api('/admin/settings').then(function (r) { if (r.success) setCfg(r.data); });
  }, []);

  function set(key, value) {
    setCfg(function (c) { var n = Object.assign({}, c); n[key] = value; return n; });
  }

  function save(e) {
    e.preventDefault();
    setSaving(true); setNotice(''); setError('');
    api('/admin/settings', { method: 'PUT', body: JSON.stringify(cfg) }).then(function (r) {
      setSaving(false);
      if (r.success) { setCfg(r.data); setNotice('Settings saved.'); }
      else setError(r.error || 'Save failed');
    });
  }

  function sendTest() {
    setNotice(''); setError('');
    api('/admin/settings/test-email', { method: 'POST' }).then(function (r) {
      if (r.success) setNotice(r.message || 'Test email sent.');
      else setError(r.error || 'Test email failed — check the Email Log.');
    });
  }

  if (cfg === null) return React.createElement('p', { className: 'text-gray-400 py-8 text-center' }, 'Loading…');

  return React.createElement('form', { onSubmit: save, className: 'max-w-xl' },
    React.createElement(AdminField, { label: 'Email from-address', hint: 'onboarding@resend.dev only delivers to the Resend account owner. After verifying a domain in the Resend dashboard, change this to e.g. onboarding@yourdomain.com — no redeploy needed.' },
      React.createElement('input', { type: 'text', value: cfg.email_from_address, onChange: function (e) { set('email_from_address', e.target.value); }, className: adminInputCls })
    ),
    React.createElement(AdminField, { label: 'Email from-name' },
      React.createElement('input', { type: 'text', value: cfg.email_from_name, onChange: function (e) { set('email_from_name', e.target.value); }, className: adminInputCls })
    ),
    React.createElement(AdminField, { label: 'Portal base URL', hint: 'Used for links inside emails.' },
      React.createElement('input', { type: 'text', value: cfg.app_base_url, onChange: function (e) { set('app_base_url', e.target.value); }, className: adminInputCls })
    ),
    React.createElement('label', { className: 'flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-4' },
      React.createElement('input', {
        type: 'checkbox',
        checked: cfg.weekly_reminder_enabled === '1',
        onChange: function (e) { set('weekly_reminder_enabled', e.target.checked ? '1' : '0'); },
      }),
      'Send weekly reminder emails (Mondays) to users with open required or assigned tasks'
    ),
    notice && React.createElement('p', { className: 'text-green-600 text-sm mb-3' }, notice),
    error && React.createElement('p', { className: 'text-red-500 text-sm mb-3' }, error),
    React.createElement('div', { className: 'flex gap-2' },
      React.createElement('button', { type: 'submit', disabled: saving, className: adminBtnPrimary }, saving ? 'Saving…' : 'Save Settings'),
      React.createElement('button', { type: 'button', onClick: sendTest, className: adminBtnSecondary }, 'Send me a test email')
    )
  );
}

// ── AdminDashboard shell ──────────────────────────────────────────────────────
function AdminDashboard({ currentUser, onNavigate }) {
  var _section = useState('users');
  var section = _section[0];
  var setSection = _section[1];
  var _pending = useState(0);
  var pendingCount = _pending[0];
  var setPendingCount = _pending[1];

  useEffect(function () {
    api('/admin/approvals').then(function (r) { if (r.success) setPendingCount((r.data || []).length); });
  }, []);

  var sections = [
    { id: 'users', label: '👥 Users' },
    { id: 'tasks', label: '✅ Tasks' },
    { id: 'approvals', label: '🔏 Approvals' + (pendingCount > 0 ? ' (' + pendingCount + ')' : '') },
    { id: 'content', label: '📚 Content' },
    { id: 'email', label: '✉️ Email Log' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  var body;
  if (section === 'users') body = React.createElement(AdminUsers, { currentUser: currentUser });
  else if (section === 'tasks') body = React.createElement(AdminTasks);
  else if (section === 'approvals') body = React.createElement(AdminApprovals, { onCountChange: setPendingCount });
  else if (section === 'content') body = React.createElement(AdminContent);
  else if (section === 'email') body = React.createElement(AdminEmailLog);
  else body = React.createElement(AdminSettings);

  return React.createElement('div', { className: 'max-w-6xl mx-auto px-4 py-8 fade-in' },
    React.createElement('button', { onClick: function () { onNavigate('home'); }, className: 'flex items-center gap-2 text-toledo-blue hover:text-toledo-dark mb-6 text-sm font-medium' },
      React.createElement(IconArrowLeft), 'Back to Home'),
    React.createElement('div', { className: 'flex items-center gap-3 mb-1' },
      React.createElement('span', { className: 'text-2xl' }, '🔒'),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Super Admin')
    ),
    React.createElement('p', { className: 'text-gray-500 text-sm mb-6' }, 'Manage users, tasks, approvals, and every piece of site content.'),
    React.createElement('div', { className: 'flex flex-col md:flex-row gap-6' },
      React.createElement('nav', { className: 'md:w-48 flex md:flex-col gap-1 flex-wrap' },
        sections.map(function (s) {
          return React.createElement('button', {
            key: s.id,
            onClick: function () { setSection(s.id); },
            className: 'px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ' + (section === s.id ? 'bg-toledo-blue text-white' : 'text-gray-600 hover:bg-gray-100'),
          }, s.label);
        })
      ),
      React.createElement('div', { className: 'flex-1 min-w-0' }, body)
    )
  );
}
`;
}
