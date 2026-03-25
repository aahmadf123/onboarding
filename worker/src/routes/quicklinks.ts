import { Hono } from 'hono';
import { Bindings } from '../types';

const quicklinks = new Hono<{ Bindings: Bindings }>();

quicklinks.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM QuickLinks WHERE is_active = 1 ORDER BY display_order, id'
  ).all();
  return c.json({ success: true, data: results });
});

export default quicklinks;
