import { Hono } from 'hono';
import { Bindings } from '../types';
import { rateLimit } from '../middleware/rate-limit';
import { getRelevantContextWithSources } from '../services/content-index';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AI_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const SYSTEM_PROMPT = `You are the Toledo Athletics Onboarding Assistant. You help new staff members at the University of Toledo Athletics Department understand their onboarding process, policies, and resources.

IMPORTANT RULES:
1. Only answer questions based on the provided context from the onboarding materials.
2. If you don't have relevant information, say so and direct them to the appropriate department.
3. Never make up information or guess at policies.
4. Be helpful, professional, and concise.
5. Do not reveal confidential information like SSNs, salaries, medical data, or passwords.`;

/** Build the context query from the last 3 user messages for richer multi-turn retrieval. */
function buildContextQuery(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role === 'user')
    .slice(-3)
    .map((m) => m.content)
    .join(' ');
}

function buildSystemMessage(context: string): string {
  return context
    ? `${SYSTEM_PROMPT}\n\nRelevant onboarding context:\n${context}`
    : SYSTEM_PROMPT;
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

    const contextQuery = buildContextQuery(body.messages);
    const { context, sources } = contextQuery
      ? await getRelevantContextWithSources(c.env.DB, contextQuery)
      : { context: '', sources: [] };

    if (!c.env.AI) {
      const fallbackReply = context
        ? `Based on onboarding materials:\n\n${context.substring(0, 500)}...\n\nFor more details, please contact the relevant department.`
        : 'The AI assistant is currently unavailable. Please try again later or contact your department directly.';
      return c.json({ success: true, data: { reply: fallbackReply, sources } });
    }

    const aiMessages = [
      { role: 'system' as const, content: buildSystemMessage(context) },
      ...body.messages,
    ];
    const response = await c.env.AI.run(AI_MODEL, { messages: aiMessages }) as { response?: string };
    const reply = response?.response ?? 'I was unable to generate a response. Please try again.';

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

/**
 * POST /api/ai/chat/stream
 * Body: { messages: ChatMessage[] }
 * Returns: text/event-stream with:
 *   data: { type: 'sources', sources: string[] }
 *   data: { type: 'token', text: string }  (repeated)
 *   data: [DONE]
 */
aiChat.post('/stream', async (c) => {
  try {
    const body = await c.req.json<{ messages: ChatMessage[] }>();

    if (!body.messages || body.messages.length === 0) {
      return c.json({ success: false, error: 'messages array is required' }, 400);
    }

    const contextQuery = buildContextQuery(body.messages);
    const { context, sources } = contextQuery
      ? await getRelevantContextWithSources(c.env.DB, contextQuery)
      : { context: '', sources: [] };

    const encoder = new TextEncoder();

    // Fallback when AI binding is unavailable
    if (!c.env.AI) {
      const fallback = context
        ? `Based on onboarding materials:\n\n${context.substring(0, 500)}...\n\nFor more details, please contact the relevant department.`
        : 'The AI assistant is currently unavailable. Please try again later or contact your department directly.';
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', text: fallback })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });
    }

    const aiMessages = [
      { role: 'system' as const, content: buildSystemMessage(context) },
      ...body.messages,
    ];

    const aiStream = await c.env.AI.run(AI_MODEL, { messages: aiMessages, stream: true }) as ReadableStream;

    const readable = new ReadableStream({
      async start(controller) {
        // Emit sources metadata first so the UI can display citations immediately
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`));

        const reader = aiStream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                return;
              }
              try {
                const parsed = JSON.parse(data) as { response?: string };
                if (parsed.response) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'token', text: parsed.response })}\n\n`)
                  );
                }
              } catch { /* ignore malformed SSE chunks */ }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('AI Chat stream error:', err);
    return c.json({ success: false, error: 'AI service temporarily unavailable' }, 500);
  }
});

export default aiChat;
