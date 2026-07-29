import { Hono } from 'hono';
import { pageBounds } from '../services/http';
import { AppEnv } from '../types';
import { requireRole } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limit';
import { readJson, badBody } from '../services/http';

const tips = new Hono<AppEnv>();

/**
 * Columns any signed-in user may see.
 *
 * `Tips.*` also carries reviewed_by and review_notes — a moderator's private
 * notes about a submission — and the joins add the author's email address.
 * Those belong to the queue view, not to general reads.
 */
const PUBLIC_TIP_FIELDS = `
  Tips.id, Tips.category_id, Tips.title, Tips.content, Tips.tags, Tips.status,
  Tips.submitted_at, Tips.approved_at, Tips.last_updated,
  Categories.name as category_name
`;

const MODERATOR_TIP_FIELDS = `
  Tips.*, Users.email as author_email, Categories.name as category_name
`;

function isModerator(role: string): boolean {
  return role === 'moderator' || role === 'admin';
}

// GET moderation queue (moderator/admin only) — must be before /:id
tips.get('/queue', requireRole('moderator', 'admin'), async (c) => {
  const status = c.req.query('status') || 'pending';
  const queuePage = pageBounds(c);
  const { results } = await c.env.DB.prepare(`
    SELECT Tips.*, Users.email as author_email, Categories.name as category_name
    FROM Tips
    LEFT JOIN Users ON Tips.author_id = Users.id
    LEFT JOIN Categories ON Tips.category_id = Categories.id
    WHERE Tips.status = ?
    ORDER BY Tips.submitted_at DESC
    LIMIT ? OFFSET ?
  `).bind(status, queuePage.limit, queuePage.offset).all();
  return c.json({ success: true, data: results });
});

// GET approved tips (optionally filter by category or tags)
tips.get('/', async (c) => {
  const categoryId = c.req.query('category_id');
  const tag = c.req.query('tag');

  // Author emails are for moderators. The list is otherwise public content,
  // but it used to hand every signed-in user the address of every contributor.
  const fields = isModerator(c.get('currentUser').role)
    ? MODERATOR_TIP_FIELDS
    : PUBLIC_TIP_FIELDS;

  let query = `
    SELECT ${fields}
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

  const { limit, offset } = pageBounds(c);
  query += ' ORDER BY Tips.approved_at DESC LIMIT ? OFFSET ?';
  bindings.push(limit, offset);

  const { results } = await c.env.DB.prepare(query).bind(...bindings).all();
  return c.json({ success: true, data: results });
});

// GET single tip by ID
//
// This had no status filter and no role gate, so enumerating ids returned
// pending and rejected submissions along with author_email, reviewed_by and
// review_notes — a straight bypass of the gated /queue endpoint above.
tips.get('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('currentUser');
  const moderator = isModerator(user.role);

  const result = await c.env.DB.prepare(`
    SELECT ${moderator ? MODERATOR_TIP_FIELDS : PUBLIC_TIP_FIELDS}
    FROM Tips
    LEFT JOIN Users ON Tips.author_id = Users.id
    LEFT JOIN Categories ON Tips.category_id = Categories.id
    WHERE Tips.id = ?
      ${moderator ? '' : "AND (Tips.status = 'approved' OR Tips.author_id = ?)"}
  `)
    .bind(...(moderator ? [id] : [id, user.id]))
    .first();

  // Authors can still see their own submission while it is in review; everyone
  // else gets the same 404 whether the tip is unapproved or absent.
  if (!result) return c.json({ success: false, error: 'Tip not found' }, 404);
  return c.json({ success: true, data: result });
});

// POST submit a new tip (author = the signed-in user)
tips.post('/', rateLimit(10), async (c) => {
  const author = c.get('currentUser');
  const body = await readJson<{
    category_id?: number;
    title?: string;
    content?: string;
    tags?: string;
  }>(c);
  if (!body) return badBody(c);

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
  const body = await readJson<{
    reason?: string;
    details?: string;
    feedback?: string;
  }>(c);
  if (!body) return badBody(c);

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
