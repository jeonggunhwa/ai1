/**
 * 가벼운 스모크 테스트. 실제 Gemini API 호출 없이
 * 1) 목 데이터 수집 → DB 저장 → 중복 제거
 * 2) 프롬프트/출처표기 빌더가 법적 가이드라인 문구를 포함하는지
 * 를 검증한다.
 *
 * 실행: GEMINI_API_KEY 없이도 동작 (AI 호출 없음)
 *   npm test
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

const tmpDb = path.join(os.tmpdir(), `edufocus-test-${Date.now()}.db`);
process.env.DB_PATH = tmpDb;
process.env.ENABLE_MOCK_SOURCE = '1';

/* eslint-disable @typescript-eslint/no-var-requires */
const { insertRawItem, getRawItemsWithoutDrafts } = require('../src/db');
const { mockCrawler } = require('../src/crawlers/mock');
const { contentHash } = require('../src/utils/hash');
const { buildFactExtractionPrompt, buildNewsArticlePrompt, buildColumnPrompt, LEGAL_GUIDELINES } = require('../src/ai/prompts');
const { buildSourceCitation, AI_DISCLOSURE } = require('../src/pipeline/sourceCitation');

let failures = 0;

function assert(cond: unknown, message: string) {
  if (!cond) {
    failures += 1;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`PASS: ${message}`);
  }
}

async function main() {
  // 1) mock crawler returns fixture items
  const items = await mockCrawler.crawl();
  assert(items.length === 3, 'mock crawler returns 3 fixture items');

  // 2) insert into DB, dedupe by URL
  let inserted = 0;
  for (const item of items) {
    const hash = contentHash(item.title, item.bodyText);
    const row = insertRawItem({
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      category: item.category,
      title: item.title,
      url: item.url,
      publishedAt: item.publishedAt,
      bodyText: item.bodyText,
      contentHash: hash,
    });
    if (row) inserted += 1;
  }
  assert(inserted === 3, 'all 3 items inserted on first run');

  // re-insert same items -> should be deduped
  let secondInsert = 0;
  for (const item of items) {
    const hash = contentHash(item.title, item.bodyText);
    const row = insertRawItem({
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      category: item.category,
      title: item.title,
      url: item.url,
      publishedAt: item.publishedAt,
      bodyText: item.bodyText,
      contentHash: hash,
    });
    if (row) secondInsert += 1;
  }
  assert(secondInsert === 0, 'duplicate URLs are skipped on re-crawl');

  // 3) items without drafts
  const pending = getRawItemsWithoutDrafts(10);
  assert(pending.length === 3, 'all 3 items are pending draft generation');

  // 4) prompts include legal guidelines and required instructions
  const factPrompt = buildFactExtractionPrompt(items[0].title, items[0].bodyText);
  assert(factPrompt.includes(LEGAL_GUIDELINES), 'fact extraction prompt embeds legal guidelines');
  assert(factPrompt.includes('추측하지 말고'), 'fact extraction prompt forbids speculation');

  const facts = {
    agency: '교육부', headline: '', summary: '', who: '', what: '', when: '', where: '',
    why: '', how: '', targetAudience: '', applicationPeriod: '', cost: '', applyMethod: '',
    contact: '', keyNumbers: [], cautions: [],
  };
  const articlePrompt = buildNewsArticlePrompt(facts, '교육부');
  assert(articlePrompt.includes('교육부에 따르면'), 'news prompt requires source attribution phrase');
  assert(articlePrompt.includes(LEGAL_GUIDELINES), 'news prompt embeds legal guidelines');

  const columnPrompt = buildColumnPrompt(facts, '교육부');
  assert(columnPrompt.includes('단정적 비판'), 'column prompt forbids definitive criticism');
  assert(columnPrompt.includes(LEGAL_GUIDELINES), 'column prompt embeds legal guidelines');

  // 5) source citation references original URL and AI disclosure mentions review
  const row = pending[0];
  const citation = buildSourceCitation(row);
  assert(citation.includes(row.url), 'source citation includes original URL');
  assert(AI_DISCLOSURE.includes('검수'), 'AI disclosure mentions editorial review');

  fs.rmSync(tmpDb, { force: true });
  fs.rmSync(tmpDb + '-wal', { force: true });
  fs.rmSync(tmpDb + '-shm', { force: true });

  if (failures > 0) {
    console.error(`\n${failures}개 실패`);
    process.exit(1);
  }
  console.log('\n모든 테스트 통과');
}

main();
