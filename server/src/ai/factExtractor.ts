import { generateJson } from './gemini';
import { buildFactExtractionPrompt, ExtractedFacts } from './prompts';

export async function extractFacts(title: string, bodyText: string): Promise<ExtractedFacts> {
  return generateJson<ExtractedFacts>(buildFactExtractionPrompt(title, bodyText));
}
