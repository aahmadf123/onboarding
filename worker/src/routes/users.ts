import { Hono } from 'hono';
import { Bindings } from '../types';

const users = new Hono<{ Bindings: Bindings }>();

// GET all users (id, email, role, created_at only — no password-like fields)
users.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, email, role, created_at FROM Users'
  ).all();
  return c.json({ success: true, data: results });
});

// GET user by email (login lookup)
users.get('/lookup', async (c) => {
  const email = c.req.query('email');
  if (!email)
    return c.json({ success: false, error: 'Email query param required' }, 400);

  const user = await c.env.DB.prepare(
    'SELECT id, email, role, created_at FROM Users WHERE email = ?'
  )
    .bind(email)
    .first();
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);
  return c.json({ success: true, data: user });
});

// POST create user (or return existing)
users.post('/', async (c) => {
  const body = await c.req.json<{ email: string }>();
  if (!body.email)
    return c.json({ success: false, error: 'Email is required' }, 400);

  const existing = await c.env.DB.prepare(
    'SELECT id, email, role, created_at FROM Users WHERE email = ?'
  )
    .bind(body.email)
    .first();

  if (existing) {
    // Ensure superadmin always has admin role
    if (body.email === 'utdata@utoledo.edu' && existing.role !== 'admin') {
      await c.env.DB.prepare('UPDATE Users SET role = ? WHERE id = ?')
        .bind('admin', existing.id)
        .run();
      return c.json({ success: true, data: { ...existing, role: 'admin' } });
    }
    return c.json({ success: true, data: existing });
  }

  // Assign admin role for superadmin email, staff for everyone else
  const role = body.email === 'utdata@utoledo.edu' ? 'admin' : 'staff';
  const info = await c.env.DB.prepare(
    'INSERT INTO Users (email, role) VALUES (?, ?)'
  )
    .bind(body.email, role)
    .run();
  const user = await c.env.DB.prepare(
    'SELECT id, email, role, created_at FROM Users WHERE id = ?'
  )
    .bind(info.meta.last_row_id)
    .first();
  return c.json({ success: true, data: user }, 201);
});

export default users;
