/**
 * Onboarding phase metadata and task status helpers.
 *
 * These live in lib/ rather than beside the checklist page because the
 * dashboard also renders the phase timeline. Keeping them here is what stops
 * the page components from importing each other in a cycle.
 */

export interface PhaseMeta {
  label: string;
  icon: string;
  order: number;
}

export const PHASE_META: Record<string, PhaseMeta> = {
  'first-day': { label: 'First Day', icon: '☀️', order: 1 },
  'first-week': { label: 'First Week', icon: '📅', order: 2 },
  'first-month': { label: 'First Month', icon: '📋', order: 3 },
  'first-90-days': { label: 'First 90 Days', icon: '🎯', order: 4 },
};

/**
 * A task counts as checked once submitted, not only once approved, so a
 * sign-off task awaiting review still shows as done to the user who did it.
 */
export function taskIsChecked(status: string | null | undefined): boolean {
  return status === 'done' || status === 'approved' || status === 'pending_approval';
}
