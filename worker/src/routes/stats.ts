import { Hono } from 'hono';
import { AppEnv } from '../types';

const stats = new Hono<AppEnv>();

stats.get('/', async (c) => {
  const [articles, categories, pendingSubmissions, totalUsers] =
    await c.env.DB.batch([
      // is_active = 1 matches every other article surface. Without it the
      // dashboard counted soft-deleted articles and disagreed with the list.
      c.env.DB.prepare('SELECT COUNT(*) as count FROM Articles WHERE is_active = 1'),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM Categories'),
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM Submissions WHERE status = 'pending'"
      ),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM Users WHERE status != 'disabled'"),
    ]);

  return c.json({
    success: true,
    data: {
      articles: (articles.results[0] as { count: number }).count,
      categories: (categories.results[0] as { count: number }).count,
      pending_submissions: (pendingSubmissions.results[0] as { count: number }).count,
      total_users: (totalUsers.results[0] as { count: number }).count,
    },
  });
});

export default stats;
