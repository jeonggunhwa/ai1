import { listApprovedUnpublished, markDraftPublished } from '../db';
import { publishDraft } from '../publisher/httpPublisher';

export async function runPublish(limit = 10): Promise<{ processed: number; published: number }> {
  const drafts = listApprovedUnpublished(limit);
  let published = 0;

  for (const draft of drafts) {
    console.log(`[publish] #${draft.id} "${draft.title}" 발행 시도`);
    try {
      const result = await publishDraft(draft);
      markDraftPublished(draft.id, result.publishedUrl);
      published += 1;
      console.log(`[publish] #${draft.id} 완료${result.publishedUrl ? ` (${result.publishedUrl})` : ''}`);
    } catch (err) {
      console.error(`[publish] #${draft.id} 실패:`, (err as Error).message);
    }
  }

  return { processed: drafts.length, published };
}

if (require.main === module) {
  runPublish()
    .then((r) => {
      console.log(`[publish] 총 ${r.processed}건 처리, ${r.published}건 발행`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
