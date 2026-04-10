import { Hono } from 'hono';
import { Bindings } from '../types';

const search = new Hono<{ Bindings: Bindings }>();

search.get('/', async (c) => {
  const q = c.req.query('q');
  if (!q)
    return c.json({ success: false, error: 'Query parameter q is required' }, 400);

  const pattern = `%${q}%`;

  const [articles, contacts, systems, policies] = await Promise.all([
    c.env.DB.prepare(`
      SELECT Articles.id, Articles.title, Articles.current_content, Articles.category_id,
             Articles.last_updated, Categories.name as category_name, 'article' as result_type
      FROM Articles
      LEFT JOIN Categories ON Articles.category_id = Categories.id
      WHERE Articles.title LIKE ? OR Articles.current_content LIKE ?
      ORDER BY
        CASE WHEN Articles.title LIKE ? THEN 0 ELSE 1 END,
        Articles.category_id, Articles.id
      LIMIT 10
    `).bind(pattern, pattern, pattern).all(),

    c.env.DB.prepare(`
      SELECT id, contact_name as title, function_area, department, email, phone, notes,
             'contact' as result_type
      FROM KeyContacts
      WHERE is_active = 1
        AND (contact_name LIKE ? OR title LIKE ? OR function_area LIKE ? OR notes LIKE ?)
      LIMIT 5
    `).bind(pattern, pattern, pattern, pattern).all(),

    c.env.DB.prepare(`
      SELECT id, system_name as title, description, access_url, login_notes, category,
             'system' as result_type
      FROM SystemsDirectory
      WHERE is_active = 1
        AND (system_name LIKE ? OR description LIKE ? OR login_notes LIKE ?)
      LIMIT 5
    `).bind(pattern, pattern, pattern).all(),

    c.env.DB.prepare(`
      SELECT id, title, summary, policy_code, category, applies_to,
             'policy' as result_type
      FROM PolicyResources
      WHERE is_active = 1
        AND (title LIKE ? OR summary LIKE ? OR applies_to LIKE ?)
      LIMIT 5
    `).bind(pattern, pattern, pattern).all(),
  ]);

  const results = [
    ...(articles.results ?? []),
    ...(contacts.results ?? []),
    ...(systems.results ?? []),
    ...(policies.results ?? []),
  ];

  return c.json({ success: true, data: results, query: q });
});

export default search;
