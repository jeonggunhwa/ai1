import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!config.geminiApiKey) {
    throw new Error(
      'GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.'
    );
  }
  if (!client) {
    client = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return client;
}

/** Calls Gemini with a prompt and returns the raw text response. */
export async function generateText(prompt: string): Promise<string> {
  const model = getClient().getGenerativeModel({ model: config.geminiModel });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Calls Gemini expecting a JSON object response and parses it.
 * Strips markdown code fences if the model wraps the JSON in ```json ... ```.
 */
export async function generateJson<T>(prompt: string): Promise<T> {
  const text = await generateText(prompt);
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `Gemini 응답을 JSON으로 파싱하지 못했습니다: ${(err as Error).message}\n응답 원문: ${text}`
    );
  }
}
