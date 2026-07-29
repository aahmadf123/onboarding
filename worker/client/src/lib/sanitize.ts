import DOMPurify from 'dompurify';

/**
 * All markdown rendered via marked.parse() is run through DOMPurify before it
 * is injected with dangerouslySetInnerHTML. The Google Maps <iframe> used by
 * the ::map directive is allowed, but its src is checked, so admin-authored or
 * AI-generated content cannot inject arbitrary frames or scripts.
 *
 * The hook is registered once at module evaluation, before any component
 * renders. Ported verbatim: the exact host matching and the node removal (as
 * opposed to merely stripping src) are both load-bearing.
 */
let hookRegistered = false;

function registerHook(): void {
  if (hookRegistered) return;
  hookRegistered = true;

  DOMPurify.addHook('afterSanitizeAttributes', (node: any) => {
    if (node.tagName === 'IFRAME') {
      // Parse the URL and match the host exactly, so look-alike domains like
      // maps.google.com.evil.example cannot pass a prefix check.
      let ok = false;
      try {
        const u = new URL(node.getAttribute('src') || '');
        ok =
          u.protocol === 'https:' &&
          (u.hostname === 'maps.google.com' ||
            (u.hostname === 'www.google.com' &&
              (u.pathname === '/maps' ||
                u.pathname.startsWith('/maps/') ||
                u.pathname.startsWith('/maps?'))));
      } catch {
        ok = false;
      }
      if (!ok) {
        node.parentNode && node.parentNode.removeChild(node);
        return;
      }
      node.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    }

    // Force external links to open safely.
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

registerHook();

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'src',
      // Explicit rather than relying on DOMPurify's defaults: the ::map iframe
      // carries a title for screen readers, and an attribute silently stripped
      // here would make that fix inert with nothing to notice.
      'title',
      'allow',
      'allowfullscreen',
      'frameborder',
      'loading',
      'referrerpolicy',
      'target',
      'width',
      'height',
    ],
  });
}
