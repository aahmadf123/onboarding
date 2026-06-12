import { SiteContentIndexRow } from '../types';
import { escapeSqlLiteral, expandSearchTerms } from './query-utils';

type Chunk = {
  source_title: string;
  section_path: string | null;
  content_text: string;
  match_score?: number;
};

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

/**
 * Retrieves relevant context chunks for AI chat.
 * Returns just the context string (backwards-compatible convenience wrapper).
 */
export async function getRelevantContext(
  db: D1Database,
  query: string,
  maxChunks = 10
): Promise<string> {
  const { context } = await getRelevantContextWithSources(db, query, maxChunks);
  return context;
}

/**
 * Retrieves relevant content from SiteContentIndex, KeyContacts,
 * SystemsDirectory, PolicyResources, and OrgChart to use as AI chat context.
 *
 * Results are ranked by the number of query terms that match so that the
 * most relevant chunks appear first.  maxChunks is raised to 10 to cover
 * multi-topic queries.
 *
 * Returns both the formatted context string and a deduplicated sources array
 * so the API can forward it to the UI.
 */
export async function getRelevantContextWithSources(
  db: D1Database,
  query: string,
  maxChunks = 10
): Promise<{ context: string; sources: string[] }> {
  const { phrase, terms } = expandSearchTerms(query, 16);

  if (!phrase && terms.length === 0) return { context: '', sources: [] };

  // ── SiteContentIndex ──────────────────────────────────────────────────────
  const siteChunks = await fetchRankedChunks<Chunk>(
    db,
    `SELECT source_title, section_path, content_text,
            ${buildWeightedScore([
              { name: 'source_title', weight: 12 },
              { name: 'section_path', weight: 7 },
              { name: 'content_text', weight: 4 },
            ], terms, phrase, 'source_title')} AS match_score
     FROM SiteContentIndex
     WHERE ${buildWhereClause(['source_title', 'section_path', 'content_text'], terms, phrase)}
     ORDER BY match_score DESC
     LIMIT ?`,
    maxChunks
  );

  // ── Live Articles ─────────────────────────────────────────────────────────
  const articleChunks = await fetchRankedChunks<Chunk>(
    db,
    `SELECT Articles.title AS source_title,
            Categories.name AS section_path,
            COALESCE(Articles.current_content, '') AS content_text,
            ${buildWeightedScore([
              { name: 'Articles.title', weight: 14 },
              { name: 'Categories.name', weight: 8 },
              { name: 'Articles.current_content', weight: 4 },
            ], terms, phrase, 'Articles.title')} AS match_score
     FROM Articles
     LEFT JOIN Categories ON Categories.id = Articles.category_id
     WHERE ${buildWhereClause(['Articles.title', 'Categories.name', 'Articles.current_content'], terms, phrase)}
     ORDER BY match_score DESC, Articles.last_updated DESC
     LIMIT ?`,
    4
  );

  // ── KeyContacts ───────────────────────────────────────────────────────────
  const contactChunks = await fetchRankedChunks<Chunk>(
    db,
    `SELECT contact_name AS source_title,
            'Contacts > ' || COALESCE(function_area, department) AS section_path,
            COALESCE(contact_name, '') || ' — ' || COALESCE(title, '') ||
              CASE WHEN email IS NOT NULL THEN ' | Email: ' || email ELSE '' END ||
              CASE WHEN phone IS NOT NULL THEN ' | Phone: ' || phone ELSE '' END ||
              CASE WHEN notes IS NOT NULL THEN ' | ' || notes ELSE '' END AS content_text,
            ${buildWeightedScore([
              { name: 'contact_name', weight: 12 },
              { name: 'title', weight: 9 },
              { name: 'function_area', weight: 8 },
              { name: 'department', weight: 6 },
              { name: 'notes', weight: 4 },
            ], terms, phrase, 'contact_name')} AS match_score
     FROM KeyContacts
     WHERE is_active = 1 AND (${buildWhereClause(['contact_name', 'title', 'function_area', 'department', 'notes'], terms, phrase)})
     ORDER BY match_score DESC
     LIMIT ?`,
    3
  );

  // ── SystemsDirectory ─────────────────────────────────────────────────────
  const systemChunks = await fetchRankedChunks<Chunk>(
    db,
    `SELECT system_name AS source_title,
            'Systems > ' || COALESCE(category, 'General') AS section_path,
            system_name || ': ' || COALESCE(description, '') ||
              CASE WHEN login_notes IS NOT NULL THEN ' | Login: ' || login_notes ELSE '' END ||
              CASE WHEN access_url IS NOT NULL THEN ' | URL: ' || access_url ELSE '' END AS content_text,
            ${buildWeightedScore([
              { name: 'system_name', weight: 12 },
              { name: 'category', weight: 7 },
              { name: 'description', weight: 5 },
              { name: 'login_notes', weight: 5 },
            ], terms, phrase, 'system_name')} AS match_score
     FROM SystemsDirectory
     WHERE is_active = 1 AND (${buildWhereClause(['system_name', 'category', 'description', 'login_notes'], terms, phrase)})
     ORDER BY match_score DESC
     LIMIT ?`,
    3
  );

  // ── PolicyResources ───────────────────────────────────────────────────────
  const policyChunks = await fetchRankedChunks<Chunk>(
    db,
    `SELECT title AS source_title,
            'Policies > ' || COALESCE(category, 'General') AS section_path,
            COALESCE(policy_code || ' — ', '') || title || ': ' || COALESCE(summary, '') AS content_text,
            ${buildWeightedScore([
              { name: 'title', weight: 12 },
              { name: 'policy_code', weight: 10 },
              { name: 'category', weight: 7 },
              { name: 'applies_to', weight: 5 },
              { name: 'summary', weight: 4 },
            ], terms, phrase, 'title')} AS match_score
     FROM PolicyResources
     WHERE is_active = 1 AND (${buildWhereClause(['title', 'policy_code', 'category', 'applies_to', 'summary'], terms, phrase)})
     ORDER BY match_score DESC
     LIMIT ?`,
    3
  );

  // ── OrgChart ──────────────────────────────────────────────────────────────
  const orgChunks = await fetchRankedChunks<Chunk>(
    db,
    `SELECT name AS source_title,
            'Org Chart > ' || COALESCE(department, 'General') AS section_path,
            name || ' — ' || title ||
              CASE WHEN department IS NOT NULL THEN ' (' || department || ')' ELSE '' END ||
              CASE WHEN email IS NOT NULL THEN ' | Email: ' || email ELSE '' END ||
              CASE WHEN phone IS NOT NULL THEN ' | Phone: ' || phone ELSE '' END AS content_text,
            ${buildWeightedScore([
              { name: 'name', weight: 11 },
              { name: 'title', weight: 8 },
              { name: 'department', weight: 6 },
            ], terms, phrase, 'name')} AS match_score
     FROM OrgChart
     WHERE is_active = 1 AND (${buildWhereClause(['name', 'title', 'department'], terms, phrase)})
     ORDER BY match_score DESC
     LIMIT ?`,
    3
  );

  const allChunks = [
    ...siteChunks,
    ...articleChunks,
    ...contactChunks,
    ...systemChunks,
    ...policyChunks,
    ...orgChunks,
  ]
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    .slice(0, maxChunks);

  if (allChunks.length === 0) return { context: '', sources: [] };

  const context = allChunks
    .map(
      (r) =>
        `[Source: ${r.source_title}${r.section_path ? ' > ' + r.section_path : ''}]\n${r.content_text}`
    )
    .join('\n\n---\n\n');

  const sources = [
    ...new Set(
      allChunks.map((r) =>
        r.source_title + (r.section_path ? ' > ' + r.section_path : '')
      )
    ),
  ];

  return { context, sources };
}

/**
 * Fetches rows from the given query template, substituting {SCORE} with a
 * SUM-of-CASE term-frequency expression and {WHERE} with the OR-joined LIKE
 * clauses.  Returns only rows that match at least one term.
 */
async function fetchRankedChunks<T extends { content_text: string; source_title: string; section_path: string | null }>(
  db: D1Database,
  queryTemplate: string,
  limit: number
): Promise<T[]> {
  const { results } = await db.prepare(queryTemplate).bind(limit).all<T>();
  return results;
}
