import { describe, it, expect } from 'vitest';
import { parseDbDate, formatDate, isRealValue } from '../client/src/lib/dates';

describe('database timestamp parsing', () => {
  it('reads D1 CURRENT_TIMESTAMP as UTC, not local time', () => {
    // D1 returns `YYYY-MM-DD HH:MM:SS` with no zone marker. new Date() treats
    // that shape as local, so in Toledo every timestamp rendered four or five
    // hours in the future — "marked complete" could appear to be after now.
    const parsed = parseDbDate('2026-07-29 17:00:00');
    expect(parsed!.toISOString()).toBe('2026-07-29T17:00:00.000Z');
  });

  it('does not corrupt values that already carry a zone', () => {
    // Some columns are written with toISOString(). Appending 'Z' to those
    // yields an Invalid Date — the bug that silently disabled the login
    // lockout before it was caught.
    const iso = '2026-07-29T17:00:00.000Z';
    expect(parseDbDate(iso)!.toISOString()).toBe(iso);
    expect(parseDbDate('2026-07-29T13:00:00-04:00')!.toISOString()).toBe('2026-07-29T17:00:00.000Z');
  });

  it('returns null rather than an Invalid Date', () => {
    expect(parseDbDate(null)).toBeNull();
    expect(parseDbDate('')).toBeNull();
    expect(parseDbDate('not a date')).toBeNull();
    expect(formatDate(null)).toBe('—');
  });
});

describe('placeholder detection', () => {
  it('rejects the placeholder that shipped to production', () => {
    expect(isRealValue('TBD — update in Admin → Content → Contacts')).toBe(false);
    expect(isRealValue('TBD')).toBe(false);
    expect(isRealValue('N/A')).toBe(false);
    expect(isRealValue('  ')).toBe(false);
    expect(isRealValue(null)).toBe(false);
  });

  it('keeps real values', () => {
    expect(isRealValue('419-530-4924')).toBe(true);
    expect(isRealValue('(419) 530-2675 ext. 3')).toBe(true);
  });
});
