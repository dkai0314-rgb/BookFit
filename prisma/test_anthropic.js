/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @deprecated 파일명은 그대로 두고 내용만 Anthropic 스모크 테스트로 교체.
 * 안전하게 prisma/test_anthropic.js 로 rename 가능.
 *
 * 실행: node prisma/test_gemini.js
 */
const Anthropic = require('@anthropic-ai/sdk').default;
require('dotenv').config({ path: '.env.local' });

const key = process.env.ANTHROPIC_API_KEY;
console.log(`Testing with key: ${key ? key.substring(0, 8) + '...' : 'UNDEFINED'}`);

if (!key) {
    console.error("❌ ANTHROPIC_API_KEY 가 .env.local 에 없습니다.");
    process.exit(1);
}

const client = new Anthropic({ apiKey: key });

async function main() {
    try {
        console.log("Attempting `claude-haiku-4-5` generation...");
        const response = await client.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 64,
            messages: [{ role: 'user', content: 'Hello?' }]
        });
        const textBlock = response.content.find(b => b.type === 'text');
        console.log("✅ Success with claude-haiku-4-5:", textBlock ? textBlock.text : '(no text)');
    } catch (e) {
        console.error("❌ Failed with claude-haiku-4-5:", e.message);
    }
}

main();
