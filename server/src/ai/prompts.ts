/**
 * 모든 생성 프롬프트가 공유하는 법적/편집 가이드라인.
 *
 * 목적: 보도자료를 그대로 베끼지 않고(저작권/표절 리스크),
 * 사실과 의견을 분리하며(명예훼손 리스크), 출처를 명확히 밝히고
 * (오보 책임 완화), AI 생성물임을 인지할 수 있도록(자율심의 가이드라인) 한다.
 */
export const LEGAL_GUIDELINES = `
[작성 원칙 - 반드시 준수]
1. 입력된 원문(보도자료)의 문장을 그대로 복사하지 말 것. 사실만 추출하여 새로운 문장으로 재구성할 것.
2. 확인되지 않은 사실을 추가하거나 추측하지 말 것. 입력된 정보에 없는 내용은 작성하지 말 것.
3. 특정 인물·기관에 대한 비판, 단정적 평가, 명예를 훼손할 수 있는 표현을 사용하지 말 것.
4. 숫자(지원 인원, 예산, 기간, 비용 등)는 원문과 동일하게 정확히 표기할 것.
5. 신청 방법, 신청 기간, 대상, 비용(무료/국비지원 여부) 등 독자에게 실질적으로 중요한 정보를 빠뜨리지 말 것.
6. 과장된 광고성 표현(예: "꼭", "무조건", "최고의 기회") 대신 사실 위주의 중립적 어조를 사용할 것.
`;

export interface ExtractedFacts {
  agency: string;
  headline: string;
  summary: string;
  who: string;
  what: string;
  when: string;
  where: string;
  why: string;
  how: string;
  targetAudience: string;
  applicationPeriod: string;
  cost: string;
  applyMethod: string;
  contact: string;
  keyNumbers: string[];
  cautions: string[];
}

export function buildFactExtractionPrompt(title: string, bodyText: string): string {
  return `다음은 교육 관련 보도자료/공지 원문이다. 이 글에서 사실 정보만 구조화하여 JSON으로 추출하라.
${LEGAL_GUIDELINES}
추측하지 말고, 원문에 명시된 내용만 채워라. 해당 정보가 원문에 없으면 빈 문자열("") 또는 빈 배열([])로 두어라.

[원문 제목]
${title}

[원문 본문]
${bodyText}

다음 JSON 스키마로만 응답하라 (설명 문장 없이 JSON만):
{
  "agency": "발표 기관명",
  "headline": "핵심 사실 한 문장 요약",
  "summary": "2~3문장 요약",
  "who": "대상 기관/인물",
  "what": "무엇을 하는지",
  "when": "시행/시작 시점",
  "where": "장소/지역/플랫폼",
  "why": "목적/배경",
  "how": "운영 방식",
  "targetAudience": "참가/신청 대상",
  "applicationPeriod": "신청 기간",
  "cost": "비용 (무료/국비지원 여부 포함)",
  "applyMethod": "신청 방법/경로",
  "contact": "문의처 (있으면)",
  "keyNumbers": ["기사에서 강조할 핵심 수치들"],
  "cautions": ["독자가 주의해야 할 사항 (예: 출석률 미달 시 환수 등, 있으면)"]
}`;
}

export interface GeneratedArticle {
  title: string;
  body: string;
}

export function buildNewsArticlePrompt(facts: ExtractedFacts, sourceLabel: string): string {
  return `너는 교육 전문 신문 "교육포커스"의 기자다. 아래 구조화된 사실 정보를 바탕으로
육하원칙(5W1H)에 따른 스트레이트 뉴스 기사를 작성하라.
${LEGAL_GUIDELINES}
[추가 지침]
- 첫 문장(리드)에 핵심 사실(누가, 무엇을, 언제부터, 비용)을 압축하여 제시할 것.
- 본문 중 최소 1회 "${sourceLabel}에 따르면" 또는 "${sourceLabel}는 OO일 밝혔다" 형식으로 정보의 출처를 명시할 것.
- 분량은 400~600자 내외.
- 제목은 20~35자 내외로, 핵심 사실(대상+혜택+무료/국비지원 여부)이 드러나게 작성할 것.
- 결과는 마크다운 본문 텍스트로 작성하되, 표나 이미지는 사용하지 말 것.

[구조화된 사실 정보]
${JSON.stringify(facts, null, 2)}

다음 JSON 스키마로만 응답하라 (설명 문장 없이 JSON만):
{
  "title": "기사 제목",
  "body": "기사 본문 (마크다운)"
}`;
}

export function buildColumnPrompt(facts: ExtractedFacts, sourceLabel: string): string {
  return `너는 교육 전문 신문 "교육포커스"의 칼럼니스트다. 아래 구조화된 사실 정보를 바탕으로
독자(학부모/직장인/학생)에게 이 정책·강좌가 어떤 의미가 있는지 해설하는 칼럼 초안을 작성하라.
${LEGAL_GUIDELINES}
[추가 지침 - 칼럼]
- 이 글은 의견·해설 성격임을 유지할 것. 사실 보도가 아니라 "왜 주목해야 하는지", "어떻게 활용하면 좋은지"를
  설명하는 톤으로 작성하라.
- 단정적 비판이나 정책 효과에 대한 확정적 평가("이 정책은 실패할 것이다" 등)는 금지. 대신
  "~라는 점에서 활용 가치가 있다", "~를 고려해볼 만하다", "전문가들은 ~라고 조언한다" 같은
  완곡하고 검증 가능한 어조를 사용할 것.
- 사실 정보(대상, 기간, 비용, 신청 방법)는 정확히 인용하고, 정보의 출처로 "${sourceLabel}"를 명시할 것.
- 분량은 500~700자 내외.
- 제목은 칼럼 톤(예: "~를 주목해야 하는 이유")으로 20~35자 내외.
- 결과는 마크다운 본문 텍스트로 작성하되, 표나 이미지는 사용하지 말 것.
- 이 글은 발행 전 반드시 데스크(편집자)의 검수를 거친다는 점을 전제로 작성하라(검수 문구를 본문에
  직접 쓰지는 말 것 — 시스템이 별도로 표시한다).

[구조화된 사실 정보]
${JSON.stringify(facts, null, 2)}

다음 JSON 스키마로만 응답하라 (설명 문장 없이 JSON만):
{
  "title": "칼럼 제목",
  "body": "칼럼 본문 (마크다운)"
}`;
}
