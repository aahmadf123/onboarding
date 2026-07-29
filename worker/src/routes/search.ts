import { Hono } from 'hono';
import { rateLimit } from '../middleware/rate-limit';
import { AppEnv } from '../types';
import {
  escapeSqlLiteral,
  expandSearchTerms,
  MAX_SEARCH_INPUT_CHARS,
} from '../services/query-utils';

const search = new Hono<AppEnv>();

function buildWeightedScore(
  fields: Array<{ name: string; weight: number }>,
  terms: string[],
  phrase: string,
  exactTitleField?: string
): string {
  const pieces: string[] = [];

  if (phrase) {
    const escapedPhrase = escapeSqlLiteral(phrase);
    if (exactTitleField) {
      pieces.push(
        `CASE WHEN lower(${exactTitleField}) = '${escapedPhrase}' THEN 120 ELSE 0 END`,
        `CASE WHEN lower(${exactTitleField}) LIKE '${escapedPhrase}%' THEN 60 ELSE 0 END`
      );
    }

    for (const field of fields) {
      pieces.push(
        `CASE WHEN lower(${field.name}) LIKE '%${escapedPhrase}%' THEN ${field.weight * 3} ELSE 0 END`
      );
    }
  }

  for (const term of terms) {
    const escapedTerm = escapeSqlLiteral(term);
    for (const field of fields) {
      pieces.push(
        `CASE WHEN lower(${field.name}) LIKE '%${escapedTerm}%' THEN ${field.weight} ELSE 0 END`
      );
    }
  }

  return pieces.length > 0 ? pieces.join(' + ') : '0';
}

function buildWhereClause(fields: string[], terms: string[], phrase: string): string {
  const checks: string[] = [];

  if (phrase) {
    const escapedPhrase = escapeSqlLiteral(phrase);
    checks.push(...fields.map((field) => `lower(${field}) LIKE '%${escapedPhrase}%'`));
  }

  for (const term of terms) {
    const escapedTerm = escapeSqlLiteral(term);
    checks.push(...fields.map((field) => `lower(${field}) LIKE '%${escapedTerm}%'`));
  }

  return checks.length > 0 ? checks.join(' OR ') : '1 = 0';
}

search.get('/', rateLimit(60), async (c) => {
  const q = c.req.query('q');
  if (!q)
    return c.json({ success: false, error: 'Query parameter q is required' }, 400);
  // expandSearchTerms truncates anyway, but rejecting outright tells the caller
  // their query was not run in full rather than silently searching a prefix.
  if (q.length > MAX_SEARCH_INPUT_CHARS) {
    return c.json(
      { success: false, error: `Query parameter q must be ${MAX_SEARCH_INPUT_CHARS} characters or fewer` },
      400
    );
  }

  const { phrase, terms } = expandSearchTerms(q);
  if (!phrase && terms.length === 0) {
    return c.json({ success: true, data: [], query: q });
  }

  const articleFields = ['Articles.title', 'Articles.current_content', 'Categories.name'];
  const contactFields = ['contact_name', 'title', 'function_area', 'department', 'notes', 'email'];
  const systemFields = ['system_name', 'description', 'login_notes', 'category', 'owner_department', 'support_contact'];
  const policyFields = ['title', 'summary', 'category', 'applies_to', 'policy_code'];

  const [articles, contacts, systems, policies] = await Promise.all([
    c.env.DB.prepare(`
      SELECT Articles.id, Articles.title, Articles.current_content, Articles.category_id,
             Articles.last_updated, Categories.name as category_name, 'article' as result_type,
             ${buildWeightedScore([
               { name: 'Articles.title', weight: 14 },
               { name: 'Categories.name', weight: 7 },
               { name: 'Articles.current_content', weight: 3 },
             ], terms, phrase, 'Articles.title')} as match_score
      FROM Articles
      LEFT JOIN Categories ON Articles.category_id = Categories.id
      WHERE Articles.is_active = 1 AND (${buildWhereClause(articleFields, terms, phrase)})
      ORDER BY
        match_score DESC,
        Articles.last_updated DESC,
        Articles.id DESC
      LIMIT 12
    `).all(),

    c.env.DB.prepare(`
      SELECT id, contact_name as title, function_area, department, email, phone, notes,
             'contact' as result_type,
             ${buildWeightedScore([
               { name: 'contact_name', weight: 12 },
               { name: 'title', weight: 9 },
               { name: 'function_area', weight: 8 },
               { name: 'department', weight: 6 },
               { name: 'notes', weight: 3 },
               { name: 'email', weight: 2 },
             ], terms, phrase, 'contact_name')} as match_score
      FROM KeyContacts
      WHERE is_active = 1
        AND (${buildWhereClause(contactFields, terms, phrase)})
      ORDER BY match_score DESC, display_order ASC, id ASC
      LIMIT 6
    `).all(),

    c.env.DB.prepare(`
      SELECT id, system_name as title, description, access_url, login_notes, category,
             'system' as result_type,
             ${buildWeightedScore([
               { name: 'system_name', weight: 12 },
               { name: 'category', weight: 7 },
               { name: 'description', weight: 4 },
               { name: 'login_notes', weight: 4 },
               { name: 'owner_department', weight: 4 },
               { name: 'support_contact', weight: 3 },
             ], terms, phrase, 'system_name')} as match_score
      FROM SystemsDirectory
      WHERE is_active = 1
        AND (${buildWhereClause(systemFields, terms, phrase)})
      ORDER BY match_score DESC, display_order ASC, id ASC
      LIMIT 6
    `).all(),

    c.env.DB.prepare(`
      SELECT id, title, summary, policy_code, category, applies_to,
             'policy' as result_type,
             ${buildWeightedScore([
               { name: 'title', weight: 12 },
               { name: 'policy_code', weight: 9 },
               { name: 'category', weight: 7 },
               { name: 'applies_to', weight: 5 },
               { name: 'summary', weight: 4 },
             ], terms, phrase, 'title')} as match_score
      FROM PolicyResources
      WHERE is_active = 1
        AND (${buildWhereClause(policyFields, terms, phrase)})
      ORDER BY match_score DESC, display_order ASC, id ASC
      LIMIT 6
    `).all(),
  ]);

  const results = [
    ...(articles.results ?? []),
    ...(contacts.results ?? []),
    ...(systems.results ?? []),
    ...(policies.results ?? []),
  ]
    .sort((a, b) => (Number(b.match_score) || 0) - (Number(a.match_score) || 0))
    .slice(0, 24);

  return c.json({ success: true, data: results, query: q });
});

export default search;
