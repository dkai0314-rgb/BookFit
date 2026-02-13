
// using global fetch

async function testRecommendation() {
    const url = 'http://localhost:3000/api/recommend';
    const body = {
        userRequest: '지친 마음을 달래줄 힐링 에세이',
        userEmotion: []
    };

    try {
        console.log('Sending request to:', url);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error('HTTP Error:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response Body:', text);
            return;
        }

        const data = await response.json();
        console.log('Response Items:', data.items?.length);
        if (data.items) {
            data.items.forEach((item, index) => {
                console.log(`[Book ${index + 1}] Title: ${item.title}`);
                console.log(`[Reason] ${item.reason}`);
                console.log('-----------------------------------');
            });
        } else {
            console.log('No items returned.', data);
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testRecommendation();
