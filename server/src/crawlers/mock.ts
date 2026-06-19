import fs from 'fs';
import path from 'path';
import { Crawler, RawItem } from './types';

/**
 * 테스트/데모용 크롤러. fixtures/sample-items.json의 샘플 보도자료를
 * 그대로 반환한다. 실제 사이트 접근 없이 파이프라인(수집 → 사실 추출 →
 * 기사/칼럼 생성)을 검증할 때 사용한다. ENABLE_MOCK_SOURCE=1 환경변수로 활성화.
 */
export const mockCrawler: Crawler = {
  sourceId: 'mock',
  sourceName: '샘플 데이터',
  async crawl(): Promise<RawItem[]> {
    const file = path.resolve(__dirname, '../../fixtures/sample-items.json');
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw) as RawItem[];
  },
};
