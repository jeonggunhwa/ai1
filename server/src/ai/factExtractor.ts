import { generateJson } from './gemini';
import { isMockAiEnabled, mockExtractFacts } from './mockAi';
import { buildFactExtractionPrompt, ExtractedFacts } from './prompts';

export async function extractFacts(title: string, bodyText: string): Promise<ExtractedFacts> {
  if (isMockAiEnabled()) return mockExtractFacts(title);
  return generateJson<ExtractedFacts>(buildFactExtractionPrompt(title, bodyText));
}
