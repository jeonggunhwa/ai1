import { generateJson } from './gemini';
import { buildNewsArticlePrompt, ExtractedFacts, GeneratedArticle } from './prompts';

export async function writeNewsArticle(
  facts: ExtractedFacts,
  sourceLabel: string
): Promise<GeneratedArticle> {
  return generateJson<GeneratedArticle>(buildNewsArticlePrompt(facts, sourceLabel));
}
