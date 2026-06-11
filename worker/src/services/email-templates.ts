// HTML email templates. Every dynamic value must pass through escapeHtml.

export interface EmailContent {
  subject: string;
  html: string;
}

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

function layout(bodyHtml: string): string {
  return [
    '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">',
    '<div style="background:#0B2240;color:white;padding:24px;text-align:center;border-radius:8px 8px 0 0;">',
    '<h1 style="margin:0;font-size:20px;">Toledo Athletics Onboarding</h1>',
    '</div>',
    '<div style="padding:24px;background:white;border:1px solid #e5e7eb;border-radius:0 0 8px 8px;">',
    bodyHtml,
    '<p style="color:#6b7280;font-size:12px;margin-top:24px;">This message was sent by the Toledo Athletics Onboarding Portal.</p>',
    '</div>',
    '</div>',
  ].join('');
}

function greeting(name: string | null, email: string): string {
  const display = name && name.trim() ? name : email.split('@')[0];
  return `<p>Hi ${escapeHtml(display)},</p>`;
}

export function inviteEmail(opts: {
  name: string | null;
  email: string;
  passcode: string;
  baseUrl: string;
}): EmailContent {
  return {
    subject: 'You have been invited to the Toledo Athletics Onboarding Portal',
    html: layout(
      greeting(opts.name, opts.email) +
        '<p>An administrator created an account for you on the <strong>Toledo Athletics Onboarding Portal</strong>.</p>' +
        '<p>Sign in with your email address and this one-time passcode:</p>' +
        `<p style="font-size:22px;font-weight:700;letter-spacing:2px;background:#f3f4f6;border-radius:8px;padding:14px 18px;text-align:center;">${escapeHtml(opts.passcode)}</p>` +
        '<p>You will be asked to choose your own password the first time you sign in. The passcode expires in 14 days.</p>' +
        button(opts.baseUrl, 'Open the Onboarding Portal')
    ),
  };
}

export function passwordResetEmail(opts: {
  name: string | null;
  email: string;
  resetUrl: string;
}): EmailContent {
  return {
    subject: 'Reset your Toledo Athletics Onboarding password',
    html: layout(
      greeting(opts.name, opts.email) +
        '<p>We received a request to reset your password. The link below is valid for <strong>60 minutes</strong> and can be used once:</p>' +
        button(opts.resetUrl, 'Reset Password') +
        `<p style="font-size:12px;color:#6b7280;word-break:break-all;">Or copy this link: ${escapeHtml(opts.resetUrl)}</p>` +
        '<p>If you did not request this, you can safely ignore this email.</p>'
    ),
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
  return {
    subject: subjectSafe(`New onboarding task assigned: ${opts.taskTitle}`),
    html: layout(
      greeting(opts.name, opts.email) +
        `<p>${escapeHtml(opts.assignedByEmail)} assigned you a new onboarding task:</p>` +
        `<p style="font-weight:700;font-size:16px;">${escapeHtml(opts.taskTitle)}</p>` +
        (opts.taskDescription ? `<p>${escapeHtml(opts.taskDescription)}</p>` : '') +
        button(opts.baseUrl + '/guide', 'View My Onboarding')
    ),
  };
}

export function weeklyReminderEmail(opts: {
  name: string | null;
  email: string;
  tasks: { title: string; phase: string; priority: string }[];
  baseUrl: string;
}): EmailContent {
  const items = opts.tasks
    .map(
      (t) =>
        `<li>${escapeHtml(t.title)} <span style="color:#6b7280;font-size:12px;">(${escapeHtml(
          t.phase.replace(/-/g, ' ')
        )}${t.priority === 'required' ? ', required' : ''})</span></li>`
    )
    .join('');
  return {
    subject: 'Reminder: Complete Your Onboarding Steps — Toledo Athletics',
    html: layout(
      greeting(opts.name, opts.email) +
        '<p>This is a friendly reminder that you still have open onboarding steps in the Toledo Athletics Onboarding Portal:</p>' +
        `<ul>${items}</ul>` +
        button(opts.baseUrl + '/guide', 'Go to My Onboarding') +
        '<p style="color:#6b7280;font-size:12px;">You receive this weekly reminder until your required and assigned tasks are complete.</p>'
    ),
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
        button(opts.baseUrl + '/guide', 'View My Onboarding')
    ),
  };
}

export function testEmail(opts: { email: string; fromAddress: string }): EmailContent {
  return {
    subject: 'Test email — Toledo Athletics Onboarding',
    html: layout(
      `<p>This is a test email sent to ${escapeHtml(opts.email)} from <strong>${escapeHtml(opts.fromAddress)}</strong>.</p>` +
        '<p>If you are reading this, the Resend integration works. Note: while the from-address is the resend.dev sandbox, emails are only delivered to the Resend account owner’s inbox.</p>'
    ),
  };
}
