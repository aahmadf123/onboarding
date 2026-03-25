import { Hono } from 'hono';
import { Bindings } from '../types';

const stats = new Hono<{ Bindings: Bindings }>();

stats.get('/', async (c) => {
  const [articles, categories, pendingSubmissions, totalUsers] =
    await c.env.DB.batch([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM Articles'),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM Categories'),
      c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM Submissions WHERE status = 'pending'"
      ),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM Users'),
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
