import { Hono } from 'hono';
import { AppEnv } from '../types';
import { rateLimit } from '../middleware/rate-limit';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_PAGE_LENGTH = 64;

const feedback = new Hono<AppEnv>();

/**
 * POST /api/feedback — site-wide "Report an Issue".
 *
 * This used to post to /api/tips/0/feedback, which violated TipFeedback's
 * foreign key and failed silently on every submission.
 */
feedback.post('/', rateLimit(10), async (c) => {
  const user = c.get('currentUser');
  const body = await c.req
    .json<{ message?: string; page?: string }>()
    .catch(() => ({}) as { message?: string; page?: string });

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return c.json({ success: false, error: 'Please describe the issue.' }, 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return c.json(
      { success: false, error: `Please keep it under ${MAX_MESSAGE_LENGTH} characters.` },
      400
    );
  }

  const page = typeof body.page === 'string' ? body.page.slice(0, MAX_PAGE_LENGTH) : null;

  const info = await c.env.DB.prepare(
    'INSERT INTO PageFeedback (user_id, page, message) VALUES (?, ?, ?)'
  )
    .bind(user.id, page, message)
    .run();

  return c.json(
    { success: true, message: 'Thanks — this has been logged for the admins.', id: info.meta.last_row_id },
    201
  );
});

export default feedback;
