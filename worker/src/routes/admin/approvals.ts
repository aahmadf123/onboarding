import { Context, Hono } from 'hono';
import { AppEnv } from '../../types';
import { sendEmail } from '../../services/email';
import { approvalDecisionEmail } from '../../services/email-templates';
import { getConfig } from '../../services/config';

const approvals = new Hono<AppEnv>();

interface PendingRow {
  id: number;
  user_id: number;
  task_id: number;
  completed_at: string | null;
  user_email: string;
  user_name: string | null;
  task_title: string;
  task_phase: string;
}

// GET /api/admin/approvals — task completions awaiting sign-off
approvals.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ut.id, ut.user_id, ut.task_id, ut.completed_at,
            u.email AS user_email, u.name AS user_name,
            t.title AS task_title, t.phase AS task_phase
     FROM UserTasks ut
     JOIN Users u ON u.id = ut.user_id
     JOIN Tasks t ON t.id = ut.task_id
     WHERE ut.status = 'pending_approval'
     ORDER BY ut.completed_at ASC`
  ).all<PendingRow>();
  return c.json({ success: true, data: results });
});

async function decide(c: Context<AppEnv>, approve: boolean) {
  const me = c.get('currentUser');
  const id = Number(c.req.param('id'));
  const body = await c.req.json<{ note?: string }>().catch(() => ({}) as { note?: string });
  const note = (body.note ?? '').trim() || null;

  if (!approve && !note) {
    return c.json({ success: false, error: 'A note is required when sending a task back.' }, 400);
  }

  const result = await c.env.DB.prepare(
    `UPDATE UserTasks SET status = ?, reviewed_by = ?, review_notes = ?,
       reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status = 'pending_approval'`
  )
    .bind(approve ? 'approved' : 'rejected', me.id, note, id)
    .run();
  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Approval not found or already decided' }, 404);
  }

  const row = await c.env.DB.prepare(
    `SELECT u.id AS user_id, u.email, u.name, t.title
     FROM UserTasks ut JOIN Users u ON u.id = ut.user_id JOIN Tasks t ON t.id = ut.task_id
     WHERE ut.id = ?`
  )
    .bind(id)
    .first<{ user_id: number; email: string; name: string | null; title: string }>();

  if (row) {
    const baseUrl = await getConfig(c.env.DB, 'app_base_url');
    const content = approvalDecisionEmail({
      name: row.name,
      email: row.email,
      taskTitle: row.title,
      approved: approve,
      note,
      baseUrl,
    });
    await sendEmail(c.env, {
      to: row.email,
      subject: content.subject,
      html: content.html,
      type: 'approval_decision',
      userId: row.user_id,
    });
  }

  return c.json({ success: true, message: approve ? 'Task approved.' : 'Task sent back.' });
}

// PUT /api/admin/approvals/:id/approve
approvals.put('/:id/approve', (c) => decide(c, true));

// PUT /api/admin/approvals/:id/reject — { note } (required)
approvals.put('/:id/reject', (c) => decide(c, false));

export default approvals;
