import { Hono } from 'hono';
import { Bindings } from '../types';

const categories = new Hono<{ Bindings: Bindings }>();

// GET all categories
categories.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM Categories').all();
  return c.json({ success: true, data: results });
});

// GET single category by ID
categories.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(
    'SELECT * FROM Categories WHERE id = ?'
  )
    .bind(id)
    .first();
  if (!result) return c.json({ success: false, error: 'Category not found' }, 404);
  return c.json({ success: true, data: result });
});

// GET articles for a category
categories.get('/:id/articles', async (c) => {
  const id = c.req.param('id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM Articles WHERE category_id = ? ORDER BY id'
  )
    .bind(id)
    .all();
  return c.json({ success: true, data: results });
});

export default categories;
