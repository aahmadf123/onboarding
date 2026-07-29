import { describe, expect, it } from 'vitest';
import { __test } from '../client/src/pages/SearchResults';

const { escapeRegex, highlightText, getSnippet } = __test;

/**
 * These pin shut the bug that motivated the whole build-step migration.
 *
 * The search helpers used to live inside a TypeScript template literal, where
 * `\s` is not a valid escape and JavaScript silently drops the backslash before
 * the browser sees the code. `/\s+/` shipped as `/s+/` and `/[...\]\\]/` shipped
 * with the character class closed early, so escapeRegex escaped nothing.
 *
 * Every assertion below fails against the pre-migration behaviour.
 */
describe('search result highlighting', () => {
  it('escapes regex metacharacters so punctuated queries do not throw', () => {
    // The old build produced an escapeRegex that returned its input unchanged,
    // and `new RegExp('(C++)')` throws — inside render, which unmounted the app.
    for (const query of ['C++', '401(k', '[HR', 'a|b', '*star', 'back\\slash']) {
      expect(() => new RegExp('(' + escapeRegex(query) + ')', 'gi')).not.toThrow();
    }
  });

  it('matches an escaped metacharacter literally', () => {
    const re = new RegExp('(' + escapeRegex('C++') + ')', 'gi');
    expect(re.test('We use C++ here')).toBe(true);
  });

  it('splits the query on real whitespace, not on the letter s', () => {
    // With the corrupted regex this highlighted "parking pa" and "".
    const html = highlightText('Parking pass pickup', 'parking pass');
    expect(html).toContain('<mark>Parking</mark>');
    expect(html).toContain('<mark>pass</mark>');
    expect(html).not.toContain('<mark>parking pa</mark>');
  });

  it('escapes HTML in the highlighted text', () => {
    const html = highlightText('<img src=x onerror=alert(1)>', 'img');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;');
  });

  it('keeps every letter s in a snippet', () => {
    // The corrupted `/s+/g` collapsed this to "Parking pa e and y tem acce ...".
    const raw = 'Parking passes and systems access for new staff members';
    const snippet = getSnippet({ id: 1, current_content: raw }, 'parking');
    expect(snippet).toBe(raw);
  });

  it('strips markdown punctuation but not word characters', () => {
    const snippet = getSnippet({ id: 1, current_content: '## Systems *access* list' }, 'systems');
    expect(snippet).toBe('Systems access list');
  });
});
