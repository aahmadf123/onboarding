import { SiteContentIndexRow } from '../types';

type Chunk = { source_title: string; section_path: string | null; content_text: string };

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
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 10);

  if (terms.length === 0) return { context: '', sources: [] };

  // ── SiteContentIndex ──────────────────────────────────────────────────────
  const siteChunks = await fetchRankedChunks<Chunk>(
    db,
    terms,
    `SELECT source_title, section_path, content_text,
            {SCORE} AS match_score
     FROM SiteContentIndex
     WHERE {WHERE}
     ORDER BY match_score DESC
     LIMIT ?`,
    (term) => `(content_text LIKE '%${term}%' OR source_title LIKE '%${term}%')`,
    maxChunks
  );

  // ── KeyContacts ───────────────────────────────────────────────────────────
  const contactChunks = await fetchRankedChunks<Chunk>(
    db,
    terms,
    `SELECT contact_name AS source_title,
            'Contacts > ' || COALESCE(function_area, department) AS section_path,
            COALESCE(contact_name, '') || ' — ' || COALESCE(title, '') ||
              CASE WHEN email IS NOT NULL THEN ' | Email: ' || email ELSE '' END ||
              CASE WHEN phone IS NOT NULL THEN ' | Phone: ' || phone ELSE '' END ||
              CASE WHEN notes IS NOT NULL THEN ' | ' || notes ELSE '' END AS content_text,
            {SCORE} AS match_score
     FROM KeyContacts
     WHERE is_active = 1 AND ({WHERE})
     ORDER BY match_score DESC
     LIMIT ?`,
    (term) =>
      `(contact_name LIKE '%${term}%' OR title LIKE '%${term}%' OR function_area LIKE '%${term}%' OR department LIKE '%${term}%' OR notes LIKE '%${term}%')`,
    3
  );

  // ── SystemsDirectory ─────────────────────────────────────────────────────
  const systemChunks = await fetchRankedChunks<Chunk>(
    db,
    terms,
    `SELECT system_name AS source_title,
            'Systems > ' || COALESCE(category, 'General') AS section_path,
            system_name || ': ' || COALESCE(description, '') ||
              CASE WHEN login_notes IS NOT NULL THEN ' | Login: ' || login_notes ELSE '' END ||
              CASE WHEN access_url IS NOT NULL THEN ' | URL: ' || access_url ELSE '' END AS content_text,
            {SCORE} AS match_score
     FROM SystemsDirectory
     WHERE is_active = 1 AND ({WHERE})
     ORDER BY match_score DESC
     LIMIT ?`,
    (term) =>
      `(system_name LIKE '%${term}%' OR description LIKE '%${term}%' OR login_notes LIKE '%${term}%' OR category LIKE '%${term}%')`,
    3
  );

  // ── PolicyResources ───────────────────────────────────────────────────────
  const policyChunks = await fetchRankedChunks<Chunk>(
    db,
    terms,
    `SELECT title AS source_title,
            'Policies > ' || COALESCE(category, 'General') AS section_path,
            COALESCE(policy_code || ' — ', '') || title || ': ' || COALESCE(summary, '') AS content_text,
            {SCORE} AS match_score
     FROM PolicyResources
     WHERE is_active = 1 AND ({WHERE})
     ORDER BY match_score DESC
     LIMIT ?`,
    (term) =>
      `(title LIKE '%${term}%' OR summary LIKE '%${term}%' OR category LIKE '%${term}%' OR applies_to LIKE '%${term}%')`,
    3
  );

  // ── OrgChart ──────────────────────────────────────────────────────────────
  const orgChunks = await fetchRankedChunks<Chunk>(
    db,
    terms,
    `SELECT name AS source_title,
            'Org Chart > ' || COALESCE(department, 'General') AS section_path,
            name || ' — ' || title ||
              CASE WHEN department IS NOT NULL THEN ' (' || department || ')' ELSE '' END ||
              CASE WHEN email IS NOT NULL THEN ' | Email: ' || email ELSE '' END ||
              CASE WHEN phone IS NOT NULL THEN ' | Phone: ' || phone ELSE '' END AS content_text,
            {SCORE} AS match_score
     FROM OrgChart
     WHERE is_active = 1 AND ({WHERE})
     ORDER BY match_score DESC
     LIMIT ?`,
    (term) =>
      `(name LIKE '%${term}%' OR title LIKE '%${term}%' OR department LIKE '%${term}%')`,
    3
  );

  const allChunks = [
    ...siteChunks,
    ...contactChunks,
    ...systemChunks,
    ...policyChunks,
    ...orgChunks,
  ].slice(0, maxChunks);

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
  terms: string[],
  queryTemplate: string,
  clauseBuilder: (term: string) => string,
  limit: number
): Promise<T[]> {
  if (terms.length === 0) return [];

  const whereClauses = terms.map(clauseBuilder).join(' OR ');
  const scoreExpr = terms
    .map((t) => {
      const clause = clauseBuilder(t);
      return `CASE WHEN ${clause} THEN 1 ELSE 0 END`;
    })
    .join(' + ');

  const sql = queryTemplate
    .replace('{WHERE}', whereClauses)
    .replace('{SCORE}', scoreExpr);

  const { results } = await db.prepare(sql).bind(limit).all<T>();
  return results;
}
