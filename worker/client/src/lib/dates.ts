/**
 * Date handling for values that come out of D1.
 *
 * D1 returns CURRENT_TIMESTAMP as `YYYY-MM-DD HH:MM:SS` — UTC, with no zone
 * marker. `new Date()` treats a string in that shape as *local* time, so in
 * Toledo every timestamp rendered four or five hours in the future. "Marked
 * complete" could appear to be later than the current time.
 *
 * Some columns are written by the application with toISOString() instead, which
 * already carries a `Z`. Appending one unconditionally turns those into an
 * Invalid Date, so this checks before adding it — a bug that has already bitten
 * once, in the login lockout.
 */
export function parseDbDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const raw = String(value).trim();
  // Already zoned (ISO with Z or a ±HH:MM offset): parse as-is.
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const normalized = hasZone ? raw : raw.replace(' ', 'T') + 'Z';

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Localised date, or an em dash when the value is missing or unparseable. */
export function formatDate(value: string | null | undefined): string {
  const date = parseDbDate(value);
  return date ? date.toLocaleDateString() : '—';
}

/** Localised date and time, or an em dash. */
export function formatDateTime(value: string | null | undefined): string {
  const date = parseDbDate(value);
  return date ? date.toLocaleString() : '—';
}

/**
 * Whether a stored contact detail is a real value rather than a placeholder.
 *
 * A seeded contact shipped with the literal phone number
 * "TBD — update in Admin → Content → Contacts", which rendered as a tel: link
 * and was handed to the AI as a phone number.
 */
export function isRealValue(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  return !/^(tbd|n\/?a|none|unknown|pending)\b/i.test(trimmed);
}
