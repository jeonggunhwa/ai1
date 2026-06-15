import axios from 'axios';
import { DraftRow } from '../db';
import { getPublisherConfig } from './config';

export interface PublishResult {
  publishedUrl: string | null;
  raw?: unknown;
}

/** Reads a nested field from an object using dot notation, e.g. "data.url". */
function readPath(obj: unknown, dotted: string): unknown {
  return dotted
    .split('.')
    .filter(Boolean)
    .reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
}

/**
 * 승인된 초안을 edu-focus.com의 글 작성 API로 전송한다.
 * API 엔드포인트/인증/필드명은 모두 .env (PUBLISH_*)로 설정한다.
 * PUBLISH_API_URL이 비어있거나 PUBLISH_DRY_RUN=1이면 실제 호출 없이
 * 페이로드만 로그로 남기고 성공으로 처리한다 (연동 전 점검용).
 */
export async function publishDraft(draft: DraftRow): Promise<PublishResult> {
  const cfg = getPublisherConfig();

  const category = draft.draft_type === 'news' ? cfg.categoryNews : cfg.categoryColumn;
  let extraFields: Record<string, unknown> = {};
  try {
    extraFields = JSON.parse(cfg.extraFieldsJson);
  } catch {
    console.warn('[publish] PUBLISH_EXTRA_FIELDS_JSON이 유효한 JSON이 아닙니다. 무시합니다.');
  }

  const payload: Record<string, unknown> = {
    [cfg.fieldTitle]: draft.title,
    [cfg.fieldBody]: draft.body_markdown,
    [cfg.fieldCategory]: category,
    ...extraFields,
  };

  if (!cfg.apiUrl || cfg.dryRun) {
    console.log(
      `[publish] DRY RUN (PUBLISH_API_URL 미설정 또는 PUBLISH_DRY_RUN=1) - draft #${draft.id} 페이로드:\n${JSON.stringify(payload, null, 2)}`
    );
    return { publishedUrl: null };
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cfg.authValue) headers[cfg.authHeader] = cfg.authValue;

  const res = await axios.post(cfg.apiUrl, payload, { headers, timeout: 15000 });
  const publishedUrl = readPath(res.data, cfg.responseUrlField);

  return {
    publishedUrl: typeof publishedUrl === 'string' ? publishedUrl : null,
    raw: res.data,
  };
}
