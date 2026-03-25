import { Hono } from 'hono';
import { Bindings } from '../types';

const articles = new Hono<{ Bindings: Bindings }>();

// GET all articles (with optional category filter and search)
articles.get('/', async (c) => {
  const categoryId = c.req.query('category_id');
  const search = c.req.query('search');

  let query = `
    SELECT Articles.*, Categories.name as category_name
    FROM Articles
    LEFT JOIN Categories ON Articles.category_id = Categories.id
  `;
  const conditions: string[] = [];
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

  query += ' ORDER BY Articles.category_id, Articles.id';

  const stmt = c.env.DB.prepare(query);
  const { results } =
    bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
  return c.json({ success: true, data: results });
});

// GET single article by ID
articles.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(`
    SELECT Articles.*, Categories.name as category_name
    FROM Articles
    LEFT JOIN Categories ON Articles.category_id = Categories.id
    WHERE Articles.id = ?
  `)
    .bind(id)
    .first();
  if (!result) return c.json({ success: false, error: 'Article not found' }, 404);
  return c.json({ success: true, data: result });
});

export default articles;
