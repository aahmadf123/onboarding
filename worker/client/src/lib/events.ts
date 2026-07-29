/**
 * Cross-component signals.
 *
 * These exist because the components that raise them and the ones that react
 * are far apart in the tree and passing callbacks down would mean threading
 * props through most of the app. They were bare string literals scattered
 * across four files; naming them here means a typo is a compile error rather
 * than a listener that silently never fires.
 */
export const EVENTS = {
  /** A task was checked off. App refetches /stats to keep the reminder banner honest. */
  TASKS_CHANGED: 'toledo:tasks-changed',
  /** api() saw a 403 PASSWORD_RESET_REQUIRED. App switches to the forced-reset screen. */
  PASSWORD_RESET_REQUIRED: 'toledo:password-reset-required',
  /** Sidebar "Report an Issue" clicked. FeedbackButton opens its modal. */
  OPEN_FEEDBACK: 'toledo:open-feedback',
  /** Dashboard hero CTA clicked. AIChatWidget opens. */
  OPEN_CHAT: 'toledo:open-chat',
} as const;

export function emit(name: string): void {
  try {
    window.dispatchEvent(new CustomEvent(name));
  } catch {
    /* no-op: a failed notification must never break the action that caused it */
  }
}

export function on(name: string, handler: () => void): () => void {
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}
