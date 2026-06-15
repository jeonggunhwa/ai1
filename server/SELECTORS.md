# 크롤러 CSS 선택자 점검 가이드

정부/공공 포털 게시판은 스킨 개편이 잦아 `src/crawlers/moe.ts`, `src/crawlers/sen.ts`,
`src/crawlers/neulbaeum.ts`에 작성된 선택자는 **운영 시작 전 1회 점검·조정이 필요**합니다.

## 점검 방법

1. 대상 게시판 목록 페이지를 크롬에서 열고 개발자도구(F12) → Elements 탭을 연다.
2. 게시물 목록에서 한 행(row)을 선택(우클릭 → 검사)하여 반복되는 컨테이너의
   CSS 선택자를 확인한다 → `listItemSelector`
3. 해당 행 안의 제목 링크(`<a>`)를 확인 → `linkSelector` (보통 `a`로 충분)
4. 게시물 상세 페이지를 열어 제목, 날짜, 본문 영역의 클래스명을 확인하여
   `detailTitleSelector`, `detailDateSelector`, `detailBodySelector`에 반영한다.
5. `genericBoard.ts`는 여러 후보 선택자를 콤마로 나열하면 cheerio가 첫 매칭 요소를
   사용하므로, 구조가 페이지마다 조금씩 달라도 `"a.title, h2.title, .view_title"`처럼
   여러 후보를 넣어두면 안전하다.

## 새 출처 추가하기

1. `src/crawlers/` 에 새 파일을 만들고 `sen.ts`를 복제한다.
2. `sourceId`, `sourceName`, `category`, `listUrl`, 선택자들을 새 사이트에 맞게 수정한다.
3. `src/crawlers/index.ts`의 `crawlers` 배열에 추가한다.

## 정책/예의 (politeness)

- `maxItems`로 한 번에 가져오는 상세 페이지 수를 제한한다 (기본 10).
- `requestDelayMs`로 상세 페이지 요청 간 지연을 둔다 (기본 1000ms).
- 각 사이트의 `robots.txt`와 이용약관을 확인하고, 과도한 요청으로 서버에 부담을
  주지 않도록 한다.

## 동작 점검 (네트워크 없이)

`ENABLE_MOCK_SOURCE=1` 환경변수를 설정하면 `fixtures/sample-items.json`의 샘플
보도자료 3건을 사용하는 목 크롤러가 활성화됩니다. 실제 사이트 접속 없이
수집 → 사실추출 → 기사/칼럼 생성 파이프라인을 점검할 때 사용하세요.

```bash
ENABLE_MOCK_SOURCE=1 npm run crawl
ENABLE_MOCK_SOURCE=1 MOCK_AI=1 npm run generate   # GEMINI_API_KEY 불필요
```
