import { crawlBoard, BoardConfig } from './genericBoard';
import { Crawler, RawItem } from './types';

/**
 * 국가평생학습포털 "늘배움" - 무료/국비지원 강좌 공지
 * 목록: https://www.lifelongedu.go.kr (공지/강좌 안내 게시판 경로는 운영 시점에 확인 필요)
 * NOTE: 선택자는 실제 운영 환경에서 devtools로 1회 점검/조정이 필요합니다.
 *       K-MOOC(kmooc.kr) 등 다른 무료강좌 포털도 이 파일을 복제해서 추가할 수 있습니다.
 */
const config: BoardConfig = {
  sourceId: 'neulbaeum',
  sourceName: '국가평생학습포털(늘배움)',
  category: '무료강좌',
  listUrl: 'https://www.lifelongedu.go.kr/curation/notice/list.do',
  listItemSelector: 'table.tbl_list tbody tr, ul.list li',
  linkSelector: 'a',
  listDateSelector: '.date, td:nth-child(4)',
  detailTitleSelector: '.view_title, .board-view-title, h3.title',
  detailDateSelector: '.view_info .date, .board-view-info .date',
  detailBodySelector: '.view_content, .board-view-content, .cont_view',
  maxItems: 10,
  requestDelayMs: 1000,
};

export const neulbaeumCrawler: Crawler = {
  sourceId: config.sourceId,
  sourceName: config.sourceName,
  async crawl(): Promise<RawItem[]> {
    return crawlBoard(config);
  },
};
