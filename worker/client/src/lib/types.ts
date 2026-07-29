/**
 * Shapes shared across more than one component.
 *
 * These are deliberately loose. The API responses are not generated from the
 * Worker's types, so a strict interface here would be a guess that goes stale
 * silently. Fields that every consumer relies on are named; the rest is open.
 */

export interface User {
  id: number;
  email: string;
  name?: string | null;
  role: 'user' | 'moderator' | 'admin' | string;
  status?: string;
  must_reset_password?: number | boolean;
  [key: string]: any;
}

/** A row from /api/search, which unions articles, contacts, systems and policies. */
export interface SearchHit {
  id: number;
  title?: string;
  result_type?: 'article' | 'contact' | 'system' | 'policy' | string;
  [key: string]: any;
}

export type NavigateFn = (view: string, param?: string | number | null) => void;
