import { Crawler } from './types';
import { moeCrawler } from './moe';
import { senCrawler } from './sen';
import { neulbaeumCrawler } from './neulbaeum';
import { mockCrawler } from './mock';

export const crawlers: Crawler[] = [moeCrawler, senCrawler, neulbaeumCrawler];

if (process.env.ENABLE_MOCK_SOURCE === '1') {
  crawlers.push(mockCrawler);
}

export * from './types';
