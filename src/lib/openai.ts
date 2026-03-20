import OpenAI from 'openai';
import { BookMeta } from './book-apis';

const openai = new OpenAI({
    apiKey: process.env.OPENAPI_KEY || process.env.OPENAI_API_KEY || '',
});

export async function generateBookFitLetter(book: BookMeta): Promise<string> {
    const prompt = `
당신은 독자들에게 깊은 통찰력과 몰입감을 주는 책 추천 뉴스레터 "북핏레터(BookFit Letter)"를 작성하는 수석 에디터입니다.
아래에 제공된 도서의 메타데이터(설명 포함)를 바탕으로 친근하면서도 전문적인 톤(예: "~해요", "~입니다")으로 마크다운 형식의 레터 초안을 작성해주세요.

[도서 메타데이터]
- 제목: ${book.title}
- 저자: ${book.authors.join(', ')}
- 출판사: ${book.publisher}
- 카테고리: ${book.categories.join(', ')}
- 출처데이터: ${book.sourceText || '(설명 없음)'}

[작성 가이드(필수 규칙)]
1. 제목은 "# [후킹하는 문구] - {도서명}" 형식으로 작성하세요.
2. 아래와 같은 구조(Heading 2)를 반드시 포함하세요:
   - 도입부 (책의 테마, 문제의식, 도입 질문 등)
   - ## 왜 이 책을 읽어야 할까요?
   - ## 이런 분들에게 강력 추천해요! (불릿 포인트 3~4개)
   - ## 북핏 핵심 요약 (책의 주요 메시지 정리)
3. 마비말 (아주 짧은 맺음말과 함께 독서를 권장하는 인삿말)
4. 없는 사실(허위 정보)을 지어내지 마세요. 주어진 정보(특히 설명)에 기반해 전개하되, 정보가 부족하다면 카테고리와 제목에서 예상되는 일반적인 기대 효과에 집중하세요.
5. 가독성을 위해 마크다운(볼드체, 인용구 \`>\`, 리스트 등)을 시각적으로 예쁘게 활용하세요.
  `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // 빠르고 가벼운 모델 우선 사용
            messages: [
                { role: 'system', content: '당신은 책을 사랑하고 독자들에게 영감을 주는 최고의 콘텐츠 크리에이터입니다.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        return response.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('OpenAI generation error:', error);
        throw new Error('북핏레터 텍스트 생성 중 오류가 발생했습니다.');
    }
}
