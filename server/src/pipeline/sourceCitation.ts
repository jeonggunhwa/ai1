import { config } from '../config';
import { RawItemRow } from '../db';

export const AI_DISCLOSURE = `이 글은 ${config.mediaName}이(가) AI(${config.geminiModel})를 활용해 작성한 초안이며, 편집부 검수 후 게재됩니다.`;

export function buildSourceCitation(raw: RawItemRow): string {
  const dateLabel = raw.published_at ? `, ${raw.published_at}` : '';
  return `※ 이 글은 ${raw.source_name}의 ${raw.category ?? '발표'} 자료(${raw.title}${dateLabel})를 바탕으로 작성되었습니다. 원문: ${raw.url}`;
}

export function sourceLabel(raw: RawItemRow): string {
  return raw.source_name;
}
