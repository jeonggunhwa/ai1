import 'dotenv/config';

/**
 * edu-focus.com 자체 API로 글을 발행하기 위한 설정.
 * API 스펙이 아직 확정되지 않았으므로, 엔드포인트/인증/필드명을 모두
 * 환경변수로 구성할 수 있게 만들어두었다. 실제 API가 정해지면 .env만
 * 채우면 코드 수정 없이 연동된다.
 */
export interface PublisherConfig {
  /** 글 작성 API의 전체 URL (예: https://www.edu-focus.com/api/posts) */
  apiUrl: string;
  /** 인증 헤더 이름 (기본: Authorization) */
  authHeader: string;
  /** 인증 헤더 값. 비어있으면 인증 헤더를 보내지 않음 */
  authValue: string;
  /** 요청 바디에서 제목 필드명 */
  fieldTitle: string;
  /** 요청 바디에서 본문 필드명 */
  fieldBody: string;
  /** 요청 바디에서 카테고리/타입 필드명 */
  fieldCategory: string;
  /** news 초안에 사용할 카테고리 값 */
  categoryNews: string;
  /** column 초안에 사용할 카테고리 값 */
  categoryColumn: string;
  /** 요청 바디에 추가로 합칠 고정 필드 (JSON 문자열, 예: {"status":"draft"}) */
  extraFieldsJson: string;
  /** 응답에서 게시글 URL을 읽어올 필드 경로 (점 표기, 예: data.url) */
  responseUrlField: string;
  /** true면 실제 호출 없이 페이로드만 로그로 출력 */
  dryRun: boolean;
}

export function getPublisherConfig(): PublisherConfig {
  return {
    apiUrl: process.env.PUBLISH_API_URL || '',
    authHeader: process.env.PUBLISH_AUTH_HEADER || 'Authorization',
    authValue: process.env.PUBLISH_AUTH_VALUE || '',
    fieldTitle: process.env.PUBLISH_FIELD_TITLE || 'title',
    fieldBody: process.env.PUBLISH_FIELD_BODY || 'content',
    fieldCategory: process.env.PUBLISH_FIELD_CATEGORY || 'category',
    categoryNews: process.env.PUBLISH_CATEGORY_NEWS || '기사',
    categoryColumn: process.env.PUBLISH_CATEGORY_COLUMN || '칼럼',
    extraFieldsJson: process.env.PUBLISH_EXTRA_FIELDS_JSON || '{}',
    responseUrlField: process.env.PUBLISH_RESPONSE_URL_FIELD || 'url',
    dryRun: process.env.PUBLISH_DRY_RUN === '1',
  };
}
