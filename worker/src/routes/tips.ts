import { Hono } from 'hono';
import { Bindings } from '../types';

const tips = new Hono<{ Bindings: Bindings }>();

// GET tips — public returns only approved; pass ?status= to filter by status (for moderation queue)
tips.get('/', async (c) => {
  const categoryId = c.req.query('category_id');
  const tag = c.req.query('tag');
  const status = c.req.query('status') ?? 'approved';

  let query = `
    SELECT Tips.*, Users.email as author_email, Categories.name as category_name
    FROM Tips
    LEFT JOIN Users ON Tips.author_id = Users.id
    LEFT JOIN Categories ON Tips.category_id = Categories.id
    WHERE Tips.status = ?
  `;
  const bindings: unknown[] = [status];

  if (categoryId) {
    query += ' AND Tips.category_id = ?';
    bindings.push(categoryId);
  }

  if (tag) {
    query += ' AND Tips.tags LIKE ?';
    bindings.push(`%${tag}%`);
  }

  query += ' ORDER BY Tips.approved_at DESC, Tips.submitted_at DESC';

  const stmt = c.env.DB.prepare(query);
  const { results } = await stmt.bind(...bindings).all();
  return c.json({ success: true, data: results });
});

// GET single tip by ID
tips.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(`
    SELECT Tips.*, Users.email as author_email, Categories.name as category_name
    FROM Tips
    LEFT JOIN Users ON Tips.author_id = Users.id
    LEFT JOIN Categories ON Tips.category_id = Categories.id
    WHERE Tips.id = ?
  `)
    .bind(id)
    .first();
  if (!result) return c.json({ success: false, error: 'Tip not found' }, 404);
  return c.json({ success: true, data: result });
});

// POST submit a new tip (any authenticated user)
tips.post('/', async (c) => {
  const body = await c.req.json<{
    author_id: number;
    category_id?: number;
    title: string;
    content: string;
    tags?: string;
  }>();

  if (!body.author_id || !body.title || !body.content) {
    return c.json(
      { success: false, error: 'author_id, title and content are required' },
      400
    );
  }

  const info = await c.env.DB.prepare(
    'INSERT INTO Tips (author_id, category_id, title, content, tags) VALUES (?,?,?,?,?)'
  )
    .bind(
      body.author_id,
      body.category_id ?? null,
      body.title,
      body.content,
      body.tags ?? null
    )
    .run();

  return c.json(
    { success: true, message: 'Tip submitted for moderation.', id: info.meta.last_row_id },
    201
  );
});

// PUT approve a tip (moderator / admin)
tips.put('/:id/approve', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ reviewed_by: number; review_notes?: string }>();

  if (!body.reviewed_by) {
    return c.json({ success: false, error: 'reviewed_by is required' }, 400);
  }

  const now = new Date().toISOString();
  const result = await c.env.DB.prepare(
    `UPDATE Tips
     SET status = 'approved', reviewed_by = ?, review_notes = ?, approved_at = ?, last_updated = ?
     WHERE id = ? AND status = 'pending'`
  )
    .bind(body.reviewed_by, body.review_notes ?? null, now, now, id)
    .run();

  if (result.meta.changes === 0) {
    return c.json(
      { success: false, error: 'Tip not found or already reviewed' },
      404
    );
  }

  return c.json({ success: true, message: 'Tip approved and published.' });
});

// PUT reject a tip (moderator / admin)
tips.put('/:id/reject', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ reviewed_by: number; review_notes?: string }>();

  if (!body.reviewed_by) {
    return c.json({ success: false, error: 'reviewed_by is required' }, 400);
  }

  const now = new Date().toISOString();
  const result = await c.env.DB.prepare(
    `UPDATE Tips
     SET status = 'rejected', reviewed_by = ?, review_notes = ?, last_updated = ?
     WHERE id = ? AND status = 'pending'`
  )
    .bind(body.reviewed_by, body.review_notes ?? null, now, id)
    .run();

  if (result.meta.changes === 0) {
    return c.json(
      { success: false, error: 'Tip not found or already reviewed' },
      404
    );
  }

  return c.json({ success: true, message: 'Tip rejected.' });
});

// POST report / flag a tip (TipFeedback)
tips.post('/:id/feedback', async (c) => {
  const tipId = c.req.param('id');
  const body = await c.req.json<{
    reporter_id: number;
    reason: string;
    details?: string;
  }>();

  if (!body.reporter_id || !body.reason) {
    return c.json(
      { success: false, error: 'reporter_id and reason are required' },
      400
    );
  }

  const info = await c.env.DB.prepare(
    'INSERT INTO TipFeedback (tip_id, reporter_id, reason, details) VALUES (?,?,?,?)'
  )
    .bind(tipId, body.reporter_id, body.reason, body.details ?? null)
    .run();

  return c.json(
    { success: true, message: 'Feedback submitted.', id: info.meta.last_row_id },
    201
  );
});

export default tips;
