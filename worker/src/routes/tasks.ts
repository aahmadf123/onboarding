import { Hono } from 'hono';
import { AppEnv, TaskRow, UserTaskStatus } from '../types';

const tasks = new Hono<AppEnv>();

type TaskWithStatus = TaskRow & {
  my_status: UserTaskStatus;
  completed_at: string | null;
  assigned_by: number | null;
  assigned_by_email: string | null;
  review_notes: string | null;
};

// GET /api/tasks — every active 'all' task plus tasks assigned to me,
// each carrying my progress status. The frontend groups by phase.
tasks.get('/', async (c) => {
  const user = c.get('currentUser');
  const { results } = await c.env.DB.prepare(
    `SELECT t.*,
            COALESCE(ut.status, 'open') AS my_status,
            ut.completed_at,
            ut.assigned_by,
            ut.review_notes,
            assigner.email AS assigned_by_email
     FROM Tasks t
     LEFT JOIN UserTasks ut ON ut.task_id = t.id AND ut.user_id = ?
     LEFT JOIN Users assigner ON assigner.id = ut.assigned_by
     WHERE t.is_active = 1 AND (t.audience = 'all' OR ut.id IS NOT NULL)
     ORDER BY t.display_order, t.id`
  )
    .bind(user.id)
    .all<TaskWithStatus>();
  return c.json({ success: true, data: results });
});

// PUT /api/tasks/:id/status — { done: boolean }
// Tasks with requires_approval go to 'pending_approval' instead of 'done';
// 'approved' is terminal for the user.
tasks.put('/:id/status', async (c) => {
  const user = c.get('currentUser');
  const taskId = Number(c.req.param('id'));
  const body = await c.req.json<{ done?: boolean }>().catch(() => ({}) as { done?: boolean });
  if (typeof body.done !== 'boolean' || !Number.isInteger(taskId)) {
    return c.json({ success: false, error: 'done (boolean) is required' }, 400);
  }

  const task = await c.env.DB.prepare('SELECT * FROM Tasks WHERE id = ? AND is_active = 1')
    .bind(taskId)
    .first<TaskRow>();
  if (!task) return c.json({ success: false, error: 'Task not found' }, 404);

  const existing = await c.env.DB.prepare(
    'SELECT * FROM UserTasks WHERE user_id = ? AND task_id = ?'
  )
    .bind(user.id, taskId)
    .first<{ id: number; status: UserTaskStatus; assigned_by: number | null }>();

  // Assigned-audience tasks are only actionable by users they were assigned to.
  if (task.audience === 'assigned' && !existing) {
    return c.json({ success: false, error: 'Task not found' }, 404);
  }

  const current: UserTaskStatus = existing?.status ?? 'open';
  if (current === 'approved') {
    return c.json({ success: false, error: 'This task was approved and can no longer be changed.' }, 409);
  }

  const next: UserTaskStatus = body.done
    ? task.requires_approval
      ? 'pending_approval'
      : 'done'
    : 'open';

  if (existing) {
    await c.env.DB.prepare(
      `UPDATE UserTasks SET status = ?,
         completed_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END,
         reviewed_by = CASE WHEN ? THEN reviewed_by ELSE NULL END,
         review_notes = CASE WHEN ? THEN review_notes ELSE NULL END,
         reviewed_at = CASE WHEN ? THEN reviewed_at ELSE NULL END,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(next, body.done ? 1 : 0, body.done ? 1 : 0, body.done ? 1 : 0, body.done ? 1 : 0, existing.id)
      .run();
  } else {
    await c.env.DB.prepare(
      `INSERT INTO UserTasks (user_id, task_id, status, completed_at, updated_at)
       VALUES (?, ?, ?, CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)`
    )
      .bind(user.id, taskId, next, body.done ? 1 : 0)
      .run();
  }

  return c.json({ success: true, data: { task_id: taskId, status: next } });
});

// POST /api/tasks/migrate-local — one-time import of the legacy localStorage
// checklist. OR-merge: marks tasks done, never un-marks. Tasks that now
// require approval are skipped so the approvals queue is never flooded by a
// bulk import; the user re-checks those manually.
tasks.post('/migrate-local', async (c) => {
  const user = c.get('currentUser');
  const body = await c.req.json<{ slugs?: unknown }>().catch(() => ({}) as { slugs?: unknown });
  const slugs = Array.isArray(body.slugs)
    ? body.slugs.filter((s): s is string => typeof s === 'string').slice(0, 200)
    : [];

  let migrated = 0;
  for (const slug of slugs) {
    const task = await c.env.DB.prepare(
      'SELECT id, requires_approval FROM Tasks WHERE slug = ? AND is_active = 1'
    )
      .bind(slug)
      .first<{ id: number; requires_approval: number }>();
    if (!task || task.requires_approval) continue;

    const result = await c.env.DB.prepare(
      `INSERT INTO UserTasks (user_id, task_id, status, completed_at, updated_at)
       VALUES (?, ?, 'done', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, task_id) DO UPDATE SET
         status = 'done',
         completed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       WHERE UserTasks.status = 'open'`
    )
      .bind(user.id, task.id)
      .run();
    if (result.meta.changes > 0) migrated++;
  }

  await c.env.DB.prepare(
    'UPDATE Users SET localstorage_migrated_at = CURRENT_TIMESTAMP WHERE id = ?'
  )
    .bind(user.id)
    .run();

  return c.json({ success: true, data: { migrated } });
});

export default tasks;
