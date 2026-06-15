import cron from 'node-cron';
import { config } from '../config';
import { runAll } from './runAll';

console.log(`[scheduler] 크롤링/생성 스케줄 등록: ${config.crawlCron}`);

cron.schedule(config.crawlCron, () => {
  console.log(`[scheduler] 실행 시작: ${new Date().toISOString()}`);
  runAll().catch((err) => console.error('[scheduler] 실행 실패:', err));
});

// run once on startup as well
runAll().catch((err) => console.error('[scheduler] 초기 실행 실패:', err));
