import { generateJson } from './gemini';
import { isMockAiEnabled, mockWriteArticle } from './mockAi';
import { buildNewsArticlePrompt, ExtractedFacts, GeneratedArticle } from './prompts';

/** rawTitle is only used to look up canned responses when MOCK_AI=1. */
export async function writeNewsArticle(
  facts: ExtractedFacts,
  sourceLabel: string,
  rawTitle: string
): Promise<GeneratedArticle> {
  if (isMockAiEnabled()) return mockWriteArticle(rawTitle);
  return generateJson<GeneratedArticle>(buildNewsArticlePrompt(facts, sourceLabel));
}
