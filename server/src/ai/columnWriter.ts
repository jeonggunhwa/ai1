import { generateJson } from './gemini';
import { buildColumnPrompt, ExtractedFacts, GeneratedArticle } from './prompts';

export async function writeColumn(
  facts: ExtractedFacts,
  sourceLabel: string
): Promise<GeneratedArticle> {
  return generateJson<GeneratedArticle>(buildColumnPrompt(facts, sourceLabel));
}
