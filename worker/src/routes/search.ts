import { Hono } from 'hono';
import { Bindings } from '../types';

const search = new Hono<{ Bindings: Bindings }>();

search.get('/', async (c) => {
  const q = c.req.query('q');
  if (!q)
    return c.json({ success: false, error: 'Query parameter q is required' }, 400);

  const { results } = await c.env.DB.prepare(`
    SELECT Articles.*, Categories.name as category_name
    FROM Articles
    LEFT JOIN Categories ON Articles.category_id = Categories.id
    WHERE Articles.title LIKE ? OR Articles.current_content LIKE ?
    ORDER BY
      CASE WHEN Articles.title LIKE ? THEN 0 ELSE 1 END,
      Articles.category_id, Articles.id
  `)
    .bind(`%${q}%`, `%${q}%`, `%${q}%`)
    .all();

  return c.json({ success: true, data: results, query: q });
});

export default search;
