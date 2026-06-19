import { crawlBoard, BoardConfig } from './genericBoard';
import { Crawler, RawItem } from './types';

/**
 * 교육부 보도자료 게시판
 * 목록: https://www.moe.go.kr/boardCnts/listRenew.do?boardID=294&m=020402
 * NOTE: 선택자는 실제 운영 환경에서 devtools로 1회 점검/조정이 필요합니다.
 *       (정부 사이트는 게시판 스킨이 주기적으로 바뀝니다.) SELECTORS.md 참고.
 */
const config: BoardConfig = {
  sourceId: 'moe',
  sourceName: '교육부',
  category: '보도자료',
  listUrl: 'https://www.moe.go.kr/boardCnts/listRenew.do?boardID=294&m=020402&s=moe',
  listItemSelector: 'table.board_list tbody tr',
  linkSelector: 'a',
  listDateSelector: 'td.date, td:nth-child(5)',
  detailTitleSelector: '.board_view .title, .view_title, h2.title',
  detailDateSelector: '.board_view .date, .view_info .date',
  detailBodySelector: '.board_view .view_cont, .view_con, .bbs_content',
  maxItems: 10,
  requestDelayMs: 1000,
};

export const moeCrawler: Crawler = {
  sourceId: config.sourceId,
  sourceName: config.sourceName,
  async crawl(): Promise<RawItem[]> {
    return crawlBoard(config);
  },
};
