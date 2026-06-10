import { Hono } from 'hono';
import { AppEnv } from '../types';
import { requireRole } from '../middleware/auth';
import { reindexArticle } from '../services/content-index';

const submissions = new Hono<AppEnv>();

// GET all submissions (filterable by status) — moderators/admins only
submissions.get('/', requireRole('moderator', 'admin'), async (c) => {
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

// GET single submission — moderators/admins only
submissions.get('/:id', requireRole('moderator', 'admin'), async (c) => {
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

// POST create a new submission (author = the signed-in user)
submissions.post('/', async (c) => {
  const author = c.get('currentUser');
  const body = await c.req.json<{
    article_id?: number;
    proposed_title?: string;
    proposed_content: string;
  }>();

  if (!body.proposed_content) {
    return c.json({ success: false, error: 'proposed_content is required' }, 400);
  }

  const info = await c.env.DB.prepare(
    'INSERT INTO Submissions (article_id, author_id, proposed_title, proposed_content) VALUES (?,?,?,?)'
  )
    .bind(
      body.article_id ?? null,
      author.id,
      body.proposed_title ?? null,
      body.proposed_content
    )
    .run();

  return c.json(
    { success: true, message: 'Submission queued for moderation.', id: info.meta.last_row_id },
    201
  );
});

// PUT approve a submission (reviewer = the signed-in moderator/admin)
submissions.put('/:id/approve', requireRole('moderator', 'admin'), async (c) => {
  const reviewer = c.get('currentUser');
  const submissionId = c.req.param('id');
  const body = await c.req
    .json<{ review_notes?: string; category_id?: number }>()
    .catch(() => ({}) as { review_notes?: string; category_id?: number });

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
  let articleId: number;

  if (submission.article_id) {
    articleId = submission.article_id;
    await c.env.DB.batch([
      c.env.DB.prepare(
        'UPDATE Articles SET current_content = ?, last_updated = ? WHERE id = ?'
      ).bind(submission.proposed_content, now, articleId),
      c.env.DB.prepare(
        'UPDATE Submissions SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ?'
      ).bind('approved', reviewer.id, body.review_notes ?? null, submissionId),
    ]);
  } else {
    const categoryId = body.category_id ?? 1;
    const info = await c.env.DB.prepare(
      'INSERT INTO Articles (category_id, title, current_content, last_updated) VALUES (?,?,?,?)'
    )
      .bind(
        categoryId,
        submission.proposed_title ?? 'Untitled',
        submission.proposed_content,
        now
      )
      .run();
    articleId = info.meta.last_row_id as number;
    await c.env.DB.prepare(
      'UPDATE Submissions SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ?'
    )
      .bind('approved', reviewer.id, body.review_notes ?? null, submissionId)
      .run();
  }

  // Keep the AI chat index in sync with the newly published content.
  await reindexArticle(c.env.DB, articleId);

  return c.json({ success: true, message: 'Submission approved and published.' });
});

// PUT reject a submission (reviewer = the signed-in moderator/admin)
submissions.put('/:id/reject', requireRole('moderator', 'admin'), async (c) => {
  const reviewer = c.get('currentUser');
  const submissionId = c.req.param('id');
  const body = await c.req
    .json<{ review_notes?: string }>()
    .catch(() => ({}) as { review_notes?: string });

  const result = await c.env.DB.prepare(
    'UPDATE Submissions SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ? AND status = ?'
  )
    .bind(
      'rejected',
      reviewer.id,
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
