import { Hono } from 'hono';
import { AppEnv } from '../../types';
import { BEHIND_USERS_SQL } from '../../services/reminders';

const behind = new Hono<AppEnv>();

/**
 * GET /api/admin/behind — active users with outstanding required or assigned
 * tasks.
 *
 * Mail to utoledo.edu addresses is filtered, so the per-user weekly reminder
 * cannot be relied on to land. This gives HR a list they can act on directly,
 * and it works regardless of email.
 */
behind.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(BEHIND_USERS_SQL).all();
  return c.json({ success: true, data: results });
});

export default behind;
