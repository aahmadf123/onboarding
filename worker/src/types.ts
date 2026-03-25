// ============================================================
// Shared TypeScript types and DB row interfaces
// ============================================================

export type Bindings = {
  DB: D1Database;
  AI: Ai;
  ASSETS: Fetcher;
  YOUTUBE_API_KEY: string;
};

// ============================================================
// DB row interfaces — original schema
// ============================================================

export interface UserRow {
  id: number;
  email: string;
  role: 'staff' | 'moderator' | 'admin';
  created_at: string;
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

export interface AIAssessmentResultRow {
  id: number;
  user_id: number;
  role_archetype: string;
  overall_level: string | null;
  score_data: string;
  recommended_videos: string | null;
  learning_plan: string | null;
  completed_at: string;
}

export interface ApprovedYouTubeSourceRow {
  id: number;
  source_type: 'channel' | 'playlist';
  youtube_id: string;
  display_name: string;
  description: string | null;
  category: string | null;
  added_by: number | null;
  is_active: number;
  created_at: string;
}

export interface UserLearningPlanRow {
  id: number;
  user_id: number;
  youtube_video_id: string;
  video_title: string;
  video_channel: string | null;
  video_duration: string | null;
  category: string | null;
  source: string | null;
  is_completed: number;
  added_at: string;
  completed_at: string | null;
}

export interface AppConfigRow {
  key: string;
  value: string;
  updated_at: string;
}

// ============================================================
// API response shape
// ============================================================

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
