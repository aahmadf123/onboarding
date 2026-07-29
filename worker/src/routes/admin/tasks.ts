import { Hono } from 'hono';
import { asTrimmedString } from '../../services/http';
import { AppEnv, TaskRow, UserRow } from '../../types';
import { sendEmail } from '../../services/email';
import { taskAssignedEmail } from '../../services/email-templates';
import { getConfig } from '../../services/config';

const tasks = new Hono<AppEnv>();

const PHASES = ['first-day', 'first-week', 'first-month', 'first-90-days'];
const PRIORITIES = ['required', 'recommended', 'optional'];
const AUDIENCES = ['all', 'assigned'];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

interface TaskBody {
  slug?: string;
  phase?: string;
  title?: string;
  description?: string;
  priority?: string;
  display_order?: number;
  requires_approval?: boolean | number;
  audience?: string;
  link_view?: string | null;
  link_param?: string | null;
  is_active?: boolean | number;
}

function validateTaskBody(body: TaskBody, partial: boolean): string | null {
  if (!partial || body.phase !== undefined) {
    if (!body.phase || !PHASES.includes(body.phase)) return 'phase must be one of ' + PHASES.join(', ');
  }
  if (!partial || body.title !== undefined) {
    if (!asTrimmedString(body.title)) return 'title is required';
  }
  if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) {
    return 'priority must be one of ' + PRIORITIES.join(', ');
  }
  if (body.audience !== undefined && !AUDIENCES.includes(body.audience)) {
    return 'audience must be one of ' + AUDIENCES.join(', ');
  }
  return null;
}

// GET /api/admin/tasks — all tasks including inactive
tasks.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM Tasks ORDER BY phase, display_order, id'
  ).all<TaskRow>();
  return c.json({ success: true, data: results });
});

// POST /api/admin/tasks — create a task
tasks.post('/', async (c) => {
  const me = c.get('currentUser');
  const body = await c.req.json<TaskBody>().catch(() => ({}) as TaskBody);
  const error = validateTaskBody(body, false);
  if (error) return c.json({ success: false, error }, 400);

  let slug = asTrimmedString(body.slug) || slugify(asTrimmedString(body.title));
  if (!slug) slug = 'task';
  // Ensure slug uniqueness with a numeric suffix.
  const base = slug;
  for (let i = 2; ; i++) {
    const existing = await c.env.DB.prepare('SELECT id FROM Tasks WHERE slug = ?')
      .bind(slug)
      .first();
    if (!existing) break;
    slug = `${base}-${i}`;
  }

  const info = await c.env.DB.prepare(
    `INSERT INTO Tasks (slug, phase, title, description, priority, display_order,
       requires_approval, audience, link_view, link_param, is_active, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
  )
    .bind(
      slug,
      body.phase,
      asTrimmedString(body.title),
      body.description ?? null,
      body.priority ?? 'recommended',
      body.display_order ?? 0,
      body.requires_approval ? 1 : 0,
      body.audience ?? 'all',
      body.link_view ?? null,
      body.link_param != null ? String(body.link_param) : null,
      me.id
    )
    .run();

  const task = await c.env.DB.prepare('SELECT * FROM Tasks WHERE id = ?')
    .bind(info.meta.last_row_id)
    .first<TaskRow>();
  return c.json({ success: true, data: task }, 201);
});

// PUT /api/admin/tasks/:id — update a task
tasks.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json<TaskBody>().catch(() => ({}) as TaskBody);
  const error = validateTaskBody(body, true);
  if (error) return c.json({ success: false, error }, 400);

  const existing = await c.env.DB.prepare('SELECT * FROM Tasks WHERE id = ?')
    .bind(id)
    .first<TaskRow>();
  if (!existing) return c.json({ success: false, error: 'Task not found' }, 404);

  const sets: string[] = [];
  const binds: unknown[] = [];
  const fields: [string, unknown][] = [
    ['phase', body.phase],
    ['title', body.title !== undefined ? asTrimmedString(body.title) : undefined],
    ['description', body.description],
    ['priority', body.priority],
    ['display_order', body.display_order],
    ['requires_approval', body.requires_approval !== undefined ? (body.requires_approval ? 1 : 0) : undefined],
    ['audience', body.audience],
    ['link_view', body.link_view],
    ['link_param', body.link_param != null ? String(body.link_param) : body.link_param],
    ['is_active', body.is_active !== undefined ? (body.is_active ? 1 : 0) : undefined],
  ];
  for (const [col, value] of fields) {
    if (value !== undefined) {
      sets.push(`${col} = ?`);
      binds.push(value);
    }
  }
  if (sets.length === 0) return c.json({ success: false, error: 'Nothing to update' }, 400);

  binds.push(id);
  await c.env.DB.prepare(`UPDATE Tasks SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...binds)
    .run();
  const task = await c.env.DB.prepare('SELECT * FROM Tasks WHERE id = ?')
    .bind(id)
    .first<TaskRow>();
  return c.json({ success: true, data: task });
});

// DELETE /api/admin/tasks/:id — soft delete (hides it for everyone)
tasks.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const result = await c.env.DB.prepare('UPDATE Tasks SET is_active = 0 WHERE id = ?')
    .bind(id)
    .run();
  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Task not found' }, 404);
  }
  return c.json({ success: true, message: 'Task deactivated' });
});

// POST /api/admin/tasks/:id/assign — { user_ids: number[] }
// Creates/updates UserTasks rows marking the assignment and emails each user.
tasks.post('/:id/assign', async (c) => {
  const me = c.get('currentUser');
  const taskId = Number(c.req.param('id'));
  const body = await c.req
    .json<{ user_ids?: unknown }>()
    .catch(() => ({}) as { user_ids?: unknown });
  const userIds = Array.isArray(body.user_ids)
    ? body.user_ids.filter((n): n is number => Number.isInteger(n)).slice(0, 100)
    : [];
  if (userIds.length === 0) {
    return c.json({ success: false, error: 'user_ids (number[]) is required' }, 400);
  }

  const task = await c.env.DB.prepare('SELECT * FROM Tasks WHERE id = ? AND is_active = 1')
    .bind(taskId)
    .first<TaskRow>();
  if (!task) return c.json({ success: false, error: 'Task not found' }, 404);

  const baseUrl = await getConfig(c.env.DB, 'app_base_url');
  let assigned = 0;
  for (const userId of userIds) {
    const user = await c.env.DB.prepare(
      "SELECT * FROM Users WHERE id = ? AND status != 'disabled'"
    )
      .bind(userId)
      .first<UserRow>();
    if (!user) continue;

    await c.env.DB.prepare(
      `INSERT INTO UserTasks (user_id, task_id, status, assigned_by, assigned_at, updated_at)
       VALUES (?, ?, 'open', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, task_id) DO UPDATE SET
         assigned_by = excluded.assigned_by,
         assigned_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(userId, taskId, me.id)
      .run();
    assigned++;

    const content = taskAssignedEmail({
      name: user.name,
      email: user.email,
      taskTitle: task.title,
      taskDescription: task.description,
      assignedByEmail: me.email,
      baseUrl,
    });
    await sendEmail(c.env, {
      to: user.email,
      subject: content.subject,
      html: content.html,
      type: 'task_assigned',
      userId: user.id,
    });
  }

  return c.json({ success: true, data: { assigned } });
});

export default tasks;
