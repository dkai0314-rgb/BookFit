
import { NextResponse } from 'next/server';
import { getBestsellers } from '@/lib/aladin';

export const CATEGORIES = [
    { name: "경제경영", id: 170 },
    { name: "고전", id: 987 },
    { name: "소설/시/희곡", id: 1 },
    { name: "에세이", id: 55889 },
    { name: "역사", id: 74 },
    { name: "인문학", id: 656 },
    { name: "자기계발", id: 336 }
];

export async function GET() {
    try {
        const results = await Promise.all(
            CATEGORIES.map(async (category) => {
                const books = await getBestsellers(category.id);
                return { category: category.name, books };
            })
        );
        return NextResponse.json(results);
    } catch (error) {
        console.error("Bestseller API Error:", error);
        return NextResponse.json({ error: "Failed to fetch bestsellers" }, { status: 500 });
    }
}
