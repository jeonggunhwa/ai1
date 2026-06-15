# 교육포커스 뉴스 자동화 백엔드 (edufocus-news-bot)

교육부/시도교육청 보도자료, 국가지원 무료강좌 정보를 수집하여
**사실기사 초안**과 **칼럼 초안**을 AI(Gemini)로 생성하고, 편집부 검수를 거쳐
승인/반려할 수 있는 백엔드입니다. (1단계: 초안 생성·저장·검수까지. 외부 CMS
발행 연동은 다음 단계에서 추가합니다.)

## 아키텍처

```
크롤러 (moe / sen / neulbaeum)
   → raw_items (원문, SQLite)
   → 사실 추출 (Gemini, JSON 구조화)
   → 기사 초안(news) / 칼럼 초안(column) 생성 (Gemini)
   → drafts (status: pending_review / approved / rejected)
   → 검수 화면 (웹 UI, /index.html)
```

## 법적·편집 안전장치 (중요)

보도자료 기반 자동생성 기사는 **표절·오보·명예훼손 리스크**가 있어
다음을 코드/프롬프트 단계에서 강제합니다.

1. **원문 복제 금지** – 보도자료 본문을 그대로 옮기지 않고, AI가 먼저
   `factExtractor`로 사실(누가/언제/무엇/비용/신청방법 등)만 구조화 추출한 뒤,
   그 사실만으로 새 문장을 작성합니다 (`src/ai/prompts.ts`의 `LEGAL_GUIDELINES`).
2. **출처 명시** – 모든 초안 하단에 원문 출처(기관명·날짜·원문 링크)가
   자동으로 추가됩니다 (`src/pipeline/sourceCitation.ts`).
3. **AI 생성 표시** – 모든 초안에 "AI가 작성한 초안이며 편집부 검수 후
   게재됩니다"라는 고지 문구(`ai_disclosure`)가 함께 저장됩니다.
4. **사실/의견 분리** – 기사(news)는 육하원칙 스트레이트 기사로, 칼럼(column)은
   완곡한 해설 톤으로 분리 생성하며, 칼럼 프롬프트는 단정적 비판·명예훼손성
   표현을 금지합니다.
5. **사람 검수 필수** – 모든 초안은 `pending_review` 상태로 생성되며,
   `/index.html` 검수 화면에서 편집자가 승인(`approved`)하기 전까지는
   발행 대상이 아닙니다. (자동 발행 연동은 의도적으로 아직 구현하지 않음)

> ⚠️ 이 시스템은 "초안 생성 도구"입니다. 최종 게재 책임은 편집부(사람)에게
> 있으며, 특히 칼럼/의견성 콘텐츠는 반드시 검토 후 수정·발행하세요.

## 설치 및 실행

```bash
npm install
cp .env.example .env
# .env에 GEMINI_API_KEY 입력 (https://aistudio.google.com)
```

### 1. 크롤링 (보도자료 → DB 저장)

```bash
npm run crawl
```

### 2. 초안 생성 (사실 추출 + 기사/칼럼 작성, Gemini 호출)

```bash
npm run generate
```

### 3. 검수 서버 실행

```bash
npm run build && npm start
# 또는 개발 모드: npm run dev
```

브라우저에서 `http://localhost:4000/index.html` 접속 → 검수 대기 목록에서
초안을 확인하고 승인/반려.

### 4. 스케줄러 (주기적 자동 수집+생성)

```bash
npm run scheduler
```

`.env`의 `CRAWL_CRON`(기본: 매일 06/12/18시)에 따라 크롤링 → 생성을 반복합니다.
생성된 초안은 여전히 `pending_review` 상태이므로, 편집자가 매번 검수 화면에서
확인해야 합니다.

### 네트워크 없이 파이프라인 점검 (목 데이터)

```bash
ENABLE_MOCK_SOURCE=1 npm run crawl
ENABLE_MOCK_SOURCE=1 MOCK_AI=1 npm run generate   # Gemini 호출 없이 샘플 기사/칼럼 생성
npm test   # AI 호출 없이 동작하는 스모크 테스트
```

`MOCK_AI=1`을 설정하면 `GEMINI_API_KEY` 없이도 `fixtures/sample-drafts.json`에 미리
작성된 사실추출·기사·칼럼 결과를 사용해 전체 파이프라인(수집 → 생성 → 검수대기)을
끝까지 확인할 수 있습니다. 실제 운영에서는 설정하지 마세요.

## 크롤링 대상 (1차)

- 교육부 보도자료 (`src/crawlers/moe.ts`)
- 서울시교육청 보도자료 (`src/crawlers/sen.ts`)
- 국가평생학습포털 늘배움 무료강좌 공지 (`src/crawlers/neulbaeum.ts`)

각 크롤러의 CSS 선택자는 실제 사이트 구조에 맞춰 점검이 필요합니다.
자세한 내용은 [`SELECTORS.md`](./SELECTORS.md)를 참고하세요. 새로운
시도교육청이나 K-MOOC 등 다른 무료강좌 포털을 추가할 때도 같은 방식으로
크롤러 파일을 복제해서 추가할 수 있습니다.

## API

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/raw-items` | 수집된 원문 목록 |
| GET | `/api/drafts?status=pending_review` | 초안 목록 (상태 필터) |
| GET | `/api/drafts/:id` | 초안 상세 |
| POST | `/api/drafts/:id/approve` | 초안 승인 |
| POST | `/api/drafts/:id/reject` | 초안 반려 |
| POST | `/api/crawl` | 수동 크롤링 실행 |
| POST | `/api/generate` | 수동 초안 생성 실행 |

## 다음 단계 (미구현)

- 승인된 초안을 자체 사이트/CMS/워드프레스 등에 자동 게시하는 연동
- 표절 검사 / 유사문장 검사 도구 연동
- 다중 시도교육청·다중 무료강좌 포털 확장
