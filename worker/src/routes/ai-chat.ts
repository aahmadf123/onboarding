import { Hono } from 'hono';
import { Bindings } from '../types';
import { rateLimit } from '../middleware/rate-limit';
import { getRelevantContextWithSources } from '../services/content-index';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AI_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8';

const SYSTEM_PROMPT = `You are the Toledo Athletics Onboarding Assistant. You help new staff members at the University of Toledo Athletics Department understand their onboarding process, policies, and resources.

IMPORTANT RULES:
1. Only answer questions based on the provided context from the onboarding materials.
2. If you don't have relevant information, say so and direct them to the appropriate department.
3. Never make up information or guess at policies.
4. Be helpful, professional, and concise.
5. Do not reveal confidential information like SSNs, salaries, medical data, or passwords.`;

async function chat(ai: Ai, messages: ChatMessage[], context: string): Promise<string> {
  const systemMessage = context
    ? `${SYSTEM_PROMPT}\n\nRelevant onboarding context:\n${context}`
    : SYSTEM_PROMPT;

  const aiMessages = [
    { role: 'system' as const, content: systemMessage },
    ...messages,
  ];

  const response = await ai.run(AI_MODEL, { messages: aiMessages }) as { response?: string };
  return response?.response ?? 'I was unable to generate a response. Please try again.';
}

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
      success: false,
      error: 'AI service temporarily unavailable',
      data: {
        reply: 'The AI assistant encountered an error. Please try again in a moment, or contact your department directly for help.',
        sources: [],
      },
    });
  }
});

export default aiChat;
