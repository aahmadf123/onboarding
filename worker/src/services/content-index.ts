import { SiteContentIndexRow } from '../types';

/**
 * Retrieves relevant content from SiteContentIndex and OrgChart to use as
 * AI chat context.  Returns a plain-text string suitable for inclusion in a
 * system prompt.
 */
export async function getRelevantContext(
  db: D1Database,
  query: string,
  maxChunks = 5
): Promise<string> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 5);

  if (terms.length === 0) return '';

  const likeClauses = terms.map(() => '(content_text LIKE ? OR source_title LIKE ?)').join(' OR ');
  const bindings = terms.flatMap((t) => [`%${t}%`, `%${t}%`]);

  const { results } = await db
    .prepare(
      `SELECT source_title, section_path, content_text
       FROM SiteContentIndex
       WHERE ${likeClauses}
       ORDER BY last_indexed DESC
       LIMIT ?`
    )
    .bind(...bindings, maxChunks)
    .all<Pick<SiteContentIndexRow, 'source_title' | 'section_path' | 'content_text'>>();

  if (results.length === 0) return '';

  return results
    .map(
      (r) =>
        `[Source: ${r.source_title}${r.section_path ? ' > ' + r.section_path : ''}]\n${r.content_text}`
    )
    .join('\n\n---\n\n');
}
