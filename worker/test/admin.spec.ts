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

  it('enforces delete safeguards: cannot self-delete or delete primary super admin', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const primary = await createUserAndLogin({ role: 'admin', email: 'utdata@utoledo.edu' });

    const selfDelete = await apiCall(`/api/admin/users/${admin.id}`, {
      method: 'DELETE',
      token: admin.token,
    });
    expect(selfDelete.status).toBe(400);

    const primaryDelete = await apiCall(`/api/admin/users/${primary.id}`, {
      method: 'DELETE',
      token: admin.token,
    });
    expect(primaryDelete.status).toBe(400);
  });

  it('deletes a user with cascading cleanup and reference nulling', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const victim = await createUserAndLogin({ role: 'staff', email: 'delete.me@utoledo.edu' });
    const other = await createUserAndLogin({ role: 'moderator' });

    const article = await env.DB.prepare(
      "INSERT INTO Articles (category_id, title, current_content, is_active) VALUES (1, 'Delete Cascade Article', 'Body', 1)"
    ).run();
    const articleId = article.meta.last_row_id as number;

    const tipByVictim = await env.DB.prepare(
      "INSERT INTO Tips (author_id, category_id, title, content, status, reviewed_by) VALUES (?, 1, 'Victim tip', 'Tip body', 'pending', ?)"
    )
      .bind(victim.id, victim.id)
      .run();
    const tipByVictimId = tipByVictim.meta.last_row_id as number;

    const tipByOther = await env.DB.prepare(
      "INSERT INTO Tips (author_id, category_id, title, content, status, reviewed_by) VALUES (?, 1, 'Other tip', 'Other body', 'pending', ?)"
    )
      .bind(other.id, victim.id)
      .run();
    const tipByOtherId = tipByOther.meta.last_row_id as number;

    await env.DB.prepare(
      "INSERT INTO TipFeedback (tip_id, reporter_id, reason, details, status) VALUES (?, ?, 'issue', 'details', 'open')"
    )
      .bind(tipByVictimId, other.id)
      .run();
    await env.DB.prepare(
      "INSERT INTO TipFeedback (tip_id, reporter_id, reason, details, status) VALUES (?, ?, 'issue', 'details', 'open')"
    )
      .bind(tipByOtherId, victim.id)
      .run();

    await env.DB.prepare(
      `INSERT INTO Submissions (article_id, author_id, proposed_title, proposed_content, request_type, priority, topic_area, status, reviewed_by)
       VALUES (?, ?, 'Victim submission', 'Submission body', 'content_update', 'normal', 'IT', 'pending', ?)`
    )
      .bind(articleId, victim.id, victim.id)
      .run();

    await env.DB.prepare(
      `INSERT INTO UserTasks (user_id, task_id, status, assigned_by, reviewed_by)
       VALUES (?, 1, 'open', ?, ?)`
    )
      .bind(victim.id, victim.id, victim.id)
      .run();
    await env.DB.prepare(
      `INSERT INTO UserTasks (user_id, task_id, status, assigned_by, reviewed_by)
       VALUES (?, 1, 'open', ?, ?)`
    )
      .bind(other.id, victim.id, victim.id)
      .run();

    await env.DB.prepare(
      "INSERT INTO PasswordResets (user_id, token_hash, expires_at) VALUES (?, 'to-delete-token', ?)"
    )
      .bind(victim.id, new Date(Date.now() + 60_000).toISOString())
      .run();
    await env.DB.prepare(
      "INSERT INTO EmailLog (user_id, to_email, email_type, subject, status) VALUES (?, ?, 'test', 'subject', 'sent')"
    )
      .bind(victim.id, victim.email)
      .run();

    const del = await apiCall(`/api/admin/users/${victim.id}`, {
      method: 'DELETE',
      token: admin.token,
    });
    expect(del.status).toBe(200);

    const userRow = await env.DB.prepare('SELECT * FROM Users WHERE id = ?').bind(victim.id).first();
    expect(userRow).toBeNull();

    const authoredSubmissions = await env.DB.prepare('SELECT COUNT(*) AS n FROM Submissions WHERE author_id = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(authoredSubmissions?.n).toBe(0);

    const reviewedSubmissions = await env.DB.prepare('SELECT COUNT(*) AS n FROM Submissions WHERE reviewed_by = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(reviewedSubmissions?.n).toBe(0);

    const authoredTips = await env.DB.prepare('SELECT COUNT(*) AS n FROM Tips WHERE author_id = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(authoredTips?.n).toBe(0);

    const reviewedTips = await env.DB.prepare('SELECT COUNT(*) AS n FROM Tips WHERE reviewed_by = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(reviewedTips?.n).toBe(0);

    const reporterFeedback = await env.DB.prepare('SELECT COUNT(*) AS n FROM TipFeedback WHERE reporter_id = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(reporterFeedback?.n).toBe(0);

    const deletedTipFeedback = await env.DB.prepare('SELECT COUNT(*) AS n FROM TipFeedback WHERE tip_id = ?')
      .bind(tipByVictimId)
      .first<{ n: number }>();
    expect(deletedTipFeedback?.n).toBe(0);

    const victimTasks = await env.DB.prepare('SELECT COUNT(*) AS n FROM UserTasks WHERE user_id = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(victimTasks?.n).toBe(0);

    const assignedByRefs = await env.DB.prepare('SELECT COUNT(*) AS n FROM UserTasks WHERE assigned_by = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(assignedByRefs?.n).toBe(0);

    const reviewedByRefs = await env.DB.prepare('SELECT COUNT(*) AS n FROM UserTasks WHERE reviewed_by = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(reviewedByRefs?.n).toBe(0);

    const sessions = await env.DB.prepare('SELECT COUNT(*) AS n FROM Sessions WHERE user_id = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(sessions?.n).toBe(0);

    const resets = await env.DB.prepare('SELECT COUNT(*) AS n FROM PasswordResets WHERE user_id = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(resets?.n).toBe(0);

    const logs = await env.DB.prepare('SELECT COUNT(*) AS n FROM EmailLog WHERE user_id = ?')
      .bind(victim.id)
      .first<{ n: number }>();
    expect(logs?.n).toBe(0);
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

  it('sanitizes admin-entered task titles in email subjects', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const target = await createUserAndLogin();
    const messyTitle = 'Line one\r\nLine two ' + 'x'.repeat(200);

    const create = await apiCall('/api/admin/tasks', {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({ title: messyTitle, phase: 'first-week', audience: 'assigned' }),
    });
    expect(create.status).toBe(201);
    await apiCall(`/api/admin/tasks/${create.json.data.id}/assign`, {
      method: 'POST',
      token: admin.token,
      body: JSON.stringify({ user_ids: [target.id] }),
    });

    const log = await env.DB.prepare(
      "SELECT subject FROM EmailLog WHERE email_type = 'task_assigned' AND user_id = ?"
    )
      .bind(target.id)
      .first<{ subject: string }>();
    expect(log?.subject).toBeTruthy();
    expect(log!.subject).not.toMatch(/[\r\n]/);
    expect(log!.subject.length).toBeLessThanOrEqual(120);
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

    // Race guard: a second decision must not clobber the first.
    const mod2 = await createUserAndLogin({ role: 'moderator' });
    const reApprove = await apiCall(`/api/submissions/${post.json.id}/approve`, {
      method: 'PUT',
      token: mod2.token,
      body: JSON.stringify({ category_id: 1 }),
    });
    expect(reApprove.status).toBe(404);
    const reReject = await apiCall(`/api/submissions/${post.json.id}/reject`, {
      method: 'PUT',
      token: mod2.token,
      body: JSON.stringify({}),
    });
    expect(reReject.status).toBe(404);
    const still = await env.DB.prepare('SELECT status, reviewed_by FROM Submissions WHERE id = ?')
      .bind(post.json.id)
      .first<{ status: string; reviewed_by: number }>();
    expect(still?.status).toBe('approved');
    expect(still?.reviewed_by).toBe(mod.id);
  });

  it('supports end-to-end manual reassignment to a contact from site data', async () => {
    const staff = await createUserAndLogin();
    const mod = await createUserAndLogin({ role: 'moderator' });

    const contactInsert = await env.DB.prepare(
      `INSERT INTO KeyContacts (function_area, department, contact_name, title, email, is_active, display_order)
       VALUES ('IT Help Desk', 'UT Information Technology', 'Casey Support', 'Support Analyst', 'casey.support@utoledo.edu', 1, 1)`
    ).run();
    const contactId = contactInsert.meta.last_row_id as number;

    const post = await apiCall('/api/submissions', {
      method: 'POST',
      token: staff.token,
      body: JSON.stringify({
        proposed_title: 'Need MyUT access help',
        proposed_content: 'The onboarding site needs a clearer MyUT access escalation path.',
        request_type: 'access_request',
        topic_area: 'IT & Campus Access',
      }),
    });
    expect(post.status).toBe(201);

    const denied = await apiCall(`/api/submissions/${post.json.id}/assignment`, {
      method: 'PUT',
      token: staff.token,
      body: JSON.stringify({ contact_id: contactId }),
    });
    expect(denied.status).toBe(403);

    const reassigned = await apiCall(`/api/submissions/${post.json.id}/assignment`, {
      method: 'PUT',
      token: mod.token,
      body: JSON.stringify({
        contact_id: contactId,
        assignment_reason: 'Manual IT routing from moderation.',
      }),
    });
    expect(reassigned.status).toBe(200);
    expect(reassigned.json.data.assigned_team).toBe('IT Help Desk');
    expect(reassigned.json.data.assigned_to_name).toBe('Casey Support');
    expect(reassigned.json.data.assigned_to_email).toBe('casey.support@utoledo.edu');
    expect(reassigned.json.data.assignment_reason).toContain('Manual IT routing');
  });
});
