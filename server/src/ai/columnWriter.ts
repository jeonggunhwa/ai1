import { generateJson } from './gemini';
import { isMockAiEnabled, mockWriteColumn } from './mockAi';
import { buildColumnPrompt, ExtractedFacts, GeneratedArticle } from './prompts';

/** rawTitle is only used to look up canned responses when MOCK_AI=1. */
export async function writeColumn(
  facts: ExtractedFacts,
  sourceLabel: string,
  rawTitle: string
): Promise<GeneratedArticle> {
  if (isMockAiEnabled()) return mockWriteColumn(rawTitle);
  return generateJson<GeneratedArticle>(buildColumnPrompt(facts, sourceLabel));
}
