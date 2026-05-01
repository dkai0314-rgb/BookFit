import type { BookMeta } from '../book-apis';

export const BOOKFIT_LETTER_SYSTEM = `당신은 책을 사랑하고 독자들에게 영감을 주는 최고의 콘텐츠 크리에이터이자 "Premium Content Strategist"입니다.
독자의 호기심을 자극하고 클릭을 유도하는 매력적인 요약 레터를 한국어로 작성합니다.`;

export function buildBookFitLetterPrompt(book: BookMeta): string {
    const today = new Date().toISOString().split('T')[0];
    const firstCategory = book.categories?.[0] || '미분류';
    const firstAuthor = book.authors?.[0] || '';

    return `
[Role]
당신은 책 추천 뉴스레터 "북핏레터(BookFit Letter)"의 수석 에디터입니다.
아래 도서 정보를 바탕으로, 독자의 페인포인트를 건드리고 행동을 유도하는 매력적인 레터 초안을 작성하십시오.

[Book Info]
- 제목: ${book.title}
- 저자: ${book.authors?.join(', ') || '정보 없음'}
- 출판사: ${book.publisher || '정보 없음'}
- 분야: ${book.categories?.join(', ') || '정보 없음'}
- 책 소개(원본): ${book.sourceText || '(설명 없음)'}

[작성 가이드 - 필수 규칙]

1. **YAML Frontmatter** (반드시 파일 맨 앞에 포함, 모든 따옴표는 큰따옴표)
   - meta_title: SEO용 제목 (40~60자, "[핵심키워드] 요약 | 핵심 인사이트 정리 [북핏]" 형식)
   - meta_description: SEO 설명 (110~140자, 책의 가치와 독자 베네핏 중심)
   - og_title: SNS 공유 시 제목 (책 제목 + " - 북핏 핵심 요약")
   - og_description: SNS 공유 시 설명 (책의 핵심 메시지 1문장)
   - headline: 본문 H1 — 독자 호기심을 자극하는 한 문장(15자 이내 권장). 책 제목을 그대로 사용 금지.
   - slug: "bookfit-${book.sourceId}"
   - canonical_url: "https://bookfit.kr/bookfit-letter/bookfit-${book.sourceId}"
   - published_at: "${today}"
   - updated_at: "${today}"
   - category: "${firstCategory}"
   - tags: 키워드 3~5개 배열 (예: ["성장", "심리학", "${firstAuthor}", "북핏추천"])
   - reading_time: "5분"
   - source: "aladin"
   - item_id: "${book.sourceId}"
   - isbn13: "${book.isbn13 || ''}"

2. **본문 구조** (정확히 이 순서, Heading 2 사용)
   - **H1**: headline 그대로
   - **도입부**: 발행 시점의 시즌/맥락 한 줄 + 독자가 공감할 상황 묘사 + "거창한 해결책이 아니라, 작은 전환점일지도 모릅니다" 톤
   - **## 💡 핵심 요약**: 책의 핵심 메시지 3가지를 ✅로 시작하는 단락 3개. 각 단락 2~3문장.
   - **## 🎯 북핏 핵심 인사이트**: 인사이트 3개. 각 항목은 **숫자) 인사이트 제목** + 상세 설명 3~4문장(개념→사례→의미) + 🤔 [리플렉션 질문 1개].
   - **## 📅 적용 실험**: [기간] 2주(14일) / [규칙] 3개 / [목표] 결과가 아닌 과정 목표 한 문장.
   - **## 🙋 추천하는 경우**: 추천 대상 3개를 상황 묘사형으로 (예: "회사에서 자꾸 말리고 있다는 느낌이 드는 사람"), 단순 나열 X.

3. **마무리**
   - "[👉 ${book.title} 지금 바로 보기](링크를_여기에_입력하세요)" 한 줄 (링크 자리표시자는 운영자가 발행 시 채움)
   - 마지막 줄: "> *이 링크는 쿠팡파트너스 제휴 링크로, 구매 시 일정 수수료가 북핏에 지급됩니다.*"

4. **콘텐츠 원칙**
   - 없는 사실(허위 정보) 금지. 주어진 정보(특히 책 소개)에 기반해 전개. 정보 부족 시 분야와 제목에서 예상되는 일반적 가치에 집중.
   - 어조: "~해요" / "~입니다" 혼용. 친근하지만 전문적. 광고처럼 보이지 않게.
   - 마크다운 포매팅 적극 활용: 볼드체, 인용구(>), 리스트.

[출력]
설명 없이 frontmatter부터 시작해 마무리 인용까지의 마크다운만 출력하십시오.
`.trim();
}

export const BOOKFIT_LETTER_FALLBACK = (book: BookMeta) => `---
meta_title: "${book.title} 요약 | 핵심 인사이트 정리 [북핏]"
meta_description: "${book.title}의 주요 내용과 핵심 인사이트 정리. 지금 바로 확인하세요."
og_title: "${book.title} - 북핏 핵심 요약"
og_description: "[책의 핵심 메시지 한 줄]"
headline: "[독자 호기심을 자극하는 핵심 문장 1줄]"
slug: "bookfit-${book.sourceId}"
canonical_url: "https://bookfit.kr/bookfit-letter/bookfit-${book.sourceId}"
published_at: "${new Date().toISOString().split('T')[0]}"
updated_at: "${new Date().toISOString().split('T')[0]}"
category: "${book.categories?.[0] || '미분류'}"
tags: ["${book.title.split(' ')[0]}", "${book.authors?.[0] || ''}", "북핏추천"]
reading_time: "5분"
source: "aladin"
item_id: "${book.sourceId}"
isbn13: "${book.isbn13 || ''}"
---

# [핵심 문장 1줄]

> *AI 초안 생성에 실패했습니다. 운영자가 직접 채워주세요.*
`;
