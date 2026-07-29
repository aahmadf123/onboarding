-- ============================================================
-- Retire three tables nothing reads.
--
-- Tips / TipFeedback
--   A complete moderation backend with no user-facing surface: no browse page,
--   no submit form, no link to either. The eight seeded tips were unreachable
--   from the running site, and no tip could ever be created, so the two
--   moderation tabs rendered queues that could only ever be empty. Confirmed
--   empty in production (0 rows in both tables) before writing this.
--
--   TipFeedback was also the target of the site-wide "Report an Issue" button,
--   which posted against tip id 0 and violated the foreign key on every press.
--   That moved to its own PageFeedback table in 0008.
--
-- BrandingTokens
--   Eighteen rows of colours, typefaces and logo rules, read by no route, no
--   service and no component. The palette the site actually renders lives in
--   the stylesheet's @theme block, so these rows could drift from the real
--   brand colours indefinitely without anything noticing.
--
-- The application code for all three is removed in the same change, so this
-- runs against a Worker that no longer references them either way.
--
-- Dropping a table drops its indexes with it, so idx_tips_*,
-- idx_tipfeedback_* and idx_brandingtokens_group need no separate statement.
--
-- Not dropped, deliberately: AIAssessmentResults, ApprovedYouTubeSources and
-- UserLearningPlan. Those exist in the production database, are equally unread
-- by this codebase, and are created by no file in it — they predate this
-- repository's schema. Retiring them is a separate decision about a feature
-- nobody here has seen, and ApprovedYouTubeSources holds 13 rows of content
-- somebody entered on purpose.
--
-- TipFeedback goes first: its foreign key references Tips.
-- ============================================================

DROP TABLE IF EXISTS TipFeedback;
DROP TABLE IF EXISTS Tips;
DROP TABLE IF EXISTS BrandingTokens;
