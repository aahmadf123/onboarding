import { Hono } from 'hono';
import { asTrimmedString } from '../../services/http';
import { AppEnv, Role, UserRow } from '../../types';
import { generatePasscode, hashPassword } from '../../services/passwords';
import { sendEmail } from '../../services/email';
import { inviteEmail } from '../../services/email-templates';
import { getConfig } from '../../services/config';
import { PASSCODE_DAYS } from '../auth';
import { PRIMARY_SUPERADMIN_EMAIL } from '../../constants';

const users = new Hono<AppEnv>();

const VALID_ROLES: Role[] = ['staff', 'moderator', 'admin'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIST_FIELDS = `id, email, name, role, status, must_reset, created_at,
  invited_at, last_login_at, passcode_expires_at`;

function passcodeExpiry(): string {
  return new Date(Date.now() + PASSCODE_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

async function issuePasscodeAndInvite(
  c: { env: AppEnv['Bindings'] },
  user: Pick<UserRow, 'id' | 'email' | 'name'>
): Promise<string> {
  const passcode = generatePasscode();
  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE Users SET password_hash = ?, must_reset = 1, status = 'invited',
       password_set_at = NULL, passcode_expires_at = ?, invited_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(await hashPassword(passcode), passcodeExpiry(), user.id),
    c.env.DB.prepare('DELETE FROM Sessions WHERE user_id = ?').bind(user.id),
    // A re-invite replaces the credential, so any reset link already in flight
    // must stop working with it. Otherwise an emailed link issued minutes ago
    // still sets a password on an account the admin has just re-secured.
    c.env.DB.prepare(
      'UPDATE PasswordResets SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL'
    ).bind(user.id),
    // Fresh credential, fresh throttle state.
    c.env.DB.prepare(
      'UPDATE Users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?'
    ).bind(user.id),
  ]);

  const baseUrl = await getConfig(c.env.DB, 'app_base_url');
  const content = inviteEmail({ name: user.name, email: user.email, passcode, baseUrl });
  await sendEmail(c.env, {
    to: user.email,
    subject: content.subject,
    html: content.html,
    type: 'invite',
    userId: user.id,
  });
  return passcode;
}

// GET /api/admin/users
users.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ${LIST_FIELDS} FROM Users ORDER BY created_at DESC`
  ).all();
  return c.json({ success: true, data: results });
});

// POST /api/admin/users — invite a new user.
// The generated passcode is returned ONCE in the response so the admin can
// hand it over out-of-band while email delivery runs in sandbox mode.
users.post('/', async (c) => {
  const body = await c.req
    .json<{ email?: string; name?: string; role?: string }>()
    .catch(() => ({}) as { email?: string; name?: string; role?: string });
  const email = asTrimmedString(body.email).toLowerCase();
  const name = asTrimmedString(body.name) || null;
  const role = (body.role ?? 'staff') as Role;

  if (!EMAIL_RE.test(email)) {
    return c.json({ success: false, error: 'A valid email address is required' }, 400);
  }
  if (!VALID_ROLES.includes(role)) {
    return c.json({ success: false, error: 'Invalid role' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM Users WHERE email = ? COLLATE NOCASE')
    .bind(email)
    .first();
  if (existing) {
    return c.json(
      { success: false, error: 'A user with this email already exists. Use re-invite instead.' },
      409
    );
  }

  const info = await c.env.DB.prepare(
    "INSERT INTO Users (email, name, role, status, must_reset, invited_at) VALUES (?, ?, ?, 'invited', 1, CURRENT_TIMESTAMP)"
  )
    .bind(email, name, role)
    .run();
  const userId = info.meta.last_row_id as number;
  const passcode = await issuePasscodeAndInvite(c, { id: userId, email, name });

  const user = await c.env.DB.prepare(`SELECT ${LIST_FIELDS} FROM Users WHERE id = ?`)
    .bind(userId)
    .first();
  return c.json({ success: true, data: { user, passcode } }, 201);
});

// POST /api/admin/users/:id/reinvite — rotate the passcode and reset the
// account to invited state (also works as an admin-forced password reset).
users.post('/:id/reinvite', async (c) => {
  const id = Number(c.req.param('id'));
  const user = await c.env.DB.prepare('SELECT * FROM Users WHERE id = ?')
    .bind(id)
    .first<UserRow>();
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);
  if (user.status === 'disabled') {
    return c.json({ success: false, error: 'Re-enable the account before re-inviting.' }, 400);
  }

  const passcode = await issuePasscodeAndInvite(c, user);
  const updated = await c.env.DB.prepare(`SELECT ${LIST_FIELDS} FROM Users WHERE id = ?`)
    .bind(id)
    .first();
  return c.json({ success: true, data: { user: updated, passcode } });
});

// PUT /api/admin/users/:id — { name?, role?, status? }
users.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const me = c.get('currentUser');
  const body = await c.req
    .json<{ name?: string; role?: string; status?: string }>()
    .catch(() => ({}) as { name?: string; role?: string; status?: string });

  const user = await c.env.DB.prepare('SELECT * FROM Users WHERE id = ?')
    .bind(id)
    .first<UserRow>();
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);

  const sets: string[] = [];
  const binds: unknown[] = [];

  if (body.name !== undefined) {
    sets.push('name = ?');
    binds.push(asTrimmedString(body.name) || null);
  }
  if (body.role !== undefined) {
    if (!VALID_ROLES.includes(body.role as Role)) {
      return c.json({ success: false, error: 'Invalid role' }, 400);
    }
    if (id === me.id && body.role !== me.role) {
      return c.json({ success: false, error: 'You cannot change your own role.' }, 400);
    }
    sets.push('role = ?');
    binds.push(body.role);
  }
  if (body.status !== undefined) {
    if (!['active', 'disabled'].includes(body.status)) {
      return c.json({ success: false, error: 'Status must be active or disabled' }, 400);
    }
    if (id === me.id && body.status === 'disabled') {
      return c.json({ success: false, error: 'You cannot disable your own account.' }, 400);
    }
    sets.push('status = ?');
    binds.push(body.status);
  }

  if (sets.length === 0) {
    return c.json({ success: false, error: 'Nothing to update' }, 400);
  }

  binds.push(id);
  await c.env.DB.prepare(`UPDATE Users SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...binds)
    .run();
  if (body.status === 'disabled') {
    await c.env.DB.prepare('DELETE FROM Sessions WHERE user_id = ?').bind(id).run();
  }

  const updated = await c.env.DB.prepare(`SELECT ${LIST_FIELDS} FROM Users WHERE id = ?`)
    .bind(id)
    .first();
  return c.json({ success: true, data: updated });
});

// DELETE /api/admin/users/:id — permanently remove a user and related data.
users.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const me = c.get('currentUser');

  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ success: false, error: 'Valid user id is required' }, 400);
  }
  if (id === me.id) {
    return c.json({ success: false, error: 'You cannot delete your own account.' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT id, email FROM Users WHERE id = ?')
    .bind(id)
    .first<{ id: number; email: string }>();
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  if (user.email.toLowerCase() === PRIMARY_SUPERADMIN_EMAIL) {
    return c.json({ success: false, error: 'Primary super admin cannot be deleted.' }, 400);
  }

  // Preserve historical rows where this user acted as reviewer/assigner by
  // nulling those references, but remove content they authored/reported.
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM Sessions WHERE user_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM PasswordResets WHERE user_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM EmailLog WHERE user_id = ?').bind(id),

    // Tasks.created_by has a foreign key to Users(id). Leaving it set aborted
    // the whole batch with a constraint error when deleting any admin who had
    // ever created a task, which surfaced as an unhandled 500.
    c.env.DB.prepare('UPDATE Tasks SET created_by = NULL WHERE created_by = ?').bind(id),

    // Keep the report, drop the link to the deleted account.
    c.env.DB.prepare('UPDATE PageFeedback SET user_id = NULL WHERE user_id = ?').bind(id),
    c.env.DB.prepare('UPDATE PageFeedback SET resolved_by = NULL WHERE resolved_by = ?').bind(id),

    c.env.DB.prepare('UPDATE UserTasks SET assigned_by = NULL WHERE assigned_by = ?').bind(id),
    c.env.DB.prepare('UPDATE UserTasks SET reviewed_by = NULL WHERE reviewed_by = ?').bind(id),
    c.env.DB.prepare('DELETE FROM UserTasks WHERE user_id = ?').bind(id),

    c.env.DB.prepare('UPDATE Submissions SET reviewed_by = NULL WHERE reviewed_by = ?').bind(id),
    c.env.DB.prepare('DELETE FROM Submissions WHERE author_id = ?').bind(id),

    c.env.DB.prepare('UPDATE Tips SET reviewed_by = NULL WHERE reviewed_by = ?').bind(id),
    c.env.DB.prepare('DELETE FROM TipFeedback WHERE reporter_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM TipFeedback WHERE tip_id IN (SELECT id FROM Tips WHERE author_id = ?)').bind(id),
    c.env.DB.prepare('DELETE FROM Tips WHERE author_id = ?').bind(id),

    c.env.DB.prepare('DELETE FROM Users WHERE id = ?').bind(id),
  ]);

  return c.json({ success: true, message: 'User deleted successfully.' });
});

export default users;
