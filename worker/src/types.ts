// ============================================================
// Shared TypeScript types and DB row interfaces
// ============================================================

export type Bindings = {
  DB: D1Database;
  AI: Ai;
  ASSETS: Fetcher;
  // Secrets (wrangler secret put …) — never committed
  RESEND_API_KEY: string;
  BOOTSTRAP_TOKEN: string;
  // Optional KV namespace for global (cross-isolate) rate limiting.
  // When bound in wrangler.jsonc the rate limiter uses it; otherwise it
  // falls back to a per-isolate in-memory window.
  RATE_LIMIT?: KVNamespace;
};

// Hono environment: bindings + per-request variables set by auth middleware
export type AppEnv = {
  Bindings: Bindings;
  Variables: {
    currentUser: UserRow;
    sessionId: number;
  };
};

// ============================================================
// DB row interfaces — original schema
// ============================================================

export type Role = 'staff' | 'moderator' | 'admin';
export type UserStatus = 'invited' | 'active' | 'disabled';

export interface UserRow {
  id: number;
  email: string;
  role: Role;
  created_at: string;
  name: string | null;
  password_hash: string | null;
  status: UserStatus;
  must_reset: number;
  passcode_expires_at: string | null;
  invited_at: string | null;
  password_set_at: string | null;
  last_login_at: string | null;
  localstorage_migrated_at: string | null;
}

/** The subset of UserRow that is safe to send to the client. */
export interface PublicUser {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  status: UserStatus;
  created_at: string;
}

export function toPublicUser(u: UserRow): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
  };
}

export interface CategoryRow {
  id: number;
  name: string;
  description: string | null;
}

export interface ArticleRow {
  id: number;
  category_id: number | null;
  title: string;
  current_content: string | null;
  last_updated: string;
  category_name?: string;
}

export interface SubmissionRow {
  id: number;
  article_id: number | null;
  author_id: number;
  proposed_title: string | null;
  proposed_content: string;
  request_type: 'new_article' | 'content_update' | 'access_request' | 'policy_question' | 'process_gap' | 'bug_report' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  topic_area: string | null;
  source_context: string | null;
  assigned_team: string | null;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  assignment_reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_by: number | null;
  review_notes: string | null;
  author_email?: string;
  article_title?: string;
}

// ============================================================
// DB row interfaces — schema-v2 (new tables)
// ============================================================

export interface TipRow {
  id: number;
  author_id: number;
  category_id: number | null;
  title: string;
  content: string;
  tags: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: number | null;
  review_notes: string | null;
  submitted_at: string;
  approved_at: string | null;
  last_updated: string;
  author_email?: string;
  category_name?: string;
}

export interface TipFeedbackRow {
  id: number;
  tip_id: number;
  reporter_id: number;
  reason: string;
  details: string | null;
  status: 'open' | 'resolved';
  created_at: string;
}

export interface OrgChartRow {
  id: number;
  name: string;
  title: string;
  department: string | null;
  email: string | null;
  phone: string | null;
  parent_id: number | null;
  display_order: number;
  photo_url: string | null;
  is_active: number;
}

export interface SiteContentIndexRow {
  id: number;
  source_type: string;
  source_id: number | null;
  source_title: string;
  content_text: string;
  section_path: string | null;
  last_indexed: string;
}

export interface AppConfigRow {
  key: string;
  value: string;
  updated_at: string;
}

// ============================================================
// DB row interfaces — migration 0003 (auth, tasks, email)
// ============================================================

export interface SessionRow {
  id: number;
  user_id: number;
  token_hash: string;
  created_at: string;
  expires_at: string;
  last_used_at: string | null;
  user_agent: string | null;
  ip: string | null;
}

export interface PasswordResetRow {
  id: number;
  user_id: number;
  token_hash: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

export type TaskPhase = 'first-day' | 'first-week' | 'first-month' | 'first-90-days';
export type TaskPriority = 'required' | 'recommended' | 'optional';
export type TaskAudience = 'all' | 'assigned';
export type UserTaskStatus = 'open' | 'done' | 'pending_approval' | 'approved' | 'rejected';

export interface TaskRow {
  id: number;
  slug: string;
  phase: TaskPhase;
  title: string;
  description: string | null;
  priority: TaskPriority;
  display_order: number;
  requires_approval: number;
  audience: TaskAudience;
  link_view: string | null;
  link_param: string | null;
  is_active: number;
  created_by: number | null;
  created_at: string;
}

export interface UserTaskRow {
  id: number;
  user_id: number;
  task_id: number;
  status: UserTaskStatus;
  completed_at: string | null;
  assigned_by: number | null;
  assigned_at: string | null;
  reviewed_by: number | null;
  review_notes: string | null;
  reviewed_at: string | null;
  updated_at: string | null;
}

export type EmailType =
  | 'invite'
  | 'password_reset'
  | 'task_assigned'
  | 'weekly_reminder'
  | 'approval_decision'
  | 'test';

export interface EmailLogRow {
  id: number;
  user_id: number | null;
  to_email: string;
  email_type: EmailType;
  subject: string | null;
  status: 'sent' | 'error';
  provider_id: string | null;
  error_text: string | null;
  created_at: string;
}

// ============================================================
// API response shape
// ============================================================

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
