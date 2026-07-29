import { marked } from 'marked';
import { sanitizeHtml } from './sanitize';

/**
 * Lines of the form `::map <google-maps-embed-url>` become responsive map
 * iframes. Only https://www.google.com/maps* and maps.google.com URLs are
 * allowed; anything else is dropped entirely rather than passed through.
 *
 * Lives in lib/ rather than beside ArticleView because the admin CMS preview
 * needs it too, and importing it from a page component would create a cycle.
 */
export function renderMapDirectives(text: string): string {
  if (!text) return '';
  const lines = String(text).split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.indexOf('::map ') === 0) {
      const url = trimmed.slice(6).trim();
      let ok = false;
      try {
        const parsed = new URL(url);
        ok =
          parsed.protocol === 'https:' &&
          (parsed.hostname === 'www.google.com' || parsed.hostname === 'maps.google.com') &&
          parsed.pathname.indexOf('/maps') === 0;
      } catch {
        ok = false;
      }
      if (ok) {
        out.push(
          '<div style="position:relative;width:100%;padding-bottom:56%;border-radius:12px;overflow:hidden;margin:12px 0;border:1px solid #e5e7eb;">' +
            '<iframe title="Embedded map" src="' +
            url.replace(/"/g, '&quot;') +
            '" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;border:0;" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>' +
            '</div>'
        );
      }
    } else {
      out.push(lines[i]);
    }
  }
  return out.join('\n');
}

/** Escapes text and preserves line breaks, for when marked throws. */
function escapeToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

/**
 * Markdown to sanitised HTML. Every caller feeds the result straight into
 * dangerouslySetInnerHTML, so sanitising here rather than at each call site
 * means a new caller cannot forget to.
 */
export function renderMarkdown(text: string): string {
  if (!text) return '';
  const withMaps = renderMapDirectives(text);
  try {
    return sanitizeHtml(marked.parse(withMaps) as string);
  } catch {
    return sanitizeHtml(escapeToHtml(text));
  }
}
