import { Hono } from 'hono';
import { Bindings } from '../types';
import { rateLimit } from '../middleware/rate-limit';
import {
  generateAssessmentQuestion,
  evaluateAssessment,
  ChatMessage,
} from '../services/ai';

const aiAssessment = new Hono<{ Bindings: Bindings }>();

// Rate limit: 30 assessment requests per minute per IP
aiAssessment.use('*', rateLimit(30));

/**
 * POST /api/ai/assessment/start
 * Begins a new assessment session.
 * Body: { role_archetype: string }
 */
aiAssessment.post('/start', async (c) => {
  try {
    const body = await c.req.json<{ role_archetype: string }>();

    if (!body.role_archetype) {
      return c.json({ success: false, error: 'role_archetype is required' }, 400);
    }

    // Load rubric from AppConfig
    const config = await c.env.DB.prepare(
      "SELECT value FROM AppConfig WHERE key = 'ai_assessment_rubric'"
    ).first<{ value: string }>();

    const rubric = config?.value ?? 'General AI literacy assessment.';

    const question = await generateAssessmentQuestion(
      c.env.AI,
      body.role_archetype,
      rubric,
      []
    );

    return c.json({ success: true, data: { question } });
  } catch (err) {
    console.error('AI Assessment start error:', err);
    return c.json({
      success: false,
      error: 'Unable to start assessment. The AI service may be temporarily unavailable.',
    }, 500);
  }
});

/**
 * POST /api/ai/assessment/answer
 * Submit an answer and receive the next question (or trigger final evaluation
 * when isLastAnswer is true).
 * Body: { role_archetype: string; messages: ChatMessage[]; is_last_answer?: boolean }
 */
aiAssessment.post('/answer', async (c) => {
  try {
    const body = await c.req.json<{
      role_archetype: string;
      messages: ChatMessage[];
      is_last_answer?: boolean;
    }>();

    if (!body.role_archetype || !body.messages) {
      return c.json(
        { success: false, error: 'role_archetype and messages are required' },
        400
      );
    }

    const config = await c.env.DB.prepare(
      "SELECT value FROM AppConfig WHERE key = 'ai_assessment_rubric'"
    ).first<{ value: string }>();

    const rubric = config?.value ?? 'General AI literacy assessment.';

    if (body.is_last_answer) {
      const evaluation = await evaluateAssessment(
        c.env.AI,
        body.role_archetype,
        rubric,
        body.messages
      );
      return c.json({ success: true, data: { done: true, evaluation } });
    }

    const question = await generateAssessmentQuestion(
      c.env.AI,
      body.role_archetype,
      rubric,
      body.messages
    );

    return c.json({ success: true, data: { done: false, question } });
  } catch (err) {
    console.error('AI Assessment answer error:', err);
    return c.json({
      success: false,
      error: 'Unable to process your answer. The AI service may be temporarily unavailable.',
    }, 500);
  }
});

/**
 * POST /api/ai/assessment/save
 * Persist a completed assessment result to the database.
 * Body: { user_id, role_archetype, overall_level, score_data, recommended_videos?, learning_plan? }
 */
aiAssessment.post('/save', async (c) => {
  const body = await c.req.json<{
    user_id: number;
    role_archetype: string;
    overall_level: string;
    score_data: unknown;
    recommended_videos?: unknown;
    learning_plan?: string;
  }>();

  if (!body.user_id || !body.role_archetype || !body.score_data) {
    return c.json(
      { success: false, error: 'user_id, role_archetype and score_data are required' },
      400
    );
  }

  const info = await c.env.DB.prepare(
    `INSERT INTO AIAssessmentResults
       (user_id, role_archetype, overall_level, score_data, recommended_videos, learning_plan)
     VALUES (?,?,?,?,?,?)`
  )
    .bind(
      body.user_id,
      body.role_archetype,
      body.overall_level ?? null,
      JSON.stringify(body.score_data),
      body.recommended_videos ? JSON.stringify(body.recommended_videos) : null,
      body.learning_plan ?? null
    )
    .run();

  return c.json(
    { success: true, message: 'Assessment saved.', id: info.meta.last_row_id },
    201
  );
});

/**
 * GET /api/ai/assessment/results/:user_id
 * Returns all past assessment results for a user.
 */
aiAssessment.get('/results/:user_id', async (c) => {
  const userId = c.req.param('user_id');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM AIAssessmentResults WHERE user_id = ? ORDER BY completed_at DESC'
  )
    .bind(userId)
    .all();
  return c.json({ success: true, data: results });
});

export default aiAssessment;
