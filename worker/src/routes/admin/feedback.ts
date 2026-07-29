import { Hono } from 'hono';
import { AppEnv } from '../../types';

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

const feedback = new Hono<AppEnv>();

/** GET /api/admin/feedback?status=open|resolved|all */
feedback.get('/', async (c) => {
  const status = c.req.query('status') || 'open';
  const requested = Number(c.req.query('limit'));
  // Math.min alone lets a negative value through, and SQLite treats a negative
  // LIMIT as unlimited.
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const where = status === 'all' ? '' : 'WHERE PageFeedback.status = ?';
  const stmt = c.env.DB.prepare(
    `SELECT PageFeedback.*, Users.email AS reporter_email
     FROM PageFeedback
     LEFT JOIN Users ON Users.id = PageFeedback.user_id
     ${where}
     ORDER BY PageFeedback.created_at DESC
     LIMIT ?`
  );

  const { results } = await (status === 'all'
    ? stmt.bind(limit)
    : stmt.bind(status, limit)
  ).all();

  const open = await c.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM PageFeedback WHERE status = 'open'"
  ).first<{ count: number }>();

  return c.json({ success: true, data: results, open_count: open?.count ?? 0 });
});

/** PUT /api/admin/feedback/:id — { status: 'open' | 'resolved' } */
feedback.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id) || id <= 0) {
    return c.json({ success: false, error: 'Valid feedback id is required' }, 400);
  }

  const body = await c.req.json<{ status?: string }>().catch(() => ({}) as { status?: string });
  if (body.status !== 'open' && body.status !== 'resolved') {
    return c.json({ success: false, error: "status must be 'open' or 'resolved'" }, 400);
  }

  const me = c.get('currentUser');
  const info = await c.env.DB.prepare(
    `UPDATE PageFeedback
     SET status = ?,
         resolved_at = CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP ELSE NULL END,
         resolved_by = CASE WHEN ? = 'resolved' THEN ? ELSE NULL END
     WHERE id = ?`
  )
    .bind(body.status, body.status, body.status, me.id, id)
    .run();

  if (!info.meta.changes) {
    return c.json({ success: false, error: 'Feedback not found' }, 404);
  }
  return c.json({ success: true, message: 'Updated.' });
});

export default feedback;
