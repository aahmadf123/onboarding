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

  it('sends nothing when the weekly reminder is disabled', async () => {
    const before = (await reminderRows()).length;
    await createUser({ email: 'behind2@utoledo.edu' });
    await env.DB.prepare(
      "INSERT INTO AppConfig (key, value) VALUES ('weekly_reminder_enabled', '0') ON CONFLICT(key) DO UPDATE SET value = '0'"
    ).run();

    await runScheduled();
    expect((await reminderRows()).length).toBe(before);
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
