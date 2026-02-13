
import fetch from 'node-fetch';

async function testRecommend() {
    try {
        const response = await fetch('http://localhost:3000/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userRequest: "뇌과학에 대해서 알고 싶어요. 쉽고 잘 읽히는 뇌과학에 입문하기 좋은 책을 추천해주세요",
                userEmotion: ["happy", "calm"]
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testRecommend();
