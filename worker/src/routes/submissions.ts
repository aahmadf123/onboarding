import { Hono } from 'hono';
import { Bindings } from '../types';
import { expandSearchTerms } from '../services/query-utils';
import { requireRole } from '../middleware/auth';

const submissions = new Hono<{ Bindings: Bindings }>();

type SubmissionPayload = {
  author_id: number;
  article_id?: number;
  proposed_title?: string;
  proposed_content: string;
  request_type?: 'new_article' | 'content_update' | 'access_request' | 'policy_question' | 'process_gap' | 'bug_report' | 'other';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  topic_area?: string;
  source_context?: string;
};

type AssignmentSuggestion = {
  assigned_team: string;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  assignment_reason: string;
};

type ContactAssignmentRow = {
  id: number;
  function_area: string | null;
  department: string | null;
  contact_name: string | null;
  title: string | null;
  email: string | null;
  notes: string | null;
};

async function buildAssignmentSuggestion(
  db: D1Database,
  payload: Pick<SubmissionPayload, 'article_id' | 'proposed_title' | 'proposed_content' | 'request_type' | 'topic_area' | 'source_context'>
): Promise<AssignmentSuggestion> {
  const contextParts = [
    payload.proposed_title,
    payload.proposed_content,
    payload.request_type,
    payload.topic_area,
    payload.source_context,
  ].filter(Boolean) as string[];

  if (payload.article_id) {
    const article = await db.prepare(`
      SELECT Articles.title, Categories.name AS category_name
      FROM Articles
      LEFT JOIN Categories ON Categories.id = Articles.category_id
      WHERE Articles.id = ?
    `)
      .bind(payload.article_id)
      .first<{ title: string; category_name: string | null }>();

    if (article) {
      contextParts.push(article.title);
      if (article.category_name) contextParts.push(article.category_name);
    }
  }

  const { terms } = expandSearchTerms(contextParts.join(' '), 14);
  const { results: contacts } = await db.prepare(`
    SELECT id, function_area, department, contact_name, title, email, notes
    FROM KeyContacts
    WHERE is_active = 1
    ORDER BY display_order ASC, id ASC
  `).all<{
    id: number;
    function_area: string | null;
    department: string | null;
    contact_name: string | null;
    title: string | null;
    email: string | null;
    notes: string | null;
  }>();

  if (!contacts || contacts.length === 0) {
    return {
      assigned_team: 'General Review Queue',
      assigned_to_name: null,
      assigned_to_email: null,
      assignment_reason: 'No active contacts were available in the portal to infer an owner.',
    };
  }

  const requestType = payload.request_type ?? (payload.article_id ? 'content_update' : 'new_article');
  const requestBias = {
    access_request: ['it', 'access', 'badge', 'door', 'security'],
    policy_question: ['policy', 'compliance', 'hr'],
    bug_report: ['it', 'technology', 'support'],
    process_gap: ['operations', 'workflow', 'facilities', 'hr'],
    content_update: ['communications', 'content', 'branding'],
    new_article: ['communications', 'content', 'branding'],
    other: [],
  }[requestType] ?? [];

  const ranked = contacts.map((contact) => {
    const haystack = [
      contact.function_area,
      contact.department,
      contact.contact_name,
      contact.title,
      contact.email,
      contact.notes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    let score = 0;
    const matched: string[] = [];

    if (payload.topic_area && haystack.includes(payload.topic_area.toLowerCase())) {
      score += 12;
      matched.push(payload.topic_area);
    }

    for (const token of terms) {
      if (!haystack.includes(token)) continue;
      score += token.length >= 6 ? 4 : 2;
      if (!matched.includes(token)) matched.push(token);
    }

    for (const bias of requestBias) {
      if (!haystack.includes(bias)) continue;
      score += 4;
      if (!matched.includes(bias)) matched.push(bias);
    }

    return { contact, score, matched };
  });

  ranked.sort((a, b) => b.score - a.score);
  const best = ranked[0];

  if (!best || best.score === 0) {
    return {
      assigned_team: payload.topic_area || 'General Review Queue',
      assigned_to_name: null,
      assigned_to_email: null,
      assignment_reason: 'No direct owner was inferred from the current portal knowledge, so this ticket stays in the general review queue.',
    };
  }

  return {
    assigned_team: best.contact.function_area || best.contact.department || payload.topic_area || 'General Review Queue',
    assigned_to_name: best.contact.contact_name,
    assigned_to_email: best.contact.email,
    assignment_reason:
      'Matched against existing portal contacts using ' + best.matched.slice(0, 4).join(', ') + '.',
  };
}

submissions.post('/assignment-preview', async (c) => {
  const body = await c.req.json<SubmissionPayload>();
  const assignment = await buildAssignmentSuggestion(c.env.DB, body);
  return c.json({ success: true, data: assignment });
});

submissions.put('/:id/assignment', requireRole('moderator', 'admin'), async (c) => {
  const submissionId = c.req.param('id');
  const body = await c.req.json<{
    contact_id?: number;
    assigned_team?: string;
    assigned_to_name?: string | null;
    assigned_to_email?: string | null;
    assignment_reason?: string;
  }>();

  const submission = await c.env.DB.prepare(
    'SELECT id, status FROM Submissions WHERE id = ?'
  )
    .bind(submissionId)
    .first<{ id: number; status: string }>();

  if (!submission) {
    return c.json({ success: false, error: 'Submission not found' }, 404);
  }

  let assignedTeam = body.assigned_team?.trim() || null;
  let assignedToName = body.assigned_to_name?.trim() || null;
  let assignedToEmail = body.assigned_to_email?.trim() || null;
  let assignmentReason = body.assignment_reason?.trim() || 'Assignment updated manually by moderation.';

  if (body.contact_id) {
    const contact = await c.env.DB.prepare(`
      SELECT id, function_area, department, contact_name, title, email, notes
      FROM KeyContacts
      WHERE id = ? AND is_active = 1
    `)
      .bind(body.contact_id)
      .first<ContactAssignmentRow>();

    if (!contact) {
      return c.json({ success: false, error: 'Selected contact was not found' }, 404);
    }

    assignedTeam = contact.function_area || contact.department || assignedTeam || 'General Review Queue';
    assignedToName = contact.contact_name;
    assignedToEmail = contact.email;
    assignmentReason = body.assignment_reason?.trim() || 'Reassigned manually from the moderation queue using the contacts directory.';
  }

  if (!assignedTeam) {
    return c.json({ success: false, error: 'assigned_team is required' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE Submissions
    SET assigned_team = ?, assigned_to_name = ?, assigned_to_email = ?, assignment_reason = ?
    WHERE id = ?
  `)
    .bind(assignedTeam, assignedToName, assignedToEmail, assignmentReason, submissionId)
    .run();

  const updated = await c.env.DB.prepare(`
    SELECT Submissions.*, Users.email as author_email, Articles.title as article_title
    FROM Submissions
    LEFT JOIN Users ON Submissions.author_id = Users.id
    LEFT JOIN Articles ON Submissions.article_id = Articles.id
    WHERE Submissions.id = ?
  `)
    .bind(submissionId)
    .first();

  return c.json({ success: true, data: updated, message: 'Assignment updated.' });
});

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
  const body = await c.req.json<SubmissionPayload>();

  if (!body.author_id || !body.proposed_content) {
    return c.json(
      { success: false, error: 'author_id and proposed_content are required' },
      400
    );
  }

  const requestType = body.request_type ?? (body.article_id ? 'content_update' : 'new_article');
  if (!body.article_id && !body.proposed_title?.trim()) {
    return c.json(
      { success: false, error: 'proposed_title is required when creating a new ticketed article request' },
      400
    );
  }

  const assignment = await buildAssignmentSuggestion(c.env.DB, body);

  const info = await c.env.DB.prepare(
    `INSERT INTO Submissions (
      article_id, author_id, proposed_title, proposed_content, request_type, priority,
      topic_area, source_context, assigned_team, assigned_to_name, assigned_to_email, assignment_reason
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  )
    .bind(
      body.article_id ?? null,
      body.author_id,
      body.proposed_title ?? null,
      body.proposed_content,
      requestType,
      body.priority ?? 'normal',
      body.topic_area ?? null,
      body.source_context ?? null,
      assignment.assigned_team,
      assignment.assigned_to_name,
      assignment.assigned_to_email,
      assignment.assignment_reason
    )
    .run();

  return c.json(
    {
      success: true,
      message: 'Ticket queued for moderation.',
      id: info.meta.last_row_id,
      data: { id: info.meta.last_row_id, assignment },
    },
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
