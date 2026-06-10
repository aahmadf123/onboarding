import { env } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import { applySchema, mockResend, createUserAndLogin, apiCall, login } from './helpers';

beforeAll(async () => {
  await applySchema();
  mockResend();
  await env.DB.prepare("INSERT INTO Categories (name, description) VALUES ('HR & Benefits', 'Benefits info')").run();
});

describe('admin access control', () => {
  it('rejects staff and moderators from /api/admin/*', async () => {
    const staff = await createUserAndLogin();
    const mod = await createUserAndLogin({ role: 'moderator' });
    expect((await apiCall('/api/admin/users', { token: staff.token })).status).toBe(403);
    expect((await apiCall('/api/admin/users', { token: mod.token })).status).toBe(403);
  });
});

describe('user provisioning', () => {
  it('invites a user: passcode in response, email logged, login works, duplicate 409', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const invite = await apiCall('/api/admin/users', {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({ email: 'new.hire@utoledo.edu', name: 'New Hire', role: 'staff' }),
    });
    expect(invite.status).toBe(201);
    const passcode = invite.json.data.passcode as string;
    expect(passcode).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(invite.json.data.user.status).toBe('invited');

    const log = await env.DB.prepare(
      "SELECT * FROM EmailLog WHERE email_type = 'invite' AND to_email = 'new.hire@utoledo.edu'"
    ).first();
    expect(log).toBeTruthy();

    // Passcode signs in and forces a reset.
    const token = await login('new.hire@utoledo.edu', passcode);
    const me = await apiCall('/api/auth/me', { token });
    expect(me.json.data.must_reset).toBe(true);

    const dup = await apiCall('/api/admin/users', {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({ email: 'new.hire@utoledo.edu' }),
    });
    expect(dup.status).toBe(409);
  });

  it('re-invite rotates the passcode and kills sessions', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const invite = await apiCall('/api/admin/users', {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({ email: 'rotate.me@utoledo.edu' }),
    });
    const firstPasscode = invite.json.data.passcode as string;
    const userId = invite.json.data.user.id as number;
    const oldToken = await login('rotate.me@utoledo.edu', firstPasscode);

    const reinvite = await apiCall(`/api/admin/users/${userId}/reinvite`, {
      method: 'POST',
      token: admin.token,
    });
    expect(reinvite.status).toBe(200);
    const secondPasscode = reinvite.json.data.passcode as string;
    expect(secondPasscode).not.toBe(firstPasscode);

    expect((await apiCall('/api/auth/me', { token: oldToken })).status).toBe(401);
    await expect(login('rotate.me@utoledo.edu', firstPasscode)).rejects.toThrow();
    await login('rotate.me@utoledo.edu', secondPasscode);
  });

  it('blocks self-disable and self-role-change; disabling others revokes access', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const victim = await createUserAndLogin();

    const selfDisable = await apiCall(`/api/admin/users/${admin.id}`, {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({ status: 'disabled' }),
    });
    expect(selfDisable.status).toBe(400);

    const selfDemote = await apiCall(`/api/admin/users/${admin.id}`, {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({ role: 'staff' }),
    });
    expect(selfDemote.status).toBe(400);

    const disable = await apiCall(`/api/admin/users/${victim.id}`, {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({ status: 'disabled' }),
    });
    expect(disable.status).toBe(200);
    expect((await apiCall('/api/auth/me', { token: victim.token })).status).toBe(401);
  });
});

describe('task assignment', () => {
  it('assigns a task to users and emails them', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const worker1 = await createUserAndLogin();

    const create = await apiCall('/api/admin/tasks', {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({
        title: 'Shadow the equipment room',
        phase: 'first-week',
        audience: 'assigned',
        priority: 'recommended',
      }),
    });
    expect(create.status).toBe(201);
    const taskId = create.json.data.id as number;
    expect(create.json.data.slug).toBe('shadow-the-equipment-room');

    const assign = await apiCall(`/api/admin/tasks/${taskId}/assign`, {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({ user_ids: [worker1.id] }),
    });
    expect(assign.json.data.assigned).toBe(1);

    const list = await apiCall('/api/tasks', { token: worker1.token });
    const mine = list.json.data.find((t: { id: number }) => t.id === taskId);
    expect(mine).toBeTruthy();
    expect(mine.assigned_by_email).toBe(admin.email);

    const log = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM EmailLog WHERE email_type = 'task_assigned' AND user_id = ?"
    )
      .bind(worker1.id)
      .first<{ n: number }>();
    expect(log?.n).toBe(1);
  });
});

describe('content CMS', () => {
  it('article create/update reindexes for AI chat; soft delete hides everywhere public', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const staff = await createUserAndLogin();

    const create = await apiCall('/api/admin/content/articles', {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({ title: 'Vector LMS Training', category_id: 1, current_content: 'Complete training in **Vector LMS**.' }),
    });
    expect(create.status).toBe(201);
    const articleId = create.json.data.id as number;

    let indexRow = await env.DB.prepare(
      "SELECT * FROM SiteContentIndex WHERE source_type = 'article' AND source_id = ?"
    )
      .bind(articleId)
      .first<{ content_text: string }>();
    expect(indexRow?.content_text).toContain('Vector LMS');

    const update = await apiCall(`/api/admin/content/articles/${articleId}`, {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({ current_content: 'Updated copy about compliance.' }),
    });
    expect(update.status).toBe(200);
    indexRow = await env.DB.prepare(
      "SELECT * FROM SiteContentIndex WHERE source_type = 'article' AND source_id = ?"
    )
      .bind(articleId)
      .first<{ content_text: string }>();
    expect(indexRow?.content_text).toContain('Updated copy');

    // Visible publicly before delete…
    const publicView = await apiCall(`/api/articles/${articleId}`, { token: staff.token });
    expect(publicView.status).toBe(200);

    const del = await apiCall(`/api/admin/content/articles/${articleId}`, {
      method: 'DELETE',
      token: admin.token,
    });
    expect(del.status).toBe(200);

    // …and gone from the public surface after.
    expect((await apiCall(`/api/articles/${articleId}`, { token: staff.token })).status).toBe(404);
    const listed = await apiCall('/api/articles', { token: staff.token });
    expect(listed.json.data.find((a: { id: number }) => a.id === articleId)).toBeUndefined();
    const search = await apiCall('/api/search?q=Vector', { token: staff.token });
    expect(search.json.data.find((a: { id: number }) => a.id === articleId)).toBeUndefined();
    const gone = await env.DB.prepare(
      "SELECT * FROM SiteContentIndex WHERE source_type = 'article' AND source_id = ?"
    )
      .bind(articleId)
      .first();
    expect(gone).toBeNull();

    // Admin list still shows it (for restore).
    const adminList = await apiCall('/api/admin/content/articles', { token: admin.token });
    expect(adminList.json.data.find((a: { id: number }) => a.id === articleId)).toBeTruthy();
  });

  it('contacts CRUD roundtrip works', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const create = await apiCall('/api/admin/content/contacts', {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({ function_area: 'Athletics IT (JJ)', contact_name: 'JJ', phone: 'TBD' }),
    });
    expect(create.status).toBe(201);
    const id = create.json.data.id as number;

    const update = await apiCall(`/api/admin/content/contacts/${id}`, {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({ phone: '419-530-0000' }),
    });
    expect(update.json.data.phone).toBe('419-530-0000');
  });

  it('rejects unknown entities and protects referenced categories', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    expect((await apiCall('/api/admin/content/users', { token: admin.token })).status).toBe(404);

    await apiCall('/api/admin/content/articles', {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({ title: 'Anchor article', category_id: 1 }),
    });
    const del = await apiCall('/api/admin/content/categories/1', {
      method: 'DELETE',
      token: admin.token,
    });
    expect(del.status).toBe(409);
  });
});

describe('settings & email log', () => {
  it('whitelists settings keys and round-trips values', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const bad = await apiCall('/api/admin/settings', {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({ evil_key: 'x' }),
    });
    expect(bad.status).toBe(400);

    const ok = await apiCall('/api/admin/settings', {
      method: 'PUT',
      token: admin.token,
      body: JSON.stringify({ email_from_name: 'Rocket Onboarding' }),
    });
    expect(ok.json.data.email_from_name).toBe('Rocket Onboarding');
  });

  it('test email sends to the caller and is logged', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const res = await apiCall('/api/admin/settings/test-email', { method: 'POST', token: admin.token });
    expect(res.status).toBe(200);
    const log = await env.DB.prepare(
      "SELECT * FROM EmailLog WHERE email_type = 'test' AND to_email = ?"
    )
      .bind(admin.email)
      .first();
    expect(log).toBeTruthy();
  });

  it('email log is admin-readable and filterable', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    await apiCall('/api/admin/settings/test-email', { method: 'POST', token: admin.token });
    const res = await apiCall('/api/admin/email-log?type=test', { token: admin.token });
    expect(res.status).toBe(200);
    expect(res.json.data.length).toBeGreaterThan(0);
    for (const row of res.json.data) expect(row.email_type).toBe('test');
  });
});

describe('moderation endpoints are no longer forgeable', () => {
  it('staff cannot list or decide submissions; author comes from the session', async () => {
    const staff = await createUserAndLogin();
    const mod = await createUserAndLogin({ role: 'moderator' });

    expect((await apiCall('/api/submissions', { token: staff.token })).status).toBe(403);

    // Spoofed author_id in the body is ignored.
    const post = await apiCall('/api/submissions', {
      method: 'POST',
      token: staff.token,
      body: JSON.stringify({ proposed_title: 'New guide', proposed_content: 'Body', author_id: 424242 }),
    });
    expect(post.status).toBe(201);
    const row = await env.DB.prepare('SELECT author_id FROM Submissions WHERE id = ?')
      .bind(post.json.id)
      .first<{ author_id: number }>();
    expect(row?.author_id).toBe(staff.id);

    const decide = await apiCall(`/api/submissions/${post.json.id}/approve`, {
      method: 'PUT',
      token: staff.token,
      body: JSON.stringify({}),
    });
    expect(decide.status).toBe(403);

    const approve = await apiCall(`/api/submissions/${post.json.id}/approve`, {
      method: 'PUT',
      token: mod.token,
      body: JSON.stringify({ category_id: 1 }),
    });
    expect(approve.status).toBe(200);
    const reviewed = await env.DB.prepare('SELECT reviewed_by FROM Submissions WHERE id = ?')
      .bind(post.json.id)
      .first<{ reviewed_by: number }>();
    expect(reviewed?.reviewed_by).toBe(mod.id);
  });
});
