import { Hono } from 'hono';
import { Bindings } from '../types';

const policies = new Hono<{ Bindings: Bindings }>();

policies.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM PolicyResources WHERE is_active = 1 ORDER BY display_order, id'
  ).all();
  return c.json({ success: true, data: results });
});

export default policies;
