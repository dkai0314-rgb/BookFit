import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    try {
        const pageContent = await prisma.pageContent.findUnique({
            where: { id },
        });

        return NextResponse.json({ id, htmlContent: pageContent?.content || '' });
    } catch (error) {
        console.error('Error fetching page content:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, htmlContent } = body;

        if (!id || htmlContent === undefined) {
            return NextResponse.json({ error: 'Missing id or htmlContent' }, { status: 400 });
        }

        const pageContent = await prisma.pageContent.upsert({
            where: { id },
            update: { content: htmlContent },
            create: { id, content: htmlContent },
        });

        return NextResponse.json({ id, htmlContent: pageContent.content });
    } catch (error) {
        console.error('Error saving page content:', error);
        return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
    }
}
