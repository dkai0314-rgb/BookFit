
import { NextResponse } from 'next/server';
import { getBestsellers } from '@/lib/aladin';

export async function GET() {
    try {
        const books = await getBestsellers();
        return NextResponse.json(books);
    } catch (error) {
        console.error("Bestseller API Error:", error);
        return NextResponse.json({ error: "Failed to fetch bestsellers" }, { status: 500 });
    }
}
