import { runCrawl } from './runCrawl';
import { runGenerate } from './runGenerate';

export async function runAll(): Promise<void> {
  await runCrawl();
  const result = await runGenerate();
  console.log(`[pipeline] 총 ${result.processed}건 처리, ${result.drafts}건 초안 생성`);
}

if (require.main === module) {
  runAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
