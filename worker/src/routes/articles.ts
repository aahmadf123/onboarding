import { Hono } from 'hono';
import { AppEnv } from '../types';
import { pageBounds } from '../services/http';

const articles = new Hono<AppEnv>();

// GET all articles (with optional category filter and search)
articles.get('/', async (c) => {
  const categoryId = c.req.query('category_id');
  const search = c.req.query('search');

  // Deliberately not Articles.* — that carried every article's full markdown.
  // The dashboard calls this to show three titles and the contribute form to
  // fill a dropdown, so the whole corpus was being shipped to render a list.
  // Article bodies come from /api/articles/:id, and the snippets on the
  // category page from /api/categories/:id/articles.
  let query = `
    SELECT Articles.id, Articles.title, Articles.category_id, Articles.last_updated,
           Articles.is_active, Categories.name as category_name
    FROM Articles
    LEFT JOIN Categories ON Articles.category_id = Categories.id
  `;
  // Soft-deleted articles are hidden everywhere outside the admin CMS.
  const conditions: string[] = ['Articles.is_active = 1'];
  const bindings: unknown[] = [];

  if (categoryId) {
    conditions.push('Articles.category_id = ?');
    bindings.push(categoryId);
  }

  if (search) {
    conditions.push('(Articles.title LIKE ? OR Articles.current_content LIKE ?)');
    bindings.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const { limit, offset } = pageBounds(c);
  query += ' ORDER BY Articles.category_id, Articles.id LIMIT ? OFFSET ?';
  bindings.push(limit, offset);

  const { results } = await c.env.DB.prepare(query)
    .bind(...bindings)
    .all();
  return c.json({ success: true, data: results });
});

// GET single article by ID
articles.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(`
    SELECT Articles.*, Categories.name as category_name
    FROM Articles
    LEFT JOIN Categories ON Articles.category_id = Categories.id
    WHERE Articles.id = ? AND Articles.is_active = 1
  `)
    .bind(id)
    .first();
  if (!result) return c.json({ success: false, error: 'Article not found' }, 404);
  return c.json({ success: true, data: result });
});

export default articles;
