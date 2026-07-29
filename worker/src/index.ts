// Entry point — imports the assembled Hono app and re-exports it as the
// Cloudflare Worker default export. The scheduled handler (cron in
// wrangler.jsonc, Mondays 13:00 UTC ≈ 9am Toledo) purges expired
// sessions/reset tokens, emails per-user reminders, and sends admins a digest
// of who is still behind.
import app from './app';
import { Bindings } from './types';
import { cleanupExpired, runAdminDigest, runWeeklyReminders } from './services/reminders';

export default {
  fetch: app.fetch,

  async scheduled(
    _event: ScheduledEvent,
    env: Bindings,
    _ctx: ExecutionContext
  ): Promise<void> {
    // Each step is isolated: a failure in one must not abort the others, and
    // an uncaught throw would make Cloudflare retry the whole invocation and
    // re-run the steps that already succeeded.
    try {
      await cleanupExpired(env);
    } catch (err) {
      console.error('Cleanup failed:', err instanceof Error ? err.message : err);
    }

    try {
      const { sent, skipped } = await runWeeklyReminders(env);
      console.log(`Weekly reminders: ${sent} sent, ${skipped} skipped.`);
    } catch (err) {
      console.error('Weekly reminders failed:', err instanceof Error ? err.message : err);
    }

    try {
      const { sent, behind } = await runAdminDigest(env);
      console.log(`Admin digest: ${sent} sent, ${behind} users behind.`);
    } catch (err) {
      console.error('Admin digest failed:', err instanceof Error ? err.message : err);
    }
  },
};
