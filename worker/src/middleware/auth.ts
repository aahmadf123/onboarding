import { Context, Next } from 'hono';
import { Bindings, UserRow } from '../types';

type Role = 'staff' | 'moderator' | 'admin';

/**
 * Returns middleware that requires the caller to have at least one of the
 * listed roles.  The role is looked up via the `x-user-id` request header.
 */
export function requireRole(...roles: Role[]) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    const user = await c.env.DB.prepare(
      'SELECT id, email, role FROM Users WHERE id = ?'
    )
      .bind(userId)
      .first<UserRow>();

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 401);
    }

    if (!roles.includes(user.role as Role)) {
      return c.json({ success: false, error: 'Insufficient permissions' }, 403);
    }

    // Attach user to context variables for downstream handlers
    c.set('currentUser' as never, user);
    await next();
  };
}
