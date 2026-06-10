import { env } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import { applySchema, mockResend, createUserAndLogin, apiCall } from './helpers';

let plainTaskId: number;
let approvalTaskId: number;
let assignedTaskId: number;

beforeAll(async () => {
  await applySchema();
  mockResend();
  const insert = async (slug: string, opts: { approval?: boolean; audience?: string; active?: boolean } = {}) => {
    const info = await env.DB.prepare(
      `INSERT INTO Tasks (slug, phase, title, priority, requires_approval, audience, is_active)
       VALUES (?, 'first-day', ?, 'required', ?, ?, ?)`
    )
      .bind(slug, 'Task ' + slug, opts.approval ? 1 : 0, opts.audience ?? 'all', opts.active === false ? 0 : 1)
      .run();
    return info.meta.last_row_id as number;
  };
  plainTaskId = await insert('plain-task');
  approvalTaskId = await insert('signoff-task', { approval: true });
  assignedTaskId = await insert('special-task', { audience: 'assigned' });
  await insert('hidden-task', { active: false });
});

describe('GET /api/tasks', () => {
  it('lists active all-audience tasks, hiding inactive and unassigned ones', async () => {
    const user = await createUserAndLogin();
    const res = await apiCall('/api/tasks', { token: user.token });
    expect(res.status).toBe(200);
    const slugs = res.json.data.map((t: { slug: string }) => t.slug);
    expect(slugs).toContain('plain-task');
    expect(slugs).toContain('signoff-task');
    expect(slugs).not.toContain('special-task');
    expect(slugs).not.toContain('hidden-task');
    for (const t of res.json.data) expect(t.my_status).toBe('open');
  });

  it('includes tasks assigned to me but not to others', async () => {
    const me = await createUserAndLogin();
    const other = await createUserAndLogin();
    await env.DB.prepare(
      "INSERT INTO UserTasks (user_id, task_id, status, assigned_by, assigned_at) VALUES (?, ?, 'open', 999, CURRENT_TIMESTAMP)"
    )
      .bind(me.id, assignedTaskId)
      .run();

    const mine = await apiCall('/api/tasks', { token: me.token });
    expect(mine.json.data.map((t: { slug: string }) => t.slug)).toContain('special-task');

    const theirs = await apiCall('/api/tasks', { token: other.token });
    expect(theirs.json.data.map((t: { slug: string }) => t.slug)).not.toContain('special-task');
  });
});

describe('PUT /api/tasks/:id/status', () => {
  it('toggles a plain task done and back open', async () => {
    const user = await createUserAndLogin();
    const done = await apiCall(`/api/tasks/${plainTaskId}/status`, {
      method: 'PUT',
      token: user.token,
      body: JSON.stringify({ done: true }),
    });
    expect(done.json.data.status).toBe('done');

    const undone = await apiCall(`/api/tasks/${plainTaskId}/status`, {
      method: 'PUT',
      token: user.token,
      body: JSON.stringify({ done: false }),
    });
    expect(undone.json.data.status).toBe('open');
  });

  it('routes sign-off tasks through pending_approval and locks after approval', async () => {
    const user = await createUserAndLogin();
    const admin = await createUserAndLogin({ role: 'admin' });

    const pending = await apiCall(`/api/tasks/${approvalTaskId}/status`, {
      method: 'PUT',
      token: user.token,
      body: JSON.stringify({ done: true }),
    });
    expect(pending.json.data.status).toBe('pending_approval');

    const queue = await apiCall('/api/admin/approvals', { token: admin.token });
    const item = queue.json.data.find((i: { user_id: number }) => i.user_id === user.id);
    expect(item).toBeTruthy();

    const approve = await apiCall(`/api/admin/approvals/${item.id}/approve`, {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({}),
    });
    expect(approve.status).toBe(200);

    const locked = await apiCall(`/api/tasks/${approvalTaskId}/status`, {
      method: 'PUT',
      token: user.token,
      body: JSON.stringify({ done: false }),
    });
    expect(locked.status).toBe(409);

    const list = await apiCall('/api/tasks', { token: user.token });
    const t = list.json.data.find((x: { id: number }) => x.id === approvalTaskId);
    expect(t.my_status).toBe('approved');
  });

  it('rejection requires a note, surfaces it, and allows resubmission', async () => {
    const user = await createUserAndLogin();
    const admin = await createUserAndLogin({ role: 'admin' });

    await apiCall(`/api/tasks/${approvalTaskId}/status`, {
      method: 'PUT',
      token: user.token,
      body: JSON.stringify({ done: true }),
    });
    const queue = await apiCall('/api/admin/approvals', { token: admin.token });
    const item = queue.json.data.find((i: { user_id: number }) => i.user_id === user.id);

    const noNote = await apiCall(`/api/admin/approvals/${item.id}/reject`, {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({}),
    });
    expect(noNote.status).toBe(400);

    const reject = await apiCall(`/api/admin/approvals/${item.id}/reject`, {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({ note: 'Please attach the certificate.' }),
    });
    expect(reject.status).toBe(200);

    const list = await apiCall('/api/tasks', { token: user.token });
    const t = list.json.data.find((x: { id: number }) => x.id === approvalTaskId);
    expect(t.my_status).toBe('rejected');
    expect(t.review_notes).toBe('Please attach the certificate.');

    const resubmit = await apiCall(`/api/tasks/${approvalTaskId}/status`, {
      method: 'PUT',
      token: user.token,
      body: JSON.stringify({ done: true }),
    });
    expect(resubmit.json.data.status).toBe('pending_approval');

    // The decision email went out.
    const log = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM EmailLog WHERE email_type = 'approval_decision' AND user_id = ?"
    )
      .bind(user.id)
      .first<{ n: number }>();
    expect(log?.n).toBeGreaterThan(0);
  });

  it('blocks acting on assigned-audience tasks that are not assigned to me', async () => {
    const user = await createUserAndLogin();
    const res = await apiCall(`/api/tasks/${assignedTaskId}/status`, {
      method: 'PUT',
      token: user.token,
      body: JSON.stringify({ done: true }),
    });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/tasks/migrate-local', () => {
  it('marks legacy slugs done, skips sign-off tasks and unknowns, never un-marks', async () => {
    const user = await createUserAndLogin();
    const first = await apiCall('/api/tasks/migrate-local', {
      method: 'POST',
      token: user.token,
      body: JSON.stringify({ slugs: ['plain-task', 'signoff-task', 'does-not-exist'] }),
    });
    expect(first.status).toBe(200);
    expect(first.json.data.migrated).toBe(1);

    const list = await apiCall('/api/tasks', { token: user.token });
    const plain = list.json.data.find((t: { slug: string }) => t.slug === 'plain-task');
    const signoff = list.json.data.find((t: { slug: string }) => t.slug === 'signoff-task');
    expect(plain.my_status).toBe('done');
    expect(signoff.my_status).toBe('open');

    // migrated flag set
    const me = await apiCall('/api/auth/me', { token: user.token });
    expect(me.json.data.localstorage_migrated).toBe(true);

    // Re-running with no slugs does not un-mark anything.
    await apiCall('/api/tasks/migrate-local', {
      method: 'POST',
      token: user.token,
      body: JSON.stringify({ slugs: [] }),
    });
    const list2 = await apiCall('/api/tasks', { token: user.token });
    expect(list2.json.data.find((t: { slug: string }) => t.slug === 'plain-task').my_status).toBe('done');
  });
});
