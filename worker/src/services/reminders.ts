// Weekly reminder cron + housekeeping. Replaces the old MailChannels sender
// (MailChannels shut down its free Workers API on 2024-08-31, so the previous
// scheduled handler had been failing silently).

import { Bindings } from '../types';
import { getConfig } from './config';
import { sendEmail } from './email';
import { weeklyReminderEmail } from './email-templates';

interface ReminderUser {
  id: number;
  email: string;
  name: string | null;
}

interface OpenTask {
  title: string;
  phase: string;
  priority: string;
}

/** Purges expired sessions and password-reset tokens. */
export async function cleanupExpired(env: Pick<Bindings, 'DB'>): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM Sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('DELETE FROM PasswordResets WHERE expires_at < ?').bind(now),
  ]);
}

/**
 * Emails each active user a personalized list of their genuinely incomplete
 * tasks (required tasks plus anything assigned to them). Users with nothing
 * outstanding get no email.
 */
export async function runWeeklyReminders(
  env: Pick<Bindings, 'DB' | 'RESEND_API_KEY'>
): Promise<{ sent: number; skipped: number }> {
  const enabled = await getConfig(env.DB, 'weekly_reminder_enabled');
  if (enabled !== '1') return { sent: 0, skipped: 0 };

  const baseUrl = await getConfig(env.DB, 'app_base_url');
  const { results: users } = await env.DB.prepare(
    "SELECT id, email, name FROM Users WHERE status = 'active'"
  ).all<ReminderUser>();

  let sent = 0;
  let skipped = 0;
  for (const user of users ?? []) {
    try {
      const { results: openTasks } = await env.DB.prepare(
        `SELECT t.title, t.phase, t.priority
         FROM Tasks t
         LEFT JOIN UserTasks ut ON ut.task_id = t.id AND ut.user_id = ?1
         WHERE t.is_active = 1
           AND (t.audience = 'all' OR ut.assigned_by IS NOT NULL)
           AND COALESCE(ut.status, 'open') IN ('open', 'rejected')
           AND (t.priority = 'required' OR ut.assigned_by IS NOT NULL)
         ORDER BY t.phase, t.display_order`
      )
        .bind(user.id)
        .all<OpenTask>();

      if (!openTasks || openTasks.length === 0) {
        skipped++;
        continue;
      }

      const content = weeklyReminderEmail({
        name: user.name,
        email: user.email,
        tasks: openTasks,
        baseUrl,
      });
      // Sequential sends keep us under Resend's ~2 req/s rate limit.
      const result = await sendEmail(env, {
        to: user.email,
        subject: content.subject,
        html: content.html,
        type: 'weekly_reminder',
        userId: user.id,
      });
      if (result.ok) sent++;
    } catch (err) {
      console.error(
        `Reminder for ${user.email} failed:`,
        err instanceof Error ? err.message : err
      );
    }
  }
  return { sent, skipped };
}
