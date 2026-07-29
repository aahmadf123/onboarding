import { EVENTS, emit } from './events';

const API_BASE = '/api';

const TOKEN_KEY = 'toledo_session_token';
const USER_KEY = 'toledo_auth_user';
const SIGNOUT_REASON_KEY = 'toledo_signout_reason';

export interface ApiResult {
  success: boolean;
  error?: string;
  code?: string;
  message?: string;
  data?: any;
  [key: string]: any;
}

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing or storage disabled */
  }
}

export function setCachedUser(user: unknown): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* non-fatal */
  }
}

export function clearCachedUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* non-fatal */
  }
}

/**
 * The reason is stashed so the sign-in screen can explain why the user landed
 * there, instead of dropping them on a bare login form with no context.
 */
export function clearAuthAndReload(reason?: string): void {
  setSessionToken(null);
  clearCachedUser();
  try {
    if (reason) sessionStorage.setItem(SIGNOUT_REASON_KEY, reason);
  } catch {
    /* non-fatal */
  }
  window.location.href = '/';
}

export function takeSignOutReason(): string {
  try {
    const reason = sessionStorage.getItem(SIGNOUT_REASON_KEY);
    if (reason) sessionStorage.removeItem(SIGNOUT_REASON_KEY);
    return reason || '';
  } catch {
    return '';
  }
}

/** Bearer header for callers that bypass api(), such as the chat SSE stream. */
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  const token = getSessionToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return headers;
}

/**
 * Always resolves to a `{ success, error? }` shape.
 *
 * A rejected fetch or a non-JSON body (Hono's plain-text 500, a proxy
 * interstitial, the SPA shell served for an unmatched /api path) used to reject
 * here, which left every caller's loading flag stuck on forever.
 */
export async function api(path: string, options: RequestInit = {}): Promise<ApiResult> {
  const token = getSessionToken();

  let res: Response;
  try {
    res = await fetch(API_BASE + path, { ...options, headers: authHeaders(options.headers as any) });
  } catch {
    return {
      success: false,
      error: 'Could not reach the server. Check your connection and try again.',
    };
  }

  const isAuthPath = path.indexOf('/auth/') === 0;

  // A 401 outside the auth endpoints means the session is gone. Start over.
  if (res.status === 401 && !isAuthPath && token) {
    clearAuthAndReload('Your session expired. Please sign in again.');
    return { success: false, error: 'Session expired' };
  }

  let body: ApiResult | null = null;
  try {
    body = (await res.json()) as ApiResult;
  } catch {
    body = null;
  }

  // The gate returns 403 for disabled accounts and for accounts still owing a
  // password reset. Neither used to be handled, so the UI just froze.
  if (res.status === 403 && body) {
    if (body.code === 'PASSWORD_RESET_REQUIRED') {
      emit(EVENTS.PASSWORD_RESET_REQUIRED);
      return body;
    }
    if (body.code === 'ACCOUNT_DISABLED') {
      clearAuthAndReload('This account has been disabled. Contact an administrator.');
      return body;
    }
  }

  if (body === null) {
    return {
      success: false,
      error: res.ok
        ? 'The server sent a response we could not read. Please try again.'
        : 'Something went wrong (error ' + res.status + '). Please try again.',
    };
  }
  return body;
}
