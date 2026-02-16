
/* eslint-disable @typescript-eslint/no-require-imports */
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

// Explicitly use the key we have to debug
const key = process.env.GEMINI_API_KEY;
console.log(`Testing with key: ${key ? key.substring(0, 5) + '...' : 'UNDEFINED'}`);

const genAI = new GoogleGenerativeAI(key);

async function main() {
    try {
        // Method 1: Try to list models (if specific model fails, maybe we can see what IS available)
        // Note: The SDK doesn't expose listModels directly on the main class easily in all versions, 
        // but let's try a simple generation with a fallback model "gemini-pro" again just to be sure.

        console.log("Attempting `gemini-1.5-flash` generation...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        console.log("Success with gemini-1.5-flash: ", result.response.text());

    } catch (e) {
        console.error("Failed with gemini-1.5-flash:", e.message);

        try {
            console.log("Attempting `gemini-pro` generation...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Hello?");
            console.log("Success with gemini-pro: ", result2.response.text());
        } catch (e2) {
            console.error("Failed with gemini-pro:", e2.message);
        }
    }
}

main();
