import { Hono } from 'hono';
import { AppEnv } from '../types';
import { requireRole } from '../middleware/auth';

const tips = new Hono<AppEnv>();

// GET moderation queue (moderator/admin only) — must be before /:id
tips.get('/queue', requireRole('moderator', 'admin'), async (c) => {
  const status = c.req.query('status') || 'pending';
  const { results } = await c.env.DB.prepare(`
    SELECT Tips.*, Users.email as author_email, Categories.name as category_name
    FROM Tips
    LEFT JOIN Users ON Tips.author_id = Users.id
    LEFT JOIN Categories ON Tips.category_id = Categories.id
    WHERE Tips.status = ?
    ORDER BY Tips.submitted_at DESC
  `).bind(status).all();
  return c.json({ success: true, data: results });
});

// GET approved tips (optionally filter by category or tags)
tips.get('/', async (c) => {
  const categoryId = c.req.query('category_id');
  const tag = c.req.query('tag');

  let query = `
    SELECT Tips.*, Users.email as author_email, Categories.name as category_name
    FROM Tips
    LEFT JOIN Users ON Tips.author_id = Users.id
    LEFT JOIN Categories ON Tips.category_id = Categories.id
    WHERE Tips.status = 'approved'
  `;
  const bindings: unknown[] = [];

  if (categoryId) {
    query += ' AND Tips.category_id = ?';
    bindings.push(categoryId);
  }

  if (tag) {
    query += ' AND Tips.tags LIKE ?';
    bindings.push(`%${tag}%`);
  }

  query += ' ORDER BY Tips.approved_at DESC';

  const stmt = c.env.DB.prepare(query);
  const { results } =
    bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
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

// POST submit a new tip (author = the signed-in user)
tips.post('/', async (c) => {
  const author = c.get('currentUser');
  const body = await c.req.json<{
    category_id?: number;
    title: string;
    content: string;
    tags?: string;
  }>();

  if (!body.title || !body.content) {
    return c.json(
      { success: false, error: 'title and content are required' },
      400
    );
  }

  const info = await c.env.DB.prepare(
    'INSERT INTO Tips (author_id, category_id, title, content, tags) VALUES (?,?,?,?,?)'
  )
    .bind(
      author.id,
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

// PUT approve a tip (reviewer = the signed-in moderator/admin)
tips.put('/:id/approve', requireRole('moderator', 'admin'), async (c) => {
  const reviewer = c.get('currentUser');
  const id = c.req.param('id');
  const body = await c.req
    .json<{ review_notes?: string }>()
    .catch(() => ({}) as { review_notes?: string });

  const now = new Date().toISOString();
  const result = await c.env.DB.prepare(
    `UPDATE Tips
     SET status = 'approved', reviewed_by = ?, review_notes = ?, approved_at = ?, last_updated = ?
     WHERE id = ? AND status = 'pending'`
  )
    .bind(reviewer.id, body.review_notes ?? null, now, now, id)
    .run();

  if (result.meta.changes === 0) {
    return c.json(
      { success: false, error: 'Tip not found or already reviewed' },
      404
    );
  }

  return c.json({ success: true, message: 'Tip approved and published.' });
});

// PUT reject a tip (reviewer = the signed-in moderator/admin)
tips.put('/:id/reject', requireRole('moderator', 'admin'), async (c) => {
  const reviewer = c.get('currentUser');
  const id = c.req.param('id');
  const body = await c.req
    .json<{ review_notes?: string }>()
    .catch(() => ({}) as { review_notes?: string });

  const now = new Date().toISOString();
  const result = await c.env.DB.prepare(
    `UPDATE Tips
     SET status = 'rejected', reviewed_by = ?, review_notes = ?, last_updated = ?
     WHERE id = ? AND status = 'pending'`
  )
    .bind(reviewer.id, body.review_notes ?? null, now, id)
    .run();

  if (result.meta.changes === 0) {
    return c.json(
      { success: false, error: 'Tip not found or already reviewed' },
      404
    );
  }

  return c.json({ success: true, message: 'Tip rejected.' });
});

// POST report / flag a tip (reporter = the signed-in user)
tips.post('/:id/feedback', async (c) => {
  const reporter = c.get('currentUser');
  const tipId = c.req.param('id');
  const body = await c.req.json<{
    reason?: string;
    details?: string;
    feedback?: string;
  }>();

  // The site-wide FeedbackButton posts { feedback } against tip id 0.
  const reason = body.reason ?? (body.feedback ? 'page_issue' : '');
  const details = body.details ?? body.feedback ?? null;
  if (!reason) {
    return c.json({ success: false, error: 'reason is required' }, 400);
  }

  const info = await c.env.DB.prepare(
    'INSERT INTO TipFeedback (tip_id, reporter_id, reason, details) VALUES (?,?,?,?)'
  )
    .bind(tipId, reporter.id, reason, details)
    .run();

  return c.json(
    { success: true, message: 'Feedback submitted.', id: info.meta.last_row_id },
    201
  );
});

export default tips;
