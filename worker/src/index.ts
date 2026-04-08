// Entry point — imports the assembled Hono app and re-exports it as the
// Cloudflare Worker default export.  Also exposes the scheduled handler for
// email reminders.
import app from './app';
import { Bindings } from './types';

export default {
  fetch: app.fetch,

  // Scheduled handler for email reminders (configured via cron triggers in wrangler.jsonc)
  async scheduled(
    _event: ScheduledEvent,
    env: { DB: D1Database } & Bindings,
    _ctx: ExecutionContext
  ): Promise<void> {
    // Fetch all users
    const { results: users } = await env.DB.prepare(
      'SELECT id, email FROM Users'
    ).all<{ id: number; email: string }>();

    if (!users || users.length === 0) return;

    // Required task IDs from the onboarding checklist
    const requiredTasks = [
      'rocket-id',
      'mfa',
      'myut',
      'parking',
      'direct-deposit',
      'systems-training',
      'benefits',
      'compliance-training',
      'compliance-policies',
    ];

    // For each user, the checklist state is stored client-side in localStorage.
    // The server does not have access to localStorage, so the reminder is a
    // general nudge to complete onboarding.  A future enhancement could sync
    // checklist state to the DB for per-user targeted reminders.

    for (const user of users) {
      try {
        // Sanitize the display name to prevent XSS in the email body
        const displayName = user.email
          .split('@')[0]
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

        // Send email via MailChannels (free on Cloudflare Workers)
        await fetch('https://api.mailchannels.net/tx/v1/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: user.email, name: user.email.split('@')[0] }],
              },
            ],
            from: {
              email: 'noreply@utoledo.edu',
              name: 'Toledo Athletics Onboarding',
            },
            subject:
              'Reminder: Complete Your Onboarding Steps — Toledo Athletics',
            content: [
              {
                type: 'text/html',
                value: [
                  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">',
                  '<div style="background:#0B2240;color:white;padding:24px;text-align:center;border-radius:8px 8px 0 0;">',
                  '<h1 style="margin:0;font-size:20px;">Toledo Athletics Onboarding</h1>',
                  '</div>',
                  '<div style="padding:24px;background:white;border:1px solid #e5e7eb;border-radius:0 0 8px 8px;">',
                  '<p>Hi ' + displayName + ',</p>',
                  '<p>This is a friendly reminder to complete your <strong>required</strong> onboarding steps in the Toledo Athletics Onboarding Portal.</p>',
                  '<p>Required tasks include:</p>',
                  '<ul>',
                  ...requiredTasks.map(
                    (t) =>
                      '<li>' +
                      t
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (c: string) => c.toUpperCase()) +
                      '</li>'
                  ),
                  '</ul>',
                  '<p><a href="https://onboarding.utoledo.edu/guide" style="display:inline-block;background:#0B2240;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Go to My Onboarding</a></p>',
                  '<p style="color:#6b7280;font-size:12px;margin-top:24px;">If you have already completed all steps, you can safely ignore this email.</p>',
                  '</div>',
                  '</div>',
                ].join(''),
              },
            ],
          }),
        });
      } catch (err) {
        // Log email delivery failure for diagnostics
        console.error(
          `Failed to send reminder to ${user.email}:`,
          err instanceof Error ? err.message : err
        );
      }
    }
  },
};
