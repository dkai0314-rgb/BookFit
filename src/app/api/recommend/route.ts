
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Define interfaces for type safety
interface GoogleBookItem {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        imageLinks?: {
            thumbnail?: string;
        };
        industryIdentifiers?: {
            type: string;
            identifier: string;
        }[];
        publisher?: string;
        publishedDate?: string;
        pageCount?: number;
        categories?: string[];
    };
}

interface Book {
    id: string;
    title: string;
    authors: string[];
    description: string;
    thumbnail: string;
    isbn: string;
    reason?: string; // AI generated reason
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const { userRequest, userEmotion } = await request.json();

        // 1. Intent Analysis using Gemini
        // Using 1.5-flash for faster keyword extraction
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const intentPrompt = `
            Analyze the user's request: "${userRequest}"
            And their current emotion: "${userEmotion ? userEmotion.join(', ') : 'Neutral'}"
            
            Extract 3-5 key search keywords for finding relevant books in a bookstore.
            Keywords should be in Korean or English.
            Focus on the topic, genre, or vibe.
            
            Output ONLY a comma-separated list of keywords.
            Example: 힐링, 에세이, 심리학
        `;

        let query = userRequest; // Default fallback
        try {
            const intentResult = await model.generateContent(intentPrompt);
            const intentResponse = await intentResult.response;
            const text = intentResponse.text();
            if (text) {
                const keywords = text.split(",").map(k => k.trim());
                if (keywords.length > 0) {
                    query = keywords.join(" ");
                }
            }
        } catch (e) {
            console.error("Intent Analysis Failed:", e);
            // Fallback to original request
        }

        // 2. Search Google Books API
        const booksApiKey = process.env.GOOGLE_BOOKS_API_KEY;

        if (!booksApiKey) {
            console.error("GOOGLE_BOOKS_API_KEY is not defined");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const libraryResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&langRestrict=ko&key=${booksApiKey}`
        );
        const bookData = await libraryResponse.json();

        if (!bookData.items) {
            return NextResponse.json({ items: [] });
        }

        // 3. Filter and Format Books
        const rawBooks: Book[] = bookData.items
            .map((item: GoogleBookItem) => {
                const info = item.volumeInfo;
                return {
                    id: item.id,
                    title: info.title,
                    authors: info.authors || ["Unknown Author"],
                    description: info.description || "No description available.",
                    thumbnail: info.imageLinks?.thumbnail?.replace("http:", "https:") || "",
                    isbn: info.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier || "",
                };
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((book: Book) => book.isbn as any); // Simple filter to ensure ISBN exists

        // Refined filter: Must have ISBN and Thumbnail
        const validBooks = rawBooks.filter(book => book.isbn && book.thumbnail).slice(0, 3);

        // 4. AI Reasoning (The "Why")
        if (process.env.GEMINI_API_KEY && validBooks.length > 0) {
            // New Model for reasoning (using 2.0-flash as 1.5 might be rate limited or just use same)
            const reasoningModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const bookListStr = validBooks.map((b, i) => `${i + 1}. ${b.title} (${b.authors.join(', ')})`).join("\n");

            const reasonPrompt = `
                User Request: "${userRequest}"
                User Emotion: "${userEmotion ? userEmotion.join(', ') : ''}"
                
                I found these books for the user:
                ${bookListStr}

                Please explain WHY each book is a good fit for the user in Korean.
                - Use a friendly, helpful tone (polite yet casual).
                - Focus on benefits relevant to the user's request (e.g., "It's easy to read", "Great for beginners", "Short and impactful").
                - Keep each reason under 2 sentences.
                - CRITICAL: Output ONLY a JSON array of strings. Do not include any other text or markdown formatting.
                
                Example Output:
                ["뇌과학 입문자에게 가장 추천하는 베스트셀러로, 어려운 용어 없이 술술 읽히는 게 장점이에요.", "최신 뇌과학 트렌드를 가볍게 파악하기 좋은 책입니다."]
            `;

            try {
                const result = await reasoningModel.generateContent(reasonPrompt);
                const response = await result.response;
                const text = response.text();

                // Robust JSON parsing
                let reasons: string[] = [];
                try {
                    // Try to extract JSON array from text using regex to ignore markdown blocks
                    const jsonMatch = text.match(/\[.*\]/s);
                    if (jsonMatch) {
                        reasons = JSON.parse(jsonMatch[0]);
                    } else {
                        // Attempt to parse the whole text if no array found (fallback)
                        reasons = JSON.parse(text);
                    }
                } catch (parseError) {
                    console.error("JSON Parse Error:", parseError, "Text:", text);
                    // Fallback: Split by newlines if it looks like a list
                    if (text.includes("\n")) {
                        reasons = text.split("\n").filter(line => line.trim().length > 0).map(line => line.replace(/^\d+\.\s*|- /, "").trim());
                    }
                }

                // Merge reasons
                validBooks.forEach((book, index) => {
                    if (reasons[index]) {
                        book.reason = reasons[index];
                    } else {
                        book.reason = `AI가 추천하는 '${userRequest}' 관련 도서입니다.`;
                    }
                });
            } catch (e) {
                console.error("Gemini Reasoning Failed:", e);
                // Fallback reasoning
                validBooks.forEach((book) => {
                    book.reason = `AI가 추천하는 '${userRequest}' 관련 도서입니다.`;
                });
            }
        } else {
            // Fallback if no API key or no books found
            validBooks.forEach((book) => {
                book.reason = `AI 추천: 요청하신 '${userRequest}'에 적합한 책입니다.`;
            });
        }

        return NextResponse.json({ items: validBooks });

    } catch (error) {
        console.error("Recommendation Error:", error);
        return NextResponse.json({ error: "Failed to process recommendation" }, { status: 500 });
    }
}
