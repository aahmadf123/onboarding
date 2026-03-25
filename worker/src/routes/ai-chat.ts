import { Hono } from 'hono';
import { Bindings } from '../types';
import { rateLimit } from '../middleware/rate-limit';
import { chat, ChatMessage } from '../services/ai';
import { getRelevantContextWithSources } from '../services/content-index';

const aiChat = new Hono<{ Bindings: Bindings }>();

// Rate limit: 20 AI chat requests per minute per IP
aiChat.use('*', rateLimit(20));

/**
 * POST /api/ai/chat
 * Body: { messages: ChatMessage[] }
 * Returns: { success: true, data: { reply: string, sources: string[] } }
 */
aiChat.post('/', async (c) => {
  try {
    const body = await c.req.json<{ messages: ChatMessage[] }>();

    if (!body.messages || body.messages.length === 0) {
      return c.json({ success: false, error: 'messages array is required' }, 400);
    }

    // Use the last user message as the search query for context retrieval
    const lastUserMsg = [...body.messages]
      .reverse()
      .find((m) => m.role === 'user');

    const { context, sources } = lastUserMsg
      ? await getRelevantContextWithSources(c.env.DB, lastUserMsg.content)
      : { context: '', sources: [] };

    // If AI binding is not available, return context-based response
    if (!c.env.AI) {
      const fallbackReply = context
        ? `Based on onboarding materials:\n\n${context.substring(0, 500)}...\n\nFor more details, please contact the relevant department.`
        : 'The AI assistant is currently unavailable. Please try again later or contact your department directly.';
      return c.json({ success: true, data: { reply: fallbackReply, sources } });
    }

    const reply = await chat(c.env.AI, body.messages, context);

    return c.json({ success: true, data: { reply, sources } });
  } catch (err) {
    console.error('AI Chat error:', err);
    return c.json({
      success: true,
      data: {
        reply: 'The AI assistant encountered an error. Please try again in a moment, or contact your department directly for help.',
        sources: [],
      },
    });
  }
});

export default aiChat;
