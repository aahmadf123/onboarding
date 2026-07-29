const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'by', 'do', 'for', 'from', 'how', 'i', 'in',
  'is', 'me', 'my', 'of', 'on', 'or', 'our', 'the', 'to', 'what', 'where',
  'who', 'with', 'you', 'your'
]);

const SYNONYMS: Record<string, string[]> = {
  access: ['login', 'credentials', 'badge'],
  badge: ['rocket', 'card', 'door', 'access'],
  benefits: ['insurance', 'retirement', 'hr'],
  compliance: ['ncaa', 'nil', 'booster'],
  deposit: ['payroll', 'direct'],
  door: ['badge', 'access', 'security'],
  hr: ['benefits', 'payroll', 'human'],
  it: ['technology', 'mfa', 'login', 'account'],
  login: ['access', 'credentials', 'account'],
  mfa: ['authenticator', 'login', 'security'],
  nil: ['compliance', 'booster', 'athlete'],
  parking: ['permit', 'parkutoledo'],
  payroll: ['deposit', 'taxes', 'myut'],
  permit: ['parking', 'parkutoledo'],
  policies: ['policy', 'rules', 'procedure'],
  policy: ['policies', 'rules', 'procedure'],
  rocket: ['card', 'badge'],
  teamworks: ['arms', 'compliance'],
};

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Longest search input that reaches SQL construction.
 *
 * The returned phrase is interpolated five to eight times into each of six
 * queries, so an uncapped input multiplies before it ever reaches D1 — a large
 * chat message became megabytes of SQL per request. Capping here covers every
 * caller, including buildContextQuery, rather than each route separately.
 */
export const MAX_SEARCH_INPUT_CHARS = 200;
export const MAX_SEARCH_PHRASE_CHARS = 120;

export function expandSearchTerms(
  query: string,
  maxTerms = 18
): { phrase: string; terms: string[] } {
  const rawTokens = query
    .slice(0, MAX_SEARCH_INPUT_CHARS)
    .split(/\s+/)
    .map(normalizeToken)
    .flatMap((token) => token.split(/\s+/))
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));

  const orderedTerms: string[] = [];
  const seen = new Set<string>();

  for (const token of rawTokens) {
    if (!seen.has(token)) {
      seen.add(token);
      orderedTerms.push(token);
    }

    for (const synonym of SYNONYMS[token] ?? []) {
      const normalized = normalizeToken(synonym);
      if (!normalized || normalized.length < 2 || seen.has(normalized)) continue;
      seen.add(normalized);
      orderedTerms.push(normalized);
    }
  }

  const baseTerms = rawTokens.filter((token, index) => rawTokens.indexOf(token) === index);

  return {
    phrase: baseTerms.join(' ').trim().slice(0, MAX_SEARCH_PHRASE_CHARS),
    terms: orderedTerms.slice(0, maxTerms),
  };
}