import { Hono } from 'hono';
import { AppEnv } from '../types';

const contacts = new Hono<AppEnv>();

contacts.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM KeyContacts WHERE is_active = 1 ORDER BY display_order, id'
  ).all();
  return c.json({ success: true, data: results });
});

export default contacts;
