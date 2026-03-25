import { Hono } from 'hono';
import { Bindings, ApprovedYouTubeSourceRow, UserLearningPlanRow } from '../types';
import { searchYouTube } from '../services/youtube';

const youtube = new Hono<{ Bindings: Bindings }>();

// ============================================================
// Search YouTube (restricted to approved channels/playlists)
// ============================================================

youtube.get('/search', async (c) => {
  const q = c.req.query('q');
  if (!q)
    return c.json({ success: false, error: 'Query parameter q is required' }, 400);

  const apiKey = c.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return c.json(
      { success: false, error: 'YouTube API key is not configured' },
      503
    );
  }

  // Fetch active approved channel sources only (playlists handled separately)
  const { results: sources } = await c.env.DB.prepare(
    "SELECT youtube_id FROM ApprovedYouTubeSources WHERE source_type = 'channel' AND is_active = 1"
  ).all<Pick<ApprovedYouTubeSourceRow, 'youtube_id'>>();

  const channelIds = sources.map((s) => s.youtube_id);

  if (channelIds.length === 0) {
    return c.json({ success: true, data: [], message: 'No approved channels configured.' });
  }

  const videos = await searchYouTube(apiKey, q, channelIds);
  return c.json({ success: true, data: videos });
});

// ============================================================
// Approved sources (allowlist management)
// ============================================================

// GET all active approved sources
youtube.get('/sources', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM ApprovedYouTubeSources WHERE is_active = 1 ORDER BY display_name'
  ).all();
  return c.json({ success: true, data: results });
});

// POST add a new approved source (admin only)
youtube.post('/sources', async (c) => {
  const body = await c.req.json<{
    source_type: 'channel' | 'playlist';
    youtube_id: string;
    display_name: string;
    description?: string;
    category?: string;
    added_by?: number;
  }>();

  if (!body.source_type || !body.youtube_id || !body.display_name) {
    return c.json(
      { success: false, error: 'source_type, youtube_id and display_name are required' },
      400
    );
  }

  const info = await c.env.DB.prepare(
    `INSERT INTO ApprovedYouTubeSources
       (source_type, youtube_id, display_name, description, category, added_by)
     VALUES (?,?,?,?,?,?)`
  )
    .bind(
      body.source_type,
      body.youtube_id,
      body.display_name,
      body.description ?? null,
      body.category ?? null,
      body.added_by ?? null
    )
    .run();

  return c.json(
    { success: true, message: 'Source added.', id: info.meta.last_row_id },
    201
  );
});

// DELETE deactivate an approved source (admin only)
youtube.delete('/sources/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare(
    'UPDATE ApprovedYouTubeSources SET is_active = 0 WHERE id = ?'
  )
    .bind(id)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Source not found' }, 404);
  }

  return c.json({ success: true, message: 'Source deactivated.' });
});

// ============================================================
// User learning plan
// ============================================================

// GET learning plan for a user
youtube.get('/plan/:user_id', async (c) => {
  const userId = c.req.param('user_id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM UserLearningPlan WHERE user_id = ? ORDER BY added_at DESC'
  )
    .bind(userId)
    .all<UserLearningPlanRow>();
  return c.json({ success: true, data: results });
});

// POST add a video to a user's learning plan
youtube.post('/plan', async (c) => {
  const body = await c.req.json<{
    user_id: number;
    youtube_video_id: string;
    video_title: string;
    video_channel?: string;
    video_duration?: string;
    category?: string;
    source?: string;
  }>();

  if (!body.user_id || !body.youtube_video_id || !body.video_title) {
    return c.json(
      { success: false, error: 'user_id, youtube_video_id and video_title are required' },
      400
    );
  }

  const info = await c.env.DB.prepare(
    `INSERT INTO UserLearningPlan
       (user_id, youtube_video_id, video_title, video_channel, video_duration, category, source)
     VALUES (?,?,?,?,?,?,?)`
  )
    .bind(
      body.user_id,
      body.youtube_video_id,
      body.video_title,
      body.video_channel ?? null,
      body.video_duration ?? null,
      body.category ?? null,
      body.source ?? null
    )
    .run();

  return c.json(
    { success: true, message: 'Video added to learning plan.', id: info.meta.last_row_id },
    201
  );
});

// PUT mark a learning plan item as completed
youtube.put('/plan/:id/complete', async (c) => {
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const result = await c.env.DB.prepare(
    'UPDATE UserLearningPlan SET is_completed = 1, completed_at = ? WHERE id = ?'
  )
    .bind(now, id)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Learning plan item not found' }, 404);
  }

  return c.json({ success: true, message: 'Marked as completed.' });
});

export default youtube;
