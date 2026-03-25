import { Hono } from 'hono';
import { Bindings } from '../types';
import { rateLimit } from '../middleware/rate-limit';
import { chat, ChatMessage } from '../services/ai';
import { getRelevantContext } from '../services/content-index';

const aiChat = new Hono<{ Bindings: Bindings }>();

// Rate limit: 20 AI chat requests per minute per IP
aiChat.use('*', rateLimit(20));

/**
 * POST /api/ai/chat
 * Body: { messages: ChatMessage[] }
 * Returns: { success: true, data: { reply: string } }
 */
aiChat.post('/', async (c) => {
  const body = await c.req.json<{ messages: ChatMessage[] }>();

  if (!body.messages || body.messages.length === 0) {
    return c.json({ success: false, error: 'messages array is required' }, 400);
  }

  // Use the last user message as the search query for context retrieval
  const lastUserMsg = [...body.messages]
    .reverse()
    .find((m) => m.role === 'user');
  const context = lastUserMsg
    ? await getRelevantContext(c.env.DB, lastUserMsg.content)
    : '';

  const reply = await chat(c.env.AI, body.messages, context);

  return c.json({ success: true, data: { reply } });
});

export default aiChat;
