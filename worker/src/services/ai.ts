const CHAT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8' as const;

const SYSTEM_PROMPT = `You are an onboarding assistant for the University of Toledo Athletics department.

RULES — follow these strictly:
1. Only answer questions based on the content provided in the <context> block below.
2. Always cite the source article or section your answer comes from (e.g., "According to [HR & Benefits > Health Insurance]...").
3. If the answer is not in the provided context, say: "I don't have that information in the onboarding materials. Please contact [specific person or department] for help."
4. NEVER make up policies, procedures, dollar amounts, or personnel decisions.
5. NEVER leak HR specifics, salary data, or confidential personnel information.
6. Keep answers concise and actionable.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Sends a chat message to Workers AI and returns the assistant's reply.
 */
export async function chat(
  ai: Ai,
  messages: ChatMessage[],
  context: string
): Promise<string> {
  const systemContent = context
    ? `${SYSTEM_PROMPT}\n\n<context>\n${context}\n</context>`
    : SYSTEM_PROMPT;

  const response = await ai.run(CHAT_MODEL, {
    messages: [{ role: 'system', content: systemContent }, ...messages],
  });

  // Workers AI returns { response: string } for text generation models
  const result = response as { response?: string };
  return result.response ?? 'I was unable to generate a response. Please try again.';
}

const ASSESSMENT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8' as const;

/**
 * Presents a scenario question to the user and returns the AI-generated
 * question text.
 */
export async function generateAssessmentQuestion(
  ai: Ai,
  roleArchetype: string,
  rubric: string,
  previousQA: ChatMessage[]
): Promise<string> {
  const systemContent = `You are an AI literacy assessment facilitator for the University of Toledo Athletics department.

Your job is to present scenario-based questions from the following rubric to assess a ${roleArchetype}'s AI literacy.

RUBRIC:
${rubric}

INSTRUCTIONS:
- Ask one clear scenario question at a time based on the rubric.
- After the user answers, acknowledge their response and ask the next question.
- Use realistic athletics department scenarios.
- Do NOT score the user in this message — just ask the next question.
- Add a note at the end of your FIRST message: "Note: This is a self-development exercise, NOT an HR evaluation."`;

  const response = await ai.run(ASSESSMENT_MODEL, {
    messages: [{ role: 'system', content: systemContent }, ...previousQA],
  });

  const result = response as { response?: string };
  return result.response ?? 'Unable to generate assessment question. Please try again.';
}

/**
 * Evaluates the user's assessment answers and returns a structured score
 * object as a JSON string.
 */
export async function evaluateAssessment(
  ai: Ai,
  roleArchetype: string,
  rubric: string,
  qa: ChatMessage[]
): Promise<{ overall_level: string; score_data: Record<string, unknown>; learning_plan: string }> {
  const systemContent = `You are an AI literacy evaluator for the University of Toledo Athletics department.

Based on the conversation below, evaluate the user's AI literacy for the role of ${roleArchetype}.

RUBRIC:
${rubric}

Return ONLY a valid JSON object with this exact shape:
{
  "overall_level": "beginner" | "intermediate" | "advanced",
  "score_data": {
    "<category>": { "score": <0-5>, "feedback": "<string>" }
  },
  "learning_plan": "<short paragraph of recommended next steps>"
}

IMPORTANT: This is self-development only, NOT an HR evaluation. Include that disclaimer in the learning_plan.`;

  const response = await ai.run(ASSESSMENT_MODEL, {
    messages: [
      { role: 'system', content: systemContent },
      ...qa,
      {
        role: 'user',
        content: 'Please evaluate my responses and return the JSON result.',
      },
    ],
  });

  const result = response as { response?: string };
  const raw = result.response ?? '{}';

  try {
    // Extract JSON from the response (model may wrap it in markdown code blocks)
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw);
    return {
      overall_level: parsed.overall_level ?? 'beginner',
      score_data: parsed.score_data ?? {},
      learning_plan: parsed.learning_plan ?? '',
    };
  } catch {
    return {
      overall_level: 'beginner',
      score_data: {},
      learning_plan: raw,
    };
  }
}
