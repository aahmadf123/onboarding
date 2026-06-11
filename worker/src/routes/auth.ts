import { Context, Hono } from 'hono';
import { AppEnv, PublicUser, UserRow, toPublicUser } from '../types';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limit';
import {
  generatePasscode,
  generateToken,
  hashPassword,
  sha256Hex,
  verifyPassword,
} from '../services/passwords';
import { sendEmail } from '../services/email';
import { inviteEmail, passwordResetEmail } from '../services/email-templates';
import { getConfig } from '../services/config';

const SESSION_DAYS = 30;
const RESET_TOKEN_MINUTES = 60;
export const PASSCODE_DAYS = 14;
const MIN_PASSWORD_LENGTH = 10;

const auth = new Hono<AppEnv>();

interface LoginResponse {
  token: string;
  user: PublicUser;
  must_reset: boolean;
  localstorage_migrated: boolean;
}

function isoIn(ms: number): string {
  return new Date(Date.now() + ms).toISOString();
}

async function createSession(c: Context<AppEnv>, userId: number): Promise<string> {
  const token = generateToken();
  const tokenHash = await sha256Hex(token);
  await c.env.DB.prepare(
    `INSERT INTO Sessions (user_id, token_hash, expires_at, last_used_at, user_agent, ip)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?)`
  )
    .bind(
      userId,
      tokenHash,
      isoIn(SESSION_DAYS * 24 * 60 * 60 * 1000),
      c.req.header('user-agent')?.slice(0, 255) ?? null,
      c.req.header('cf-connecting-ip') ?? null
    )
    .run();
  return token;
}

function validateNewPassword(password: string, email: string): string | null {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password.toLowerCase() === email.toLowerCase()) {
    return 'Password must not be your email address';
  }
  return null;
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
auth.post('/login', rateLimit(10), async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => ({}) as { email?: string; password?: string });
  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  if (!email || !password) {
    return c.json({ success: false, error: 'Email and password are required' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT * FROM Users WHERE email = ? COLLATE NOCASE')
    .bind(email)
    .first<UserRow>();

  const invalid = () => c.json({ success: false, error: 'Invalid email or password' }, 401);
  if (!user || !user.password_hash) return invalid();
  if (user.status === 'disabled') {
    return c.json({ success: false, error: 'This account has been disabled. Contact an administrator.' }, 403);
  }
  if (!(await verifyPassword(password, user.password_hash))) return invalid();

  // Correct passcode but past its expiry: require a fresh invite.
  if (
    user.must_reset &&
    !user.password_set_at &&
    user.passcode_expires_at &&
    new Date(user.passcode_expires_at).getTime() <= Date.now()
  ) {
    return c.json(
      { success: false, error: 'Your invite passcode has expired. Ask an administrator to send a new invite.' },
      401
    );
  }

  const token = await createSession(c, user.id);
  await c.env.DB.prepare('UPDATE Users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(user.id)
    .run();

  const data: LoginResponse = {
    token,
    user: toPublicUser(user),
    must_reset: !!user.must_reset,
    localstorage_migrated: !!user.localstorage_migrated_at,
  };
  return c.json({ success: true, data });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
auth.get('/me', requireAuth, async (c) => {
  const user = c.get('currentUser');
  return c.json({
    success: true,
    data: {
      user: toPublicUser(user),
      must_reset: !!user.must_reset,
      localstorage_migrated: !!user.localstorage_migrated_at,
    },
  });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
auth.post('/logout', requireAuth, async (c) => {
  await c.env.DB.prepare('DELETE FROM Sessions WHERE id = ?').bind(c.get('sessionId')).run();
  return c.json({ success: true, message: 'Signed out' });
});

// ── POST /api/auth/change-password ────────────────────────────────────────────
// Also completes the forced first-login reset (passcode = current password).
auth.post('/change-password', requireAuth, async (c) => {
  const user = c.get('currentUser');
  const body = await c.req
    .json<{ current_password?: string; new_password?: string }>()
    .catch(() => ({}) as { current_password?: string; new_password?: string });

  if (!body.current_password || !body.new_password) {
    return c.json({ success: false, error: 'current_password and new_password are required' }, 400);
  }
  if (!(await verifyPassword(body.current_password, user.password_hash))) {
    return c.json({ success: false, error: 'Current password is incorrect' }, 401);
  }
  const policyError = validateNewPassword(body.new_password, user.email);
  if (policyError) return c.json({ success: false, error: policyError }, 400);

  const newHash = await hashPassword(body.new_password);
  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE Users SET password_hash = ?, must_reset = 0, status = 'active',
       password_set_at = CURRENT_TIMESTAMP, passcode_expires_at = NULL WHERE id = ?`
    ).bind(newHash, user.id),
    // Sign out every other device/session
    c.env.DB.prepare('DELETE FROM Sessions WHERE user_id = ? AND id != ?').bind(
      user.id,
      c.get('sessionId')
    ),
  ]);

  const updated = await c.env.DB.prepare('SELECT * FROM Users WHERE id = ?')
    .bind(user.id)
    .first<UserRow>();
  return c.json({
    success: true,
    data: {
      user: toPublicUser(updated as UserRow),
      must_reset: false,
      localstorage_migrated: !!updated?.localstorage_migrated_at,
    },
  });
});

// ── POST /api/auth/forgot ─────────────────────────────────────────────────────
// Always answers 200 so account existence can't be probed.
auth.post('/forgot', rateLimit(5), async (c) => {
  const body = await c.req.json<{ email?: string }>().catch(() => ({}) as { email?: string });
  const email = (body.email ?? '').trim().toLowerCase();
  const reply = () =>
    c.json({ success: true, message: 'If that account exists, a reset link is on its way.' });
  if (!email) return reply();

  const user = await c.env.DB.prepare('SELECT * FROM Users WHERE email = ? COLLATE NOCASE')
    .bind(email)
    .first<UserRow>();
  if (!user || user.status === 'disabled') return reply();

  const token = generateToken();
  await c.env.DB.prepare(
    'INSERT INTO PasswordResets (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
  )
    .bind(user.id, await sha256Hex(token), isoIn(RESET_TOKEN_MINUTES * 60 * 1000))
    .run();

  const baseUrl = await getConfig(c.env.DB, 'app_base_url');
  const content = passwordResetEmail({
    name: user.name,
    email: user.email,
    resetUrl: `${baseUrl}/reset-password?token=${token}`,
  });
  await sendEmail(c.env, {
    to: user.email,
    subject: content.subject,
    html: content.html,
    type: 'password_reset',
    userId: user.id,
  });
  return reply();
});

// ── POST /api/auth/reset ──────────────────────────────────────────────────────
auth.post('/reset', rateLimit(10), async (c) => {
  const body = await c.req
    .json<{ token?: string; new_password?: string }>()
    .catch(() => ({}) as { token?: string; new_password?: string });
  if (!body.token || !body.new_password) {
    return c.json({ success: false, error: 'token and new_password are required' }, 400);
  }

  const tokenHash = await sha256Hex(body.token.trim());
  const reset = await c.env.DB.prepare(
    'SELECT * FROM PasswordResets WHERE token_hash = ? AND used_at IS NULL'
  )
    .bind(tokenHash)
    .first<{ id: number; user_id: number; expires_at: string }>();
  if (!reset || new Date(reset.expires_at).getTime() <= Date.now()) {
    return c.json({ success: false, error: 'This reset link is invalid or has expired.' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT * FROM Users WHERE id = ?')
    .bind(reset.user_id)
    .first<UserRow>();
  if (!user || user.status === 'disabled') {
    return c.json({ success: false, error: 'This reset link is invalid or has expired.' }, 400);
  }

  const policyError = validateNewPassword(body.new_password, user.email);
  if (policyError) return c.json({ success: false, error: policyError }, 400);

  const newHash = await hashPassword(body.new_password);
  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE Users SET password_hash = ?, must_reset = 0, status = 'active',
       password_set_at = CURRENT_TIMESTAMP, passcode_expires_at = NULL WHERE id = ?`
    ).bind(newHash, user.id),
    c.env.DB.prepare('UPDATE PasswordResets SET used_at = CURRENT_TIMESTAMP WHERE id = ?').bind(
      reset.id
    ),
    c.env.DB.prepare('DELETE FROM Sessions WHERE user_id = ?').bind(user.id),
  ]);

  return c.json({ success: true, message: 'Password updated. You can sign in now.' });
});

// ── POST /api/auth/bootstrap ──────────────────────────────────────────────────
// One-time first-admin setup, guarded by the BOOTSTRAP_TOKEN secret. Issues
// the initial passcode for the seeded admin and returns it in the response —
// deliberate, because in Resend sandbox mode the email may only reach the
// Resend account owner. Inert once every admin has a password.
auth.post('/bootstrap', async (c) => {
  if (!c.env.BOOTSTRAP_TOKEN) {
    return c.json({ success: false, error: 'Not found' }, 404);
  }
  const provided = c.req.header('x-bootstrap-token') ?? '';
  if ((await sha256Hex(provided)) !== (await sha256Hex(c.env.BOOTSTRAP_TOKEN))) {
    return c.json({ success: false, error: 'Invalid bootstrap token' }, 403);
  }

  const admin = await c.env.DB.prepare(
    "SELECT * FROM Users WHERE role = 'admin' AND password_hash IS NULL ORDER BY id LIMIT 1"
  ).first<UserRow>();
  if (!admin) {
    return c.json(
      { success: false, error: 'Bootstrap already completed — all admins have credentials.' },
      409
    );
  }

  const passcode = generatePasscode();
  await c.env.DB.prepare(
    `UPDATE Users SET password_hash = ?, must_reset = 1, status = 'invited',
     passcode_expires_at = ?, invited_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(await hashPassword(passcode), isoIn(PASSCODE_DAYS * 24 * 60 * 60 * 1000), admin.id)
    .run();

  const baseUrl = await getConfig(c.env.DB, 'app_base_url');
  const content = inviteEmail({ name: admin.name, email: admin.email, passcode, baseUrl });
  await sendEmail(c.env, {
    to: admin.email,
    subject: content.subject,
    html: content.html,
    type: 'invite',
    userId: admin.id,
  });

  return c.json({ success: true, data: { email: admin.email, passcode } });
});

export default auth;
