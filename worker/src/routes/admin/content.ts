import { Hono } from 'hono';
import { AppEnv } from '../../types';
import { reindexArticle } from '../../services/content-index';

const content = new Hono<AppEnv>();

// Generic CRUD over the site's content tables. The entity whitelist (and its
// per-entity column lists) is the security boundary — nothing outside it is
// reachable, and writes only touch whitelisted columns.
interface EntityConfig {
  table: string;
  columns: string[];
  required: string[];
  softDelete: boolean;
  orderBy: string;
  afterWrite?: (db: D1Database, id: number) => Promise<void>;
}

const ENTITIES: Record<string, EntityConfig> = {
  articles: {
    table: 'Articles',
    columns: ['category_id', 'title', 'current_content', 'is_active'],
    required: ['title'],
    softDelete: true,
    orderBy: 'category_id, id',
    afterWrite: async (db, id) => {
      await db
        .prepare('UPDATE Articles SET last_updated = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(id)
        .run();
      await reindexArticle(db, id);
    },
  },
  categories: {
    table: 'Categories',
    columns: ['name', 'description'],
    required: ['name'],
    softDelete: false,
    orderBy: 'id',
  },
  contacts: {
    table: 'KeyContacts',
    columns: [
      'function_area',
      'department',
      'contact_name',
      'title',
      'email',
      'phone',
      'url',
      'notes',
      'display_order',
      'is_active',
    ],
    required: ['function_area'],
    softDelete: true,
    orderBy: 'display_order, id',
  },
  quicklinks: {
    table: 'QuickLinks',
    columns: ['title', 'url', 'category', 'audience', 'description', 'display_order', 'is_active'],
    required: ['title', 'url', 'category'],
    softDelete: true,
    orderBy: 'display_order, id',
  },
  systems: {
    table: 'SystemsDirectory',
    columns: [
      'system_name',
      'category',
      'access_url',
      'login_notes',
      'owner_department',
      'support_contact',
      'description',
      'display_order',
      'is_active',
    ],
    required: ['system_name', 'category'],
    softDelete: true,
    orderBy: 'display_order, id',
  },
  policies: {
    table: 'PolicyResources',
    columns: [
      'policy_code',
      'title',
      'category',
      'applies_to',
      'url',
      'summary',
      'display_order',
      'is_active',
    ],
    required: ['title', 'category'],
    softDelete: true,
    orderBy: 'display_order, id',
  },
};

function entityOr404(c: { req: { param: (k: string) => string } }) {
  return ENTITIES[c.req.param('entity')] ?? null;
}

function pickColumns(cfg: EntityConfig, body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const col of cfg.columns) {
    if (body[col] !== undefined) {
      let value = body[col];
      if (typeof value === 'boolean') value = value ? 1 : 0;
      if (typeof value === 'string' && value.trim() === '' && !cfg.required.includes(col)) {
        value = null;
      }
      data[col] = value;
    }
  }
  return data;
}

// GET /api/admin/content/:entity — full list including inactive rows
content.get('/:entity', async (c) => {
  const cfg = entityOr404(c);
  if (!cfg) return c.json({ success: false, error: 'Unknown content type' }, 404);
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM ${cfg.table} ORDER BY ${cfg.orderBy}`
  ).all();
  return c.json({ success: true, data: results });
});

// POST /api/admin/content/:entity — create
content.post('/:entity', async (c) => {
  const cfg = entityOr404(c);
  if (!cfg) return c.json({ success: false, error: 'Unknown content type' }, 404);
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const data = pickColumns(cfg, body);

  for (const col of cfg.required) {
    if (data[col] === undefined || data[col] === null || data[col] === '') {
      return c.json({ success: false, error: `${col} is required` }, 400);
    }
  }

  const cols = Object.keys(data);
  if (cols.length === 0) return c.json({ success: false, error: 'No fields provided' }, 400);
  const info = await c.env.DB.prepare(
    `INSERT INTO ${cfg.table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`
  )
    .bind(...cols.map((col) => data[col]))
    .run();
  const id = info.meta.last_row_id as number;
  if (cfg.afterWrite) await cfg.afterWrite(c.env.DB, id);

  const row = await c.env.DB.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).bind(id).first();
  return c.json({ success: true, data: row }, 201);
});

// PUT /api/admin/content/:entity/:id — partial update
content.put('/:entity/:id', async (c) => {
  const cfg = entityOr404(c);
  if (!cfg) return c.json({ success: false, error: 'Unknown content type' }, 404);
  const id = Number(c.req.param('id'));
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const data = pickColumns(cfg, body);

  for (const col of cfg.required) {
    if (data[col] === null || data[col] === '') {
      return c.json({ success: false, error: `${col} cannot be empty` }, 400);
    }
  }

  const cols = Object.keys(data);
  if (cols.length === 0) return c.json({ success: false, error: 'No fields provided' }, 400);
  const result = await c.env.DB.prepare(
    `UPDATE ${cfg.table} SET ${cols.map((col) => `${col} = ?`).join(', ')} WHERE id = ?`
  )
    .bind(...cols.map((col) => data[col]), id)
    .run();
  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Not found' }, 404);
  }
  if (cfg.afterWrite) await cfg.afterWrite(c.env.DB, id);

  const row = await c.env.DB.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).bind(id).first();
  return c.json({ success: true, data: row });
});

// DELETE /api/admin/content/:entity/:id — soft delete where supported;
// categories hard-delete only when no articles reference them.
content.delete('/:entity/:id', async (c) => {
  const cfg = entityOr404(c);
  if (!cfg) return c.json({ success: false, error: 'Unknown content type' }, 404);
  const id = Number(c.req.param('id'));

  if (cfg.softDelete) {
    const result = await c.env.DB.prepare(`UPDATE ${cfg.table} SET is_active = 0 WHERE id = ?`)
      .bind(id)
      .run();
    if (result.meta.changes === 0) return c.json({ success: false, error: 'Not found' }, 404);
    if (cfg.afterWrite) await cfg.afterWrite(c.env.DB, id);
    return c.json({ success: true, message: 'Hidden from the site (soft-deleted).' });
  }

  // Categories: protect referential integrity.
  const inUse = await c.env.DB.prepare(
    'SELECT COUNT(*) AS n FROM Articles WHERE category_id = ?'
  )
    .bind(id)
    .first<{ n: number }>();
  if ((inUse?.n ?? 0) > 0) {
    return c.json(
      { success: false, error: 'This category still has articles. Move or delete them first.' },
      409
    );
  }
  const result = await c.env.DB.prepare(`DELETE FROM ${cfg.table} WHERE id = ?`).bind(id).run();
  if (result.meta.changes === 0) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, message: 'Deleted.' });
});

export default content;
