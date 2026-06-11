// Entry point — imports the assembled Hono app and re-exports it as the
// Cloudflare Worker default export. The scheduled handler (cron in
// wrangler.jsonc, Mondays 9 AM UTC) sends per-user reminder emails via
// Resend and purges expired sessions/reset tokens.
import app from './app';
import { Bindings } from './types';
import { cleanupExpired, runWeeklyReminders } from './services/reminders';

export default {
  fetch: app.fetch,

  async scheduled(
    _event: ScheduledEvent,
    env: Bindings,
    _ctx: ExecutionContext
  ): Promise<void> {
    await cleanupExpired(env);
    const { sent, skipped } = await runWeeklyReminders(env);
    console.log(`Weekly reminders: ${sent} sent, ${skipped} users up to date.`);
  },
};
