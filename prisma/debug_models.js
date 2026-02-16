/* eslint-disable @typescript-eslint/no-require-imports */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const key = process.env.GEMINI_API_KEY;

if (!key) {
    console.error("No API KEY found");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log(`Querying: ${url.replace(key, 'KEY')}`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error);
            } else {
                console.log("Available Models:");
                if (json.models) {
                    json.models.forEach(m => {
                        console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                    });
                } else {
                    console.log("No models found?", json);
                }
            }
        } catch (e) {
            console.error("Parse Error:", e.message);
            console.log("Raw Data:", data);
        }
    });

}).on('error', (err) => {
    console.error("Request Error:", err.message);
});
