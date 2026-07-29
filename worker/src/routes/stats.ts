import { Hono } from 'hono';
import { AppEnv } from '../types';

const stats = new Hono<AppEnv>();

stats.get('/', async (c) => {
  const me = c.get('currentUser');

  const [articles, categories, pendingSubmissions, totalUsers, myOpen] =
    await c.env.DB.batch([
      // is_active = 1 matches every other article surface. Without it the
      // dashboard counted soft-deleted articles and disagreed with the list.
      c.env.DB.prepare('SELECT COUNT(*) as count FROM Articles WHERE is_active = 1'),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM Categories'),
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM Submissions WHERE status = 'pending'"
      ),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM Users WHERE status != 'disabled'"),

      // The caller's own outstanding required/assigned tasks. Surfaced in-app
      // because reminder emails to utoledo.edu addresses are filtered, so the
      // weekly cron cannot be relied on to reach anyone. This endpoint is
      // already fetched once on load, so it costs no extra round trip.
      c.env.DB.prepare(
        `SELECT COUNT(*) as count
         FROM Tasks t
         LEFT JOIN UserTasks ut ON ut.task_id = t.id AND ut.user_id = ?1
         WHERE t.is_active = 1
           AND (t.audience = 'all' OR ut.assigned_by IS NOT NULL)
           AND COALESCE(ut.status, 'open') IN ('open', 'rejected')
           AND (t.priority = 'required' OR ut.assigned_by IS NOT NULL)`
      ).bind(me.id),
    ]);

  return c.json({
    success: true,
    data: {
      articles: (articles.results[0] as { count: number }).count,
      categories: (categories.results[0] as { count: number }).count,
      pending_submissions: (pendingSubmissions.results[0] as { count: number }).count,
      total_users: (totalUsers.results[0] as { count: number }).count,
      my_open_required: (myOpen.results[0] as { count: number }).count,
    },
  });
});

export default stats;
