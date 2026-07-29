import { Context, Next } from 'hono';
import { AppEnv, Role, UserRow } from '../types';
import { sha256Hex } from '../services/passwords';

type AppContext = Context<AppEnv>;

interface SessionUser {
  user: UserRow;
  sessionId: number;
}

/**
 * Resolves the user for the request's `Authorization: Bearer <token>` header.
 * Returns null for missing/unknown/expired tokens.
 */
export async function getSessionUser(c: AppContext): Promise<SessionUser | null> {
  const header = c.req.header('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const tokenHash = await sha256Hex(match[1].trim());
  const row = await c.env.DB.prepare(
    `SELECT Sessions.id AS session_id, Sessions.expires_at, Sessions.last_used_at, Users.*
     FROM Sessions
     JOIN Users ON Users.id = Sessions.user_id
     WHERE Sessions.token_hash = ?`
  )
    .bind(tokenHash)
    .first<UserRow & { session_id: number; expires_at: string; last_used_at: string | null }>();

  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await c.env.DB.prepare('DELETE FROM Sessions WHERE id = ?').bind(row.session_id).run();
    return null;
  }

  // Touch last_used_at at most once per hour to avoid a write per request.
  const lastUsed = row.last_used_at ? new Date(row.last_used_at).getTime() : 0;
  if (Date.now() - lastUsed > 60 * 60 * 1000) {
    c.executionCtx.waitUntil(
      c.env.DB.prepare('UPDATE Sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(row.session_id)
        .run()
    );
  }

  const { session_id, expires_at, last_used_at, ...user } = row;
  void expires_at;
  void last_used_at;
  return { user: user as UserRow, sessionId: session_id };
}

/**
 * Global gate for /api/*. Skips /api/auth/* (those routes manage their own
 * auth). Everything else requires a valid session; disabled accounts are
 * rejected; accounts flagged must_reset are blocked until the password is
 * changed (the client reacts to code PASSWORD_RESET_REQUIRED).
 */
export async function authGate(c: AppContext, next: Next) {
  if (c.req.path.startsWith('/api/auth/')) {
    return next();
  }

  const session = await getSessionUser(c);
  if (!session) {
    return c.json({ success: false, error: 'Authentication required' }, 401);
  }
  if (session.user.status === 'disabled') {
    return c.json(
      { success: false, error: 'Account disabled', code: 'ACCOUNT_DISABLED' },
      403
    );
  }
  if (session.user.must_reset) {
    return c.json(
      { success: false, error: 'Password reset required', code: 'PASSWORD_RESET_REQUIRED' },
      403
    );
  }

  c.set('currentUser', session.user);
  c.set('sessionId', session.sessionId);
  await next();
}

/**
 * Requires a valid session without the must_reset restriction — used inside
 * /api/auth/* for me/change-password/logout, which must work while the user
 * is still completing their forced password reset.
 */
export async function requireAuth(c: AppContext, next: Next) {
  const session = await getSessionUser(c);
  if (!session) {
    return c.json({ success: false, error: 'Authentication required' }, 401);
  }
  if (session.user.status === 'disabled') {
    return c.json(
      { success: false, error: 'Account disabled', code: 'ACCOUNT_DISABLED' },
      403
    );
  }
  c.set('currentUser', session.user);
  c.set('sessionId', session.sessionId);
  await next();
}

/**
 * Returns middleware that requires the caller to have at least one of the
 * listed roles. Must run behind authGate/requireAuth (reads the user from
 * context — no extra DB hit).
 */
export function requireRole(...roles: Role[]) {
  return async (c: AppContext, next: Next) => {
    const user = c.get('currentUser');
    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    if (!roles.includes(user.role)) {
      return c.json({ success: false, error: 'Insufficient permissions' }, 403);
    }
    await next();
  };
}
