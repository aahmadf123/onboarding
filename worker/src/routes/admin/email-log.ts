import { Hono } from 'hono';
import { AppEnv } from '../../types';

const emailLog = new Hono<AppEnv>();

// GET /api/admin/email-log?type=&status=&limit=&offset=
emailLog.get('/', async (c) => {
  const type = c.req.query('type');
  const status = c.req.query('status');
  const limit = Math.min(Number(c.req.query('limit')) || 50, 200);
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0);

  const conditions: string[] = [];
  const binds: unknown[] = [];
  if (type) {
    conditions.push('email_type = ?');
    binds.push(type);
  }
  if (status) {
    conditions.push('status = ?');
    binds.push(status);
  }
  const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM EmailLog${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`
  )
    .bind(...binds, limit, offset)
    .all();
  return c.json({ success: true, data: results });
});

export default emailLog;
