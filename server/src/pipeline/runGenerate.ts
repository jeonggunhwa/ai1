import { config } from '../config';
import { getRawItemsWithoutDrafts, insertDraft } from '../db';
import { extractFacts } from '../ai/factExtractor';
import { writeNewsArticle } from '../ai/articleWriter';
import { writeColumn } from '../ai/columnWriter';
import { AI_DISCLOSURE, buildSourceCitation, sourceLabel } from './sourceCitation';

export async function runGenerate(limit = 10): Promise<{ processed: number; drafts: number }> {
  const items = getRawItemsWithoutDrafts(limit);
  let drafts = 0;

  for (const raw of items) {
    console.log(`[generate] #${raw.id} "${raw.title}" 처리 중`);
    try {
      const facts = await extractFacts(raw.title, raw.body_text);
      const citation = buildSourceCitation(raw);
      const label = sourceLabel(raw);

      const article = await writeNewsArticle(facts, label);
      insertDraft({
        rawItemId: raw.id,
        draftType: 'news',
        title: article.title,
        bodyMarkdown: `${article.body}\n\n${citation}`,
        factsJson: JSON.stringify(facts),
        sourceCitation: citation,
        aiModel: config.geminiModel,
        aiDisclosure: AI_DISCLOSURE,
      });
      drafts += 1;

      const column = await writeColumn(facts, label);
      insertDraft({
        rawItemId: raw.id,
        draftType: 'column',
        title: column.title,
        bodyMarkdown: `${column.body}\n\n${citation}`,
        factsJson: JSON.stringify(facts),
        sourceCitation: citation,
        aiModel: config.geminiModel,
        aiDisclosure: AI_DISCLOSURE,
      });
      drafts += 1;

      console.log(`[generate] #${raw.id} 완료: 기사 1건 + 칼럼 1건 생성`);
    } catch (err) {
      console.error(`[generate] #${raw.id} 실패:`, (err as Error).message);
    }
  }

  return { processed: items.length, drafts };
}

if (require.main === module) {
  runGenerate()
    .then((r) => {
      console.log(`[generate] 총 ${r.processed}건 처리, ${r.drafts}건 초안 생성`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
