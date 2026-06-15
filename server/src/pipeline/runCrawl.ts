import { crawlers } from '../crawlers';
import { insertRawItem } from '../db';
import { contentHash } from '../utils/hash';

export async function runCrawl(): Promise<{ found: number; inserted: number }> {
  let found = 0;
  let inserted = 0;

  for (const crawler of crawlers) {
    console.log(`[crawl] ${crawler.sourceId} 시작`);
    try {
      const items = await crawler.crawl();
      found += items.length;
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
      console.log(`[crawl] ${crawler.sourceId} 완료: ${items.length}건 조회`);
    } catch (err) {
      console.error(`[crawl] ${crawler.sourceId} 실패:`, (err as Error).message);
    }
  }

  console.log(`[crawl] 총 ${found}건 조회, ${inserted}건 신규 저장`);
  return { found, inserted };
}

if (require.main === module) {
  runCrawl()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
