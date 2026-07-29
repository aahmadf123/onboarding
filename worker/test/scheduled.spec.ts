import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import worker from '../src/index';
import { Bindings } from '../src/types';
import { applySchema, mockResend, createUser } from './helpers';

beforeAll(async () => {
  await applySchema();
  mockResend();
  await env.DB.prepare(
    `INSERT INTO Tasks (slug, phase, title, priority, audience) VALUES ('required-step', 'first-day', 'Required Step', 'required', 'all')`
  ).run();
});

async function runScheduled(): Promise<void> {
  const ctx = createExecutionContext();
  await worker.scheduled(
    { scheduledTime: Date.now(), cron: '0 9 * * 1' } as unknown as ScheduledEvent,
    env as unknown as Bindings,
    ctx
  );
  await waitOnExecutionContext(ctx);
}

async function reminderRows(): Promise<{ to_email: string }[]> {
  const { results } = await env.DB.prepare(
    "SELECT to_email FROM EmailLog WHERE email_type = 'weekly_reminder'"
  ).all<{ to_email: string }>();
  return results;
}

describe('weekly reminder cron', () => {
  it('emails only active users with genuinely incomplete tasks', async () => {
    const behind = await createUser({ email: 'behind@utoledo.edu' });
    const caughtUp = await createUser({ email: 'caught.up@utoledo.edu' });
    await createUser({ email: 'invited.only@utoledo.edu', status: 'invited' });

    const task = await env.DB.prepare("SELECT id FROM Tasks WHERE slug = 'required-step'").first<{ id: number }>();
    await env.DB.prepare(
      "INSERT INTO UserTasks (user_id, task_id, status, completed_at) VALUES (?, ?, 'done', CURRENT_TIMESTAMP)"
    )
      .bind(caughtUp.id, task!.id)
      .run();

    await runScheduled();

    const rows = await reminderRows();
    expect(rows.map((r) => r.to_email)).toContain('behind@utoledo.edu');
    expect(rows.map((r) => r.to_email)).not.toContain('caught.up@utoledo.edu');
    expect(rows.map((r) => r.to_email)).not.toContain('invited.only@utoledo.edu');
    expect(rows.filter((r) => r.to_email === 'behind@utoledo.edu').length).toBe(1);
    void behind;
  });

  it('does not re-send to the same user when the cron is retried', async () => {
    // Cloudflare retries a failed invocation and the loop restarts from the
    // first user, so without an EmailLog check everyone already emailed gets a
    // duplicate.
    const before = (await reminderRows()).filter((r) => r.to_email === 'behind@utoledo.edu').length;
    expect(before).toBe(1);

    await runScheduled();

    const after = (await reminderRows()).filter((r) => r.to_email === 'behind@utoledo.edu').length;
    expect(after).toBe(1);
  });

  it('emails admins a digest of who is behind', async () => {
    await createUser({ email: 'digest.admin@utoledo.edu', role: 'admin' });

    await runScheduled();

    const { results } = await env.DB.prepare(
      "SELECT to_email, subject FROM EmailLog WHERE email_type = 'admin_digest'"
    ).all<{ to_email: string; subject: string }>();

    expect(results.map((r) => r.to_email)).toContain('digest.admin@utoledo.edu');
    expect(results[0].subject).toMatch(/outstanding onboarding tasks/);
  });

  it('sends nothing when the weekly reminder is disabled', async () => {
    const before = (await reminderRows()).length;
    await createUser({ email: 'behind2@utoledo.edu' });
    await env.DB.prepare(
      "INSERT INTO AppConfig (key, value) VALUES ('weekly_reminder_enabled', '0') ON CONFLICT(key) DO UPDATE SET value = '0'"
    ).run();

    await runScheduled();
    expect((await reminderRows()).length).toBe(before);
  });

  it('keeps the two toggles independent', async () => {
    async function digestCount(): Promise<number> {
      const row = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM EmailLog WHERE email_type = 'admin_digest'"
      ).first<{ count: number }>();
      return row?.count ?? 0;
    }

    // weekly_reminder_enabled is still '0' from the test above. The digest is
    // the channel that actually reaches admins, so it must keep working.
    const beforeDigest = await digestCount();
    await runScheduled();
    expect(await digestCount()).toBeGreaterThan(beforeDigest);

    // Turning the digest off stops it, without needing the other toggle.
    await env.DB.prepare(
      "INSERT INTO AppConfig (key, value) VALUES ('admin_digest_enabled', '0') ON CONFLICT(key) DO UPDATE SET value = '0'"
    ).run();
    const afterDisable = await digestCount();
    await runScheduled();
    expect(await digestCount()).toBe(afterDisable);
  });

  it('purges expired sessions and reset tokens', async () => {
    const user = await createUser();
    await env.DB.prepare(
      "INSERT INTO Sessions (user_id, token_hash, expires_at) VALUES (?, 'expired-hash', ?)"
    )
      .bind(user.id, new Date(Date.now() - 1000).toISOString())
      .run();
    await env.DB.prepare(
      "INSERT INTO PasswordResets (user_id, token_hash, expires_at) VALUES (?, 'expired-reset', ?)"
    )
      .bind(user.id, new Date(Date.now() - 1000).toISOString())
      .run();

    await runScheduled();

    const session = await env.DB.prepare("SELECT * FROM Sessions WHERE token_hash = 'expired-hash'").first();
    const reset = await env.DB.prepare("SELECT * FROM PasswordResets WHERE token_hash = 'expired-reset'").first();
    expect(session).toBeNull();
    expect(reset).toBeNull();
  });
});
