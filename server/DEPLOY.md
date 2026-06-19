# 외부 서버 배포 가이드 (Render / Railway)

이 서비스는 SQLite 파일(`data/edufocus.db`)에 데이터를 저장하고, 검수 화면을
HTTP로 제공하면서 주기적으로 크론(cron)도 돌려야 합니다. 그래서 **서버리스
플랫폼(Netlify/Vercel 등)은 맞지 않고**, 디스크가 영구히 유지되고 프로세스가
계속 떠 있는 플랫폼(Render, Railway, Fly.io, VPS)이 필요합니다.

> ⚠️ 웹 서버와 스케줄러를 별도 서비스(프로세스)로 분리하면 안 됩니다.
> 두 서비스가 디스크를 공유하지 못하는 플랫폼(Render 등)에서는 SQLite
> 파일이 두 개로 갈라져 데이터가 어긋납니다. 그래서 `ENABLE_SCHEDULER=1`
> 환경변수로 **하나의 서비스 프로세스 안에서** 웹 서버 + 크론 스케줄러를
> 함께 실행하도록 구성했습니다 (`src/server/app.ts`).

## 공통: 배포 전 체크리스트

```bash
npm run build   # 타입 에러 없이 빌드되는지 확인
npm test        # 모킹 기반 스모크 테스트 통과 확인
```

필요한 환경변수:

| 변수 | 설명 |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API 키 (필수) |
| `DB_PATH` | SQLite 파일 경로 (영구 디스크 안의 경로로 지정) |
| `PORT` | 플랫폼이 자동 주입하는 경우 비워둬도 됨 |
| `ADMIN_USER` / `ADMIN_PASSWORD` | 검수 화면 Basic Auth (외부 배포 시 반드시 설정) |
| `ENABLE_SCHEDULER` | `1`로 설정하면 같은 프로세스에서 주기적 수집+생성도 실행 |
| `CRAWL_CRON` | 크롤링 주기 (기본 매일 06/12/18시) |
| `PUBLISH_*` | edu-focus.com 발행 연동 설정 (API 준비 전엔 비워둬서 dry-run 유지) |

## Render로 배포

1. Render 대시보드 → New → **Blueprint** → 이 저장소 선택
   (`server` 디렉터리가 리포지토리 루트가 아니면 Root Directory를 `server`로 지정)
2. 저장소 루트(`server/`)의 [`render.yaml`](./render.yaml)이 자동으로 읽혀
   `edufocus-web` 서비스 1개 + 1GB 영구 디스크(`/app/data`)가 생성됩니다.
3. 대시보드에서 `sync: false`로 표시된 환경변수를 직접 입력합니다:
   `GEMINI_API_KEY`, `ADMIN_USER`, `ADMIN_PASSWORD`, `PUBLISH_API_URL`,
   `PUBLISH_AUTH_VALUE` 등.
4. 배포가 끝나면 Render가 제공하는 URL(`https://edufocus-web.onrender.com`)로
   접속해 `/index.html`에서 Basic Auth 로그인 후 검수 화면을 확인합니다.
5. `/healthz`가 200을 반환하면 정상입니다.

## Railway로 배포

Railway는 `railway.json`으로 빌드/시작 명령을, 대시보드에서 **Volume**으로
영구 디스크를 설정합니다.

1. Railway 대시보드 → New Project → Deploy from GitHub repo → 이 저장소 선택
   (모노레포라면 Root Directory를 `server`로 지정)
2. 저장소의 [`railway.json`](./railway.json)이 빌드/시작 명령과
   헬스체크(`/healthz`)를 자동 설정합니다.
3. 프로젝트 → 서비스 → **Volumes** 탭에서 볼륨을 추가하고 마운트 경로를
   `/app/data`로 지정합니다.
4. 서비스 → **Variables** 탭에서 환경변수를 입력합니다:
   - `DB_PATH=/app/data/edufocus.db`
   - `ENABLE_SCHEDULER=1`
   - `GEMINI_API_KEY`, `ADMIN_USER`, `ADMIN_PASSWORD`
   - 필요 시 `PUBLISH_*` 값들
5. 배포 후 Railway가 발급하는 도메인으로 접속해 `/healthz`와
   `/index.html`을 확인합니다.

## 배포 후 운영 흐름

1. `ENABLE_SCHEDULER=1`이면 `CRAWL_CRON` 주기마다 자동으로 크롤링 →
   초안 생성이 실행되어 `pending_review` 상태로 쌓입니다.
2. 편집자가 `/index.html`(Basic Auth 필요)에 접속해 초안을 검수하고
   승인/반려합니다.
3. 승인된 글은 화면의 "🚀 edu-focus.com에 발행" 버튼으로 발행합니다.
   `PUBLISH_API_URL`이 비어있으면 실제 전송 없이 로그에만 페이로드가
   출력됩니다(dry-run) — API 스펙이 확정되면 `PUBLISH_*` 값만 채워서
   코드 수정 없이 실제 발행으로 전환할 수 있습니다.

## 도메인/HTTPS

Render와 Railway는 기본 서브도메인에 HTTPS를 자동 적용합니다. 자체
도메인(예: `admin.edu-focus.com`)을 연결하려면 각 플랫폼의 "Custom Domain"
설정에서 DNS(CNAME) 레코드를 추가하세요.
