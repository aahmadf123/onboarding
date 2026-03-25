import { Hono } from 'hono';
import { Bindings, OrgChartRow } from '../types';

const orgchart = new Hono<{ Bindings: Bindings }>();

// GET full org chart hierarchy
orgchart.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM OrgChart WHERE is_active = 1 ORDER BY display_order, id'
  ).all<OrgChartRow>();

  // Build tree structure
  const map = new Map<number, OrgChartRow & { children: OrgChartRow[] }>();
  const roots: (OrgChartRow & { children: OrgChartRow[] })[] = [];

  for (const node of results) {
    map.set(node.id, { ...node, children: [] });
  }

  for (const node of results) {
    const mapped = map.get(node.id)!;
    if (node.parent_id === null) {
      roots.push(mapped);
    } else {
      const parent = map.get(node.parent_id);
      if (parent) {
        parent.children.push(mapped);
      } else {
        roots.push(mapped);
      }
    }
  }

  return c.json({ success: true, data: roots });
});

// GET single org chart node by ID
orgchart.get('/:id', async (c) => {
  const id = c.req.param('id');
  const node = await c.env.DB.prepare(
    'SELECT * FROM OrgChart WHERE id = ? AND is_active = 1'
  )
    .bind(id)
    .first<OrgChartRow>();

  if (!node) return c.json({ success: false, error: 'Person not found' }, 404);

  // Also fetch direct reports
  const { results: reports } = await c.env.DB.prepare(
    'SELECT * FROM OrgChart WHERE parent_id = ? AND is_active = 1 ORDER BY display_order, id'
  )
    .bind(id)
    .all<OrgChartRow>();

  return c.json({ success: true, data: { ...node, children: reports } });
});

export default orgchart;
