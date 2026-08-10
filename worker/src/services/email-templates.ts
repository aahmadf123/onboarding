// Email templates. Every dynamic value in the HTML must pass through
// escapeHtml; the plaintext part must never be escaped (a text body reading
// "Rockets &amp; Co" is the classic bug here).
//
// Every template returns both parts. They are written side by side rather than
// derived from one another because a text part generated from this styled
// markup reads like markup, and that is exactly what filters score.

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const PORTAL_NAME = 'Toledo Athletics Onboarding Portal';
const FOOTER = 'This message was sent by the Toledo Athletics Onboarding Portal.';

const MAX_SUBJECT_LENGTH = 120;

// Subjects can embed admin-entered text (e.g. task titles) — keep them
// single-line and bounded so providers don't reject malformed headers.
function subjectSafe(value: string): string {
  const flat = String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return flat.length > MAX_SUBJECT_LENGTH ? `${flat.slice(0, MAX_SUBJECT_LENGTH - 1)}…` : flat;
}

export function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function button(href: string, label: string): string {
  return (
    `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" ` +
    'style="display:inline-block;background:#0B2240;color:white;padding:12px 24px;' +
    `border-radius:8px;text-decoration:none;font-weight:600;">${escapeHtml(label)}</a></p>`
  );
}

/**
 * A call to action whose destination is visible.
 *
 * button() alone renders a link whose text ("Open the Onboarding Portal")
 * never matches its href. Anchor-text/href mismatch is a standard phishing
 * heuristic, and mail from this domain cannot afford to trip it. Printing the
 * URL underneath is the pattern passwordResetEmail already used.
 */
function linkBlock(href: string, label: string): string {
  return (
    button(href, label) +
    `<p style="font-size:12px;color:#6b7280;word-break:break-all;">Or copy this link: ${escapeHtml(
      href
    )}</p>`
  );
}

function layout(bodyHtml: string): string {
  return [
    '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">',
    '<div style="background:#0B2240;color:white;padding:24px;text-align:center;border-radius:8px 8px 0 0;">',
    '<h1 style="margin:0;font-size:20px;">Toledo Athletics Onboarding</h1>',
    '</div>',
    '<div style="padding:24px;background:white;border:1px solid #e5e7eb;border-radius:0 0 8px 8px;">',
    bodyHtml,
    `<p style="color:#6b7280;font-size:12px;margin-top:24px;">${FOOTER}</p>`,
    '</div>',
    '</div>',
  ].join('');
}

function displayName(name: string | null, email: string): string {
  return name && name.trim() ? name : email.split('@')[0];
}

function greeting(name: string | null, email: string): string {
  return `<p>Hi ${escapeHtml(displayName(name, email))},</p>`;
}

/** Joins plaintext paragraphs and appends the same footer the layout adds. */
function textBody(paragraphs: string[]): string {
  return [...paragraphs, '--', FOOTER].join('\n\n');
}

/**
 * The invite deliberately carries no credential.
 *
 * It used to print the one-time passcode next to a sign-in button. Coming from
 * a young domain that resembles utrockets.com, that is indistinguishable from
 * a phishing campaign against the university, and Microsoft 365 quarantines it
 * accordingly. The passcode is shown once to the admin in Admin > Users and
 * handed over directly instead.
 */
export function inviteEmail(opts: {
  name: string | null;
  email: string;
  baseUrl: string;
  expiryDays: number;
}): EmailContent {
  const who = displayName(opts.name, opts.email);
  return {
    subject: `You have been invited to the ${PORTAL_NAME}`,
    html: layout(
      greeting(opts.name, opts.email) +
        `<p>An administrator created an account for you on the <strong>${PORTAL_NAME}</strong>.</p>` +
        `<p>Sign in with this email address (<strong>${escapeHtml(opts.email)}</strong>). Your administrator will give you a one-time passcode directly — for security it is not sent by email.</p>` +
        `<p>You will be asked to choose your own password the first time you sign in. The passcode expires in ${opts.expiryDays} days.</p>` +
        linkBlock(opts.baseUrl, 'Open the Onboarding Portal')
    ),
    text: textBody([
      `Hi ${who},`,
      `An administrator created an account for you on the ${PORTAL_NAME}.`,
      `Sign in with this email address: ${opts.email}`,
      'Your administrator will give you a one-time passcode directly. For security it is not sent by email.',
      `You will be asked to choose your own password the first time you sign in. The passcode expires in ${opts.expiryDays} days.`,
      `Open the portal: ${opts.baseUrl}`,
    ]),
  };
}

export function passwordResetEmail(opts: {
  name: string | null;
  email: string;
  resetUrl: string;
  expiryMinutes: number;
}): EmailContent {
  const who = displayName(opts.name, opts.email);
  return {
    subject: 'Reset your Toledo Athletics Onboarding password',
    html: layout(
      greeting(opts.name, opts.email) +
        `<p>We received a request to reset your password. The link below is valid for <strong>${opts.expiryMinutes} minutes</strong> and can be used once:</p>` +
        linkBlock(opts.resetUrl, 'Reset Password') +
        '<p>If you did not request this, you can safely ignore this email.</p>'
    ),
    text: textBody([
      `Hi ${who},`,
      `We received a request to reset your password. The link below is valid for ${opts.expiryMinutes} minutes and can be used once.`,
      opts.resetUrl,
      'If you did not request this, you can safely ignore this email.',
    ]),
  };
}

export function taskAssignedEmail(opts: {
  name: string | null;
  email: string;
  taskTitle: string;
  taskDescription: string | null;
  assignedByEmail: string;
  baseUrl: string;
}): EmailContent {
  const who = displayName(opts.name, opts.email);
  const url = opts.baseUrl + '/guide';
  return {
    subject: subjectSafe(`New onboarding task assigned: ${opts.taskTitle}`),
    html: layout(
      greeting(opts.name, opts.email) +
        `<p>${escapeHtml(opts.assignedByEmail)} assigned you a new onboarding task:</p>` +
        `<p style="font-weight:700;font-size:16px;">${escapeHtml(opts.taskTitle)}</p>` +
        (opts.taskDescription ? `<p>${escapeHtml(opts.taskDescription)}</p>` : '') +
        linkBlock(url, 'View My Onboarding')
    ),
    text: textBody([
      `Hi ${who},`,
      `${opts.assignedByEmail} assigned you a new onboarding task:`,
      opts.taskTitle,
      ...(opts.taskDescription ? [opts.taskDescription] : []),
      `View your onboarding: ${url}`,
    ]),
  };
}

export function weeklyReminderEmail(opts: {
  name: string | null;
  email: string;
  tasks: { title: string; phase: string; priority: string }[];
  baseUrl: string;
}): EmailContent {
  const who = displayName(opts.name, opts.email);
  const url = opts.baseUrl + '/guide';
  const label = (t: { phase: string; priority: string }) =>
    `${t.phase.replace(/-/g, ' ')}${t.priority === 'required' ? ', required' : ''}`;

  const items = opts.tasks
    .map(
      (t) =>
        `<li>${escapeHtml(t.title)} <span style="color:#6b7280;font-size:12px;">(${escapeHtml(
          label(t)
        )})</span></li>`
    )
    .join('');

  return {
    subject: 'Reminder: Complete Your Onboarding Steps — Toledo Athletics',
    html: layout(
      greeting(opts.name, opts.email) +
        `<p>This is a friendly reminder that you still have open onboarding steps in the ${PORTAL_NAME}:</p>` +
        `<ul>${items}</ul>` +
        linkBlock(url, 'Go to My Onboarding') +
        '<p style="color:#6b7280;font-size:12px;">You receive this weekly reminder until your required and assigned tasks are complete.</p>'
    ),
    text: textBody([
      `Hi ${who},`,
      `This is a friendly reminder that you still have open onboarding steps in the ${PORTAL_NAME}:`,
      opts.tasks.map((t) => `- ${t.title} (${label(t)})`).join('\n'),
      `Go to my onboarding: ${url}`,
      'You receive this weekly reminder until your required and assigned tasks are complete.',
    ]),
  };
}

export function approvalDecisionEmail(opts: {
  name: string | null;
  email: string;
  taskTitle: string;
  approved: boolean;
  note: string | null;
  baseUrl: string;
}): EmailContent {
  const who = displayName(opts.name, opts.email);
  const url = opts.baseUrl + '/guide';
  return {
    subject: subjectSafe(
      opts.approved
        ? `Task approved: ${opts.taskTitle}`
        : `Task needs another look: ${opts.taskTitle}`
    ),
    html: layout(
      greeting(opts.name, opts.email) +
        (opts.approved
          ? `<p>Your completed task <strong>${escapeHtml(opts.taskTitle)}</strong> was reviewed and <span style="color:#16a34a;font-weight:600;">approved</span>. Nice work!</p>`
          : `<p>Your completed task <strong>${escapeHtml(opts.taskTitle)}</strong> was reviewed and sent back for another look.</p>`) +
        (opts.note
          ? `<p style="background:#f3f4f6;border-radius:8px;padding:12px;"><strong>Reviewer note:</strong> ${escapeHtml(opts.note)}</p>`
          : '') +
        linkBlock(url, 'View My Onboarding')
    ),
    text: textBody([
      `Hi ${who},`,
      opts.approved
        ? `Your completed task "${opts.taskTitle}" was reviewed and approved. Nice work!`
        : `Your completed task "${opts.taskTitle}" was reviewed and sent back for another look.`,
      ...(opts.note ? [`Reviewer note: ${opts.note}`] : []),
      `View your onboarding: ${url}`,
    ]),
  };
}

/**
 * Weekly digest for admins listing who still has outstanding tasks.
 *
 * Per-user reminders to utoledo.edu addresses are filtered by the university's
 * mail system, so this gives HR one list they can act on. The same data is
 * available in Admin > Who Is Behind, which works even if this email is
 * filtered too.
 */
export function adminDigestEmail(opts: {
  name: string | null;
  email: string;
  users: { email: string; name: string | null; open_tasks: number }[];
  baseUrl: string;
}): EmailContent {
  const who = displayName(opts.name, opts.email);
  const url = opts.baseUrl + '/admin';
  const rows = opts.users
    .map(
      (u) =>
        `<tr><td style="padding:6px 12px 6px 0;">${escapeHtml(u.name || u.email)}</td>` +
        `<td style="padding:6px 0;color:#6b7280;">${escapeHtml(u.email)}</td>` +
        `<td style="padding:6px 0 6px 12px;text-align:right;font-weight:600;">${u.open_tasks}</td></tr>`
    )
    .join('');

  return {
    subject: subjectSafe(
      `${opts.users.length} ${opts.users.length === 1 ? 'person has' : 'people have'} outstanding onboarding tasks`
    ),
    html: layout(
      greeting(opts.name, opts.email) +
        '<p>These active staff members still have incomplete required or assigned onboarding tasks:</p>' +
        `<table style="border-collapse:collapse;width:100%;font-size:14px;">${rows}</table>` +
        linkBlock(url, 'Open Admin') +
        '<p style="color:#6b7280;font-size:12px;">Per-user reminder emails are frequently filtered by university mail systems, so following up directly is more reliable. The same list is in Admin, under Who Is Behind.</p>'
    ),
    text: textBody([
      `Hi ${who},`,
      'These active staff members still have incomplete required or assigned onboarding tasks:',
      opts.users.map((u) => `- ${u.name || u.email} <${u.email}> — ${u.open_tasks} open`).join('\n'),
      `Open Admin: ${url}`,
      'Per-user reminder emails are frequently filtered by university mail systems, so following up directly is more reliable. The same list is in Admin, under Who Is Behind.',
    ]),
  };
}

export function testEmail(opts: { email: string; fromAddress: string }): EmailContent {
  const caveat =
    'If you are reading this, outbound email works. Note that a send recorded as accepted in the Email Log is not proof of delivery: university mail systems accept a message and filter it afterwards, so mail to utoledo.edu addresses may never reach the inbox.';
  return {
    subject: 'Test email — Toledo Athletics Onboarding',
    html: layout(
      `<p>This is a test email sent to ${escapeHtml(opts.email)} from <strong>${escapeHtml(opts.fromAddress)}</strong>.</p>` +
        `<p>${escapeHtml(caveat)}</p>`
    ),
    text: textBody([
      `This is a test email sent to ${opts.email} from ${opts.fromAddress}.`,
      caveat,
    ]),
  };
}
