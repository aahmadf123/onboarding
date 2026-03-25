import { Hono } from 'hono';
import { Bindings } from '../types';

const submissions = new Hono<{ Bindings: Bindings }>();

// GET all submissions (filterable by status)
submissions.get('/', async (c) => {
  const status = c.req.query('status');

  let query = `
    SELECT Submissions.*, Users.email as author_email, Articles.title as article_title
    FROM Submissions
    LEFT JOIN Users ON Submissions.author_id = Users.id
    LEFT JOIN Articles ON Submissions.article_id = Articles.id
  `;
  const bindings: unknown[] = [];

  if (status) {
    query += ' WHERE Submissions.status = ?';
    bindings.push(status);
  }

  query += ' ORDER BY Submissions.submitted_at DESC';

  const stmt = c.env.DB.prepare(query);
  const { results } =
    bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
  return c.json({ success: true, data: results });
});

// GET single submission
submissions.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(`
    SELECT Submissions.*, Users.email as author_email, Articles.title as article_title
    FROM Submissions
    LEFT JOIN Users ON Submissions.author_id = Users.id
    LEFT JOIN Articles ON Submissions.article_id = Articles.id
    WHERE Submissions.id = ?
  `)
    .bind(id)
    .first();
  if (!result)
    return c.json({ success: false, error: 'Submission not found' }, 404);
  return c.json({ success: true, data: result });
});

// POST create a new submission
submissions.post('/', async (c) => {
  const body = await c.req.json<{
    author_id: number;
    article_id?: number;
    proposed_title?: string;
    proposed_content: string;
  }>();

  if (!body.author_id || !body.proposed_content) {
    return c.json(
      { success: false, error: 'author_id and proposed_content are required' },
      400
    );
  }

  const info = await c.env.DB.prepare(
    'INSERT INTO Submissions (article_id, author_id, proposed_title, proposed_content) VALUES (?,?,?,?)'
  )
    .bind(
      body.article_id ?? null,
      body.author_id,
      body.proposed_title ?? null,
      body.proposed_content
    )
    .run();

  return c.json(
    { success: true, message: 'Submission queued for moderation.', id: info.meta.last_row_id },
    201
  );
});

// PUT approve a submission (moderator action)
submissions.put('/:id/approve', async (c) => {
  const submissionId = c.req.param('id');
  const body = await c.req.json<{ reviewed_by: number; review_notes?: string; category_id?: number }>();

  if (!body.reviewed_by) {
    return c.json({ success: false, error: 'reviewed_by is required' }, 400);
  }

  const submission = await c.env.DB.prepare(
    'SELECT * FROM Submissions WHERE id = ? AND status = ?'
  )
    .bind(submissionId, 'pending')
    .first<{
      id: number;
      article_id: number | null;
      proposed_title: string | null;
      proposed_content: string;
      author_id: number;
    }>();

  if (!submission) {
    return c.json(
      { success: false, error: 'Submission not found or already reviewed' },
      404
    );
  }

  const now = new Date().toISOString();

  if (submission.article_id) {
    await c.env.DB.batch([
      c.env.DB.prepare(
        'UPDATE Articles SET current_content = ?, last_updated = ? WHERE id = ?'
      ).bind(submission.proposed_content, now, submission.article_id),
      c.env.DB.prepare(
        'UPDATE Submissions SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ?'
      ).bind('approved', body.reviewed_by, body.review_notes ?? null, submissionId),
    ]);
  } else {
    const categoryId = body.category_id ?? 1;
    await c.env.DB.batch([
      c.env.DB.prepare(
        'INSERT INTO Articles (category_id, title, current_content, last_updated) VALUES (?,?,?,?)'
      ).bind(
        categoryId,
        submission.proposed_title ?? 'Untitled',
        submission.proposed_content,
        now
      ),
      c.env.DB.prepare(
        'UPDATE Submissions SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ?'
      ).bind('approved', body.reviewed_by, body.review_notes ?? null, submissionId),
    ]);
  }

  return c.json({ success: true, message: 'Submission approved and published.' });
});

// PUT reject a submission (moderator action)
submissions.put('/:id/reject', async (c) => {
  const submissionId = c.req.param('id');
  const body = await c.req.json<{ reviewed_by: number; review_notes?: string }>();

  if (!body.reviewed_by) {
    return c.json({ success: false, error: 'reviewed_by is required' }, 400);
  }

  const result = await c.env.DB.prepare(
    'UPDATE Submissions SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ? AND status = ?'
  )
    .bind(
      'rejected',
      body.reviewed_by,
      body.review_notes ?? null,
      submissionId,
      'pending'
    )
    .run();

  if (result.meta.changes === 0) {
    return c.json(
      { success: false, error: 'Submission not found or already reviewed' },
      404
    );
  }

  return c.json({ success: true, message: 'Submission rejected.' });
});

export default submissions;
