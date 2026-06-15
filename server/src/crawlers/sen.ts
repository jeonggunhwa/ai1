import { crawlBoard, BoardConfig } from './genericBoard';
import { Crawler, RawItem } from './types';

/**
 * 서울시교육청 보도자료 게시판
 * 목록: https://www.sen.go.kr/ (보도자료 게시판 경로는 운영 시점에 확인 필요)
 * NOTE: 선택자는 실제 운영 환경에서 devtools로 1회 점검/조정이 필요합니다.
 *       SELECTORS.md 참고. 다른 시도교육청을 추가할 때도 이 파일을 복제해서
 *       sourceId/listUrl/선택자만 바꾸면 됩니다.
 */
const config: BoardConfig = {
  sourceId: 'sen',
  sourceName: '서울시교육청',
  category: '보도자료',
  listUrl: 'https://www.sen.go.kr/web/services/bbs/bbsList.action?bbsBean.bbsCd=81',
  listItemSelector: 'table.bbs_list tbody tr, ul.board-list li',
  linkSelector: 'a',
  listDateSelector: '.date, td:nth-child(4)',
  detailTitleSelector: '.bbs_view_title, .view-title, h3.title',
  detailDateSelector: '.bbs_view_info .date, .view-info .date',
  detailBodySelector: '.bbs_view_content, .view-content, .bbsV_cont',
  maxItems: 10,
  requestDelayMs: 1000,
};

export const senCrawler: Crawler = {
  sourceId: config.sourceId,
  sourceName: config.sourceName,
  async crawl(): Promise<RawItem[]> {
    return crawlBoard(config);
  },
};
