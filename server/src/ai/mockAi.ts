import fs from 'fs';
import path from 'path';
import { ExtractedFacts, GeneratedArticle } from './prompts';

/**
 * MOCK_AI=1 일 때 사용하는 미리 작성된 Gemini 응답.
 * GEMINI_API_KEY 없이 전체 파이프라인(수집 → 사실추출 → 기사/칼럼 → 검수대기)을
 * 점검할 때 사용한다. fixtures/sample-items.json의 title과 매칭한다.
 */
interface SampleDraft {
  title: string;
  facts: ExtractedFacts;
  article: GeneratedArticle;
  column: GeneratedArticle;
}

let cache: SampleDraft[] | null = null;

function load(): SampleDraft[] {
  if (!cache) {
    const file = path.resolve(__dirname, '../../fixtures/sample-drafts.json');
    cache = JSON.parse(fs.readFileSync(file, 'utf-8')) as SampleDraft[];
  }
  return cache;
}

export function isMockAiEnabled(): boolean {
  return process.env.MOCK_AI === '1';
}

function findByTitle(title: string): SampleDraft {
  const found = load().find((d) => d.title === title);
  if (!found) {
    throw new Error(
      `MOCK_AI: "${title}"에 대한 샘플 응답을 찾지 못했습니다. fixtures/sample-drafts.json을 확인하세요.`
    );
  }
  return found;
}

export function mockExtractFacts(title: string): ExtractedFacts {
  return findByTitle(title).facts;
}

export function mockWriteArticle(title: string): GeneratedArticle {
  return findByTitle(title).article;
}

export function mockWriteColumn(title: string): GeneratedArticle {
  return findByTitle(title).column;
}
